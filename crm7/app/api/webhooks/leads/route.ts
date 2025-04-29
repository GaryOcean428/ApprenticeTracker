import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Webhook handler for receiving lead updates from the website
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_type, lead_data } = body;
    
    if (!event_type || !lead_data) {
      return NextResponse.json(
        { error: 'Missing required fields: event_type and lead_data are required' },
        { status: 400 }
      );
    }
    
    // Handle different event types
    switch (event_type) {
      case 'lead_created':
        return handleLeadCreated(lead_data);
      
      case 'lead_updated':
        return handleLeadUpdated(lead_data);
        
      case 'lead_deleted':
        return handleLeadDeleted(lead_data);
        
      default:
        return NextResponse.json(
          { error: `Unknown event type: ${event_type}` },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook', details: error },
      { status: 500 }
    );
  }
}

// Handle lead creation events
async function handleLeadCreated(lead_data) {
  try {
    // Check if lead already exists with the same website_lead_id
    if (lead_data.metadata?.website_lead_id) {
      const existingLead = await prisma.leads.findFirst({
        where: {
          metadata: {
            path: ['website_lead_id'],
            equals: lead_data.metadata.website_lead_id
          }
        }
      });
      
      if (existingLead) {
        return NextResponse.json(
          { message: 'Lead already exists', lead_id: existingLead.id },
          { status: 200 }
        );
      }
    }
    
    // Create new lead
    const lead = await prisma.leads.create({
      data: {
        first_name: lead_data.first_name,
        last_name: lead_data.last_name,
        email: lead_data.email,
        phone: lead_data.phone || null,
        company: lead_data.company || null,
        job_title: lead_data.job_title || null,
        message: lead_data.message || null,
        service_interest: lead_data.service_interest || [],
        source: lead_data.source || 'website',
        status: 'new',
        tags: lead_data.tags || [],
        metadata: lead_data.metadata || {},
      },
    });
    
    // Create follow-up task
    const task = await prisma.tasks.create({
      data: {
        title: `Follow up with ${lead_data.first_name} ${lead_data.last_name}`,
        description: `Initial follow-up for new lead from ${lead_data.source || 'website'}`,
        status: 'pending',
        priority: 'medium',
        lead_id: lead.id,
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      lead_id: lead.id,
      task_id: task.id,
      message: 'Lead created successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating lead from webhook:', error);
    return NextResponse.json(
      { error: 'Failed to create lead', details: error },
      { status: 500 }
    );
  }
}

// Handle lead update events
async function handleLeadUpdated(lead_data) {
  try {
    let leadId;
    
    // Find lead by website_lead_id in metadata
    if (lead_data.metadata?.website_lead_id) {
      const existingLead = await prisma.leads.findFirst({
        where: {
          metadata: {
            path: ['website_lead_id'],
            equals: lead_data.metadata.website_lead_id
          }
        }
      });
      
      if (existingLead) {
        leadId = existingLead.id;
      }
    }
    
    // If not found by website_lead_id, try by email
    if (!leadId && lead_data.email) {
      const existingLead = await prisma.leads.findFirst({
        where: { email: lead_data.email }
      });
      
      if (existingLead) {
        leadId = existingLead.id;
      }
    }
    
    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead not found for update' },
        { status: 404 }
      );
    }
    
    // Update lead
    const updatedLead = await prisma.leads.update({
      where: { id: leadId },
      data: {
        first_name: lead_data.first_name,
        last_name: lead_data.last_name,
        email: lead_data.email,
        phone: lead_data.phone || null,
        company: lead_data.company || null,
        job_title: lead_data.job_title || null,
        message: lead_data.message || null,
        service_interest: lead_data.service_interest || [],
        tags: lead_data.tags || [],
        updated_at: new Date(),
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      lead_id: updatedLead.id,
      message: 'Lead updated successfully' 
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating lead from webhook:', error);
    return NextResponse.json(
      { error: 'Failed to update lead', details: error },
      { status: 500 }
    );
  }
}

// Handle lead deletion events
async function handleLeadDeleted(lead_data) {
  try {
    let leadId;
    
    // Find lead by website_lead_id in metadata
    if (lead_data.metadata?.website_lead_id) {
      const existingLead = await prisma.leads.findFirst({
        where: {
          metadata: {
            path: ['website_lead_id'],
            equals: lead_data.metadata.website_lead_id
          }
        }
      });
      
      if (existingLead) {
        leadId = existingLead.id;
      }
    }
    
    // If not found by website_lead_id, try by email
    if (!leadId && lead_data.email) {
      const existingLead = await prisma.leads.findFirst({
        where: { email: lead_data.email }
      });
      
      if (existingLead) {
        leadId = existingLead.id;
      }
    }
    
    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead not found for deletion' },
        { status: 404 }
      );
    }
    
    // Archive lead instead of deleting
    const archivedLead = await prisma.leads.update({
      where: { id: leadId },
      data: {
        status: 'archived',
        updated_at: new Date(),
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      lead_id: archivedLead.id,
      message: 'Lead archived successfully' 
    }, { status: 200 });
  } catch (error) {
    console.error('Error archiving lead from webhook:', error);
    return NextResponse.json(
      { error: 'Failed to archive lead', details: error },
      { status: 500 }
    );
  }
}
