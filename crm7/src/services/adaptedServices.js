import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Adapted lead service to work with existing database schema
export const leadService = {
  // Get all leads with pagination and filtering
  async getLeads(page = 1, limit = 10, filters = {}, search = '') {
    const skip = (page - 1) * limit;
    
    // Build filter conditions
    let where = {};
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.source) {
      where.source = filters.source;
    }
    
    if (search) {
      where.OR = [
        { first_name: { contains: search, mode: 'insensitive' } },
        { last_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Get leads with pagination
    const leads = await prisma.leads.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        tasks: true
      }
    });
    
    // Get total count for pagination
    const total = await prisma.leads.count({ where });
    
    return {
      leads,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },
  
  // Get a single lead by ID
  async getLeadById(id) {
    return prisma.leads.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { due_date: 'asc' }
        }
      }
    });
  },
  
  // Create a new lead
  async createLead(leadData) {
    // Create the lead
    const lead = await prisma.leads.create({
      data: {
        first_name: leadData.first_name,
        last_name: leadData.last_name,
        email: leadData.email,
        phone: leadData.phone || null,
        company: leadData.company || null,
        job_title: leadData.job_title || null,
        message: leadData.message || null,
        service_interest: leadData.service_interest || [],
        source: leadData.source || 'website',
        status: 'new',
        tags: leadData.tags || [],
        metadata: leadData.metadata || {},
      },
    });
    
    // Assign to staff member and create follow-up task
    const staffId = await this.assignLeadToStaff(lead.id);
    
    if (staffId) {
      const task = await prisma.tasks.create({
        data: {
          lead_id: lead.id,
          assigned_to: staffId,
          title: `Follow up with ${leadData.first_name} ${leadData.last_name}`,
          description: `Initial follow-up for new lead from ${leadData.source || 'website'}`,
          status: 'pending',
          priority: 'medium',
          due_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        },
      });
      
      return { lead, task };
    }
    
    return { lead };
  },
  
  // Update an existing lead
  async updateLead(id, leadData) {
    return prisma.leads.update({
      where: { id },
      data: {
        first_name: leadData.first_name,
        last_name: leadData.last_name,
        email: leadData.email,
        phone: leadData.phone,
        company: leadData.company,
        job_title: leadData.job_title,
        message: leadData.message,
        service_interest: leadData.service_interest,
        status: leadData.status,
        tags: leadData.tags,
        updated_at: new Date(),
      },
    });
  },
  
  // Archive a lead (soft delete)
  async archiveLead(id) {
    return prisma.leads.update({
      where: { id },
      data: {
        status: 'archived',
        updated_at: new Date(),
      },
    });
  },
  
  // Assign a lead to a staff member
  async assignLeadToStaff(leadId) {
    // Use the database function to assign lead to staff
    const { data, error } = await supabase.rpc('assign_lead_to_staff', {
      lead_id: leadId
    });
    
    if (error) {
      console.error('Error assigning lead to staff:', error);
      return null;
    }
    
    return data;
  },
  
  // Get lead statistics for dashboard
  async getLeadStats() {
    // Total leads
    const totalLeads = await prisma.leads.count();
    
    // New leads this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const newLeadsThisWeek = await prisma.leads.count({
      where: {
        created_at: {
          gte: oneWeekAgo
        }
      }
    });
    
    // Leads by status
    const leadsByStatus = await prisma.$queryRaw`
      SELECT status, COUNT(*) as count
      FROM leads
      GROUP BY status
    `;
    
    // Leads by source
    const leadsBySource = await prisma.$queryRaw`
      SELECT source, COUNT(*) as count
      FROM leads
      GROUP BY source
    `;
    
    // Monthly lead trends
    const monthlyTrends = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as count
      FROM leads
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `;
    
    return {
      totalLeads,
      newLeadsThisWeek,
      leadsByStatus,
      leadsBySource,
      monthlyTrends
    };
  }
};

// Adapted task service to work with existing database schema
export const taskService = {
  // Get tasks for a lead
  async getTasksForLead(leadId) {
    return prisma.tasks.findMany({
      where: { lead_id: leadId },
      orderBy: { due_date: 'asc' }
    });
  },
  
  // Get tasks assigned to a staff member
  async getTasksForStaff(staffId, status = null) {
    const where = { assigned_to: staffId };
    
    if (status) {
      where.status = status;
    }
    
    return prisma.tasks.findMany({
      where,
      orderBy: { due_date: 'asc' },
      include: {
        lead: true
      }
    });
  },
  
  // Create a new task
  async createTask(taskData) {
    return prisma.tasks.create({
      data: {
        lead_id: taskData.lead_id,
        assigned_to: taskData.assigned_to,
        title: taskData.title,
        description: taskData.description || null,
        status: taskData.status || 'pending',
        priority: taskData.priority || 'medium',
        due_date: taskData.due_date,
      }
    });
  },
  
  // Update a task
  async updateTask(id, taskData) {
    return prisma.tasks.update({
      where: { id },
      data: {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        due_date: taskData.due_date,
        assigned_to: taskData.assigned_to,
        updated_at: new Date(),
        completed_at: taskData.status === 'completed' ? new Date() : null
      }
    });
  },
  
  // Complete a task
  async completeTask(id) {
    return prisma.tasks.update({
      where: { id },
      data: {
        status: 'completed',
        completed_at: new Date(),
        updated_at: new Date()
      }
    });
  },
  
  // Delete a task
  async deleteTask(id) {
    return prisma.tasks.delete({
      where: { id }
    });
  },
  
  // Get upcoming tasks
  async getUpcomingTasks(limit = 5) {
    return prisma.tasks.findMany({
      where: {
        status: 'pending',
        due_date: {
          gte: new Date()
        }
      },
      orderBy: { due_date: 'asc' },
      take: limit,
      include: {
        lead: true
      }
    });
  },
  
  // Get overdue tasks
  async getOverdueTasks() {
    const now = new Date();
    
    return prisma.tasks.findMany({
      where: {
        status: 'pending',
        due_date: {
          lt: now
        }
      },
      orderBy: { due_date: 'asc' },
      include: {
        lead: true
      }
    });
  }
};

// Adapted staff service to work with existing user/role system
export const staffService = {
  // Get all staff members
  async getStaffMembers() {
    // Use the staff_view we created
    const { data, error } = await supabase
      .from('staff_view')
      .select('*');
      
    if (error) {
      console.error('Error fetching staff members:', error);
      return [];
    }
    
    return data;
  },
  
  // Get a staff member by ID
  async getStaffMemberById(id) {
    const { data, error } = await supabase
      .from('staff_view')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching staff member:', error);
      return null;
    }
    
    return data;
  },
  
  // Get staff workload (number of pending tasks)
  async getStaffWorkload() {
    const { data: staff, error: staffError } = await supabase
      .from('staff_view')
      .select('*');
      
    if (staffError) {
      console.error('Error fetching staff members:', staffError);
      return [];
    }
    
    // Get task counts for each staff member
    const staffIds = staff.map(s => s.id);
    
    const taskCounts = await prisma.tasks.groupBy({
      by: ['assigned_to'],
      where: {
        assigned_to: {
          in: staffIds
        },
        status: 'pending'
      },
      _count: {
        id: true
      }
    });
    
    // Combine staff data with task counts
    return staff.map(staffMember => {
      const taskCount = taskCounts.find(tc => tc.assigned_to === staffMember.id);
      return {
        ...staffMember,
        pendingTasks: taskCount ? taskCount._count.id : 0
      };
    });
  },
  
  // Find the best staff member for a lead based on service interest
  async findBestStaffForLead(lead) {
    // This would normally match staff specialties with lead interests
    // For now, we'll just get the staff member with the least workload
    const staffWorkload = await this.getStaffWorkload();
    
    if (staffWorkload.length === 0) {
      return null;
    }
    
    // Sort by pending tasks (ascending)
    staffWorkload.sort((a, b) => a.pendingTasks - b.pendingTasks);
    
    return staffWorkload[0];
  }
};
