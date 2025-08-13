import type express from 'express';
import { sql } from 'drizzle-orm';
import {
  whs_incidents,
  whs_witnesses,
  whs_documents,
  insertIncidentSchema,
  updateIncidentSchema,
  insertWitnessSchema,
  insertDocumentSchema,
} from '@shared/schema/whs';
import { db } from '../../db';
import { hasPermission } from '../../middleware/auth';

export function setupIncidentRoutes(router: express.Router) {
  // GET all incidents
  router.get('/incidents', async (req, res) => {
    try {
      // Parse query parameters for pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      // Get incidents with pagination
      const incidents = await db
        .select()
        .from(whs_incidents)
        .limit(limit)
        .offset(offset)
        .orderBy(sql`${whs_incidents.date_occurred} DESC`);

      // Get total count for pagination
      const countResult = await db
        .select({
          count: sql`count(*)::int`,
        })
        .from(whs_incidents);

      const count = countResult[0]?.count || 0;

      res.json({
        incidents,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(Number(count) / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching incidents:', error);
      res.status(500).json({ message: 'Failed to fetch incidents' });
    }
  });

  // GET incident by ID
  router.get('/incidents/:id', async (req, res) => {
    try {
      const id = req.params.id;

      // Get incident
      const [incident] = await db
        .select()
        .from(whs_incidents)
        .where(sql`${whs_incidents.id} = ${id}`);

      if (!incident) {
        return res.status(404).json({ message: 'Incident not found' });
      }

      // Get witnesses
      const witnesses = await db
        .select()
        .from(whs_witnesses)
        .where(sql`${whs_witnesses.incident_id} = ${id}`);

      // Get documents
      const documents = await db
        .select()
        .from(whs_documents)
        .where(sql`${whs_documents.incident_id} = ${id}`);

      res.json({
        incident,
        witnesses,
        documents,
      });
    } catch (error) {
      console.error('Error fetching incident:', error);
      res.status(500).json({ message: 'Failed to fetch incident details' });
    }
  });

  // CREATE new incident
  router.post('/incidents', hasPermission('whs.create_incident'), async (req, res) => {
    try {
      const validatedData = insertIncidentSchema.parse(req.body);

      // Create incident
      const [newIncident] = await db.insert(whs_incidents).values(validatedData).returning();

      res.status(201).json(newIncident);
    } catch (error) {
      console.error('Error creating incident:', error);
      res.status(400).json({
        message: 'Failed to create incident',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // UPDATE incident
  router.patch('/incidents/:id', hasPermission('whs.update_incident'), async (req, res) => {
    try {
      const id = req.params.id;

      // Ensure incident exists
      const [existingIncident] = await db
        .select()
        .from(whs_incidents)
        .where(sql`${whs_incidents.id} = ${id}`);

      if (!existingIncident) {
        return res.status(404).json({ message: 'Incident not found' });
      }

      const validatedData = updateIncidentSchema.parse(req.body);

      // Update incident
      const [updatedIncident] = await db
        .update(whs_incidents)
        .set(validatedData)
        .where(sql`${whs_incidents.id} = ${id}`)
        .returning();

      res.json(updatedIncident);
    } catch (error) {
      console.error('Error updating incident:', error);
      res.status(400).json({ message: 'Failed to update incident' });
    }
  });

  // WORKFLOW: Transition incident status
  router.patch('/incidents/:id/status', hasPermission('whs.update_incident'), async (req, res) => {
    try {
      const id = req.params.id;
      const { status, notes, notifyStakeholders = false } = req.body;

      // Validate status transition
      const validStatuses = [
        'reported', 'investigating', 'action-required', 'remediation-in-progress',
        'pending-review', 'resolved', 'closed', 'escalated', 'requires-followup'
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status transition' });
      }

      // Get current incident
      const [currentIncident] = await db
        .select()
        .from(whs_incidents)
        .where(sql`${whs_incidents.id} = ${id}`);

      if (!currentIncident) {
        return res.status(404).json({ message: 'Incident not found' });
      }

      // Update incident status
      const updateData: any = { 
        status,
        updated_at: new Date()
      };

      // Set resolution date if resolved/closed
      if (status === 'resolved' || status === 'closed') {
        updateData.resolution_date = new Date();
        if (notes) {
          updateData.resolution_details = notes;
        }
      }

      const [updatedIncident] = await db
        .update(whs_incidents)
        .set(updateData)
        .where(sql`${whs_incidents.id} = ${id}`)
        .returning();

      // Send notifications if requested
      if (notifyStakeholders) {
        await sendIncidentStatusNotifications(updatedIncident, currentIncident.status, status);
      }

      res.json(updatedIncident);
    } catch (error) {
      console.error('Error updating incident status:', error);
      res.status(400).json({ message: 'Failed to update incident status' });
    }
  });

  // REPORTING: Get incident reports with filters
  router.get('/incidents/reports', async (req, res) => {
    try {
      const {
        startDate,
        endDate,
        status,
        severity,
        hostEmployer,
        format = 'json'
      } = req.query;

      let query = db.select().from(whs_incidents);

      // Apply filters
      if (startDate && endDate) {
        query = query.where(
          sql`${whs_incidents.date_occurred} BETWEEN ${startDate} AND ${endDate}`
        );
      }

      if (status) {
        query = query.where(sql`${whs_incidents.status} = ${status}`);
      }

      if (severity) {
        query = query.where(sql`${whs_incidents.severity} = ${severity}`);
      }

      if (hostEmployer) {
        query = query.where(sql`${whs_incidents.host_employer_id} = ${hostEmployer}`);
      }

      const incidents = await query.orderBy(sql`${whs_incidents.date_occurred} DESC`);

      // Generate summary statistics
      const totalIncidents = incidents.length;
      const statusCounts = incidents.reduce((acc: any, incident) => {
        acc[incident.status] = (acc[incident.status] || 0) + 1;
        return acc;
      }, {});

      const severityCounts = incidents.reduce((acc: any, incident) => {
        acc[incident.severity] = (acc[incident.severity] || 0) + 1;
        return acc;
      }, {});

      const reportData = {
        incidents,
        summary: {
          totalIncidents,
          statusCounts,
          severityCounts,
          reportGeneratedAt: new Date().toISOString()
        }
      };

      if (format === 'pdf') {
        // Generate PDF report
        const pdfBuffer = await generateIncidentPDFReport(reportData);
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename=incidents-report-${new Date().toISOString().split('T')[0]}.pdf`
        });
        return res.send(pdfBuffer);
      }

      if (format === 'excel') {
        // Generate Excel report
        const excelBuffer = await generateIncidentExcelReport(reportData);
        res.set({
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename=incidents-report-${new Date().toISOString().split('T')[0]}.xlsx`
        });
        return res.send(excelBuffer);
      }

      res.json(reportData);
    } catch (error) {
      console.error('Error generating incident report:', error);
      res.status(500).json({ message: 'Failed to generate report' });
    }
  });

  // DASHBOARD: Get WHS metrics for dashboard
  router.get('/incidents/metrics', async (req, res) => {
    try {
      const { timeframe = '30days' } = req.query;
      
      const daysAgo = timeframe === '7days' ? 7 : timeframe === '90days' ? 90 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Get incident counts and trends
      const recentIncidents = await db
        .select()
        .from(whs_incidents)
        .where(sql`${whs_incidents.date_occurred} >= ${startDate}`)
        .orderBy(sql`${whs_incidents.date_occurred} DESC`);

      const totalIncidents = recentIncidents.length;
      const openIncidents = recentIncidents.filter(i => 
        !['resolved', 'closed'].includes(i.status)
      ).length;

      const highSeverityIncidents = recentIncidents.filter(i => 
        i.severity === 'high'
      ).length;

      // Calculate trends (compare to previous period)
      const previousPeriodStart = new Date(startDate);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - daysAgo);
      
      const previousIncidents = await db
        .select()
        .from(whs_incidents)
        .where(sql`${whs_incidents.date_occurred} BETWEEN ${previousPeriodStart} AND ${startDate}`);

      const incidentTrend = totalIncidents - previousIncidents.length;

      res.json({
        metrics: {
          totalIncidents,
          openIncidents,
          highSeverityIncidents,
          incidentTrend,
          resolvedRate: totalIncidents > 0 ? 
            Math.round(((totalIncidents - openIncidents) / totalIncidents) * 100) : 0
        },
        chartData: generateIncidentChartData(recentIncidents),
        recentActivity: recentIncidents.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching WHS metrics:', error);
      res.status(500).json({ message: 'Failed to fetch metrics' });
    }
  });

  // DELETE incident
  router.delete('/incidents/:id', hasPermission('whs.delete_incident'), async (req, res) => {
    try {
      const id = req.params.id;

      // Delete incident
      await db.delete(whs_incidents).where(sql`${whs_incidents.id} = ${id}`);

      res.status(204).end();
    } catch (error) {
      console.error('Error deleting incident:', error);
      res.status(500).json({ message: 'Failed to delete incident' });
    }
  });

  // Add witness to incident
  router.post(
    '/incidents/:incidentId/witnesses',
    hasPermission('whs.update_incident'),
    async (req, res) => {
      try {
        const incidentId = req.params.incidentId;

        // Ensure incident exists
        const [existingIncident] = await db
          .select()
          .from(whs_incidents)
          .where(sql`${whs_incidents.id} = ${incidentId}`);

        if (!existingIncident) {
          return res.status(404).json({ message: 'Incident not found' });
        }

        const witnessData = insertWitnessSchema.parse({
          ...req.body,
          incident_id: incidentId,
        });

        // Create witness
        const [newWitness] = await db.insert(whs_witnesses).values(witnessData).returning();

        res.status(201).json(newWitness);
      } catch (error) {
        console.error('Error adding witness:', error);
        res.status(400).json({ message: 'Failed to add witness' });
      }
    }
  );

  // Add document to incident
  router.post(
    '/incidents/:incidentId/documents',
    hasPermission('whs.update_incident'),
    async (req, res) => {
      try {
        const incidentId = req.params.incidentId;

        // Ensure incident exists
        const [existingIncident] = await db
          .select()
          .from(whs_incidents)
          .where(sql`${whs_incidents.id} = ${incidentId}`);

        if (!existingIncident) {
          return res.status(404).json({ message: 'Incident not found' });
        }

        const documentData = insertDocumentSchema.parse({
          ...req.body,
          incident_id: incidentId,
        });

        // Create document
        const [newDocument] = await db.insert(whs_documents).values(documentData).returning();

        res.status(201).json(newDocument);
      } catch (error) {
        console.error('Error adding document:', error);
        res.status(400).json({ message: 'Failed to add document' });
      }
    }
  );

  // Delete witness
  router.delete(
    '/incidents/witnesses/:id',
    hasPermission('whs.update_incident'),
    async (req, res) => {
      try {
        const id = req.params.id;

        // Delete witness
        await db.delete(whs_witnesses).where(sql`${whs_witnesses.id} = ${id}`);

        res.status(204).end();
      } catch (error) {
        console.error('Error deleting witness:', error);
        res.status(500).json({ message: 'Failed to delete witness' });
      }
    }
  );
}

// Helper function to send incident status notifications
async function sendIncidentStatusNotifications(
  incident: any, 
  previousStatus: string, 
  newStatus: string
) {
  try {
    // In a real implementation, this would integrate with your notification system
    // For now, we'll just log the notification
    console.log(`[WHS_NOTIFICATION] Incident ${incident.id} status changed from ${previousStatus} to ${newStatus}`);
    
    // Notify relevant stakeholders based on incident details
    const notifications = [];
    
    if (incident.reporter_id) {
      notifications.push({
        userId: incident.reporter_id,
        type: 'incident_status_update',
        message: `Incident "${incident.title}" status updated to ${newStatus}`,
        incidentId: incident.id
      });
    }

    if (incident.host_employer_id && ['resolved', 'closed'].includes(newStatus)) {
      notifications.push({
        hostEmployerId: incident.host_employer_id,
        type: 'incident_resolved',
        message: `WHS incident at your facility has been ${newStatus}`,
        incidentId: incident.id
      });
    }

    // Save notifications to database or send via email/SMS
    // This is a placeholder for actual notification implementation
    console.log(`Generated ${notifications.length} notifications for incident ${incident.id}`);
    
    return notifications;
  } catch (error) {
    console.error('Error sending incident notifications:', error);
  }
}

// Helper function to generate PDF reports
async function generateIncidentPDFReport(reportData: any): Promise<Buffer> {
  try {
    // This is a placeholder implementation
    // In a real system, you'd use a PDF generation library like puppeteer or jsPDF
    
    const reportContent = `
WHS Incidents Report
Generated: ${reportData.summary.reportGeneratedAt}

Summary:
- Total Incidents: ${reportData.summary.totalIncidents}
- By Status: ${Object.entries(reportData.summary.statusCounts).map(([status, count]) => `${status}: ${count}`).join(', ')}
- By Severity: ${Object.entries(reportData.summary.severityCounts).map(([severity, count]) => `${severity}: ${count}`).join(', ')}

Incidents:
${reportData.incidents.map((incident: any) => `
- ${incident.title} (${incident.status})
  Date: ${incident.date_occurred}
  Severity: ${incident.severity}
  Location: ${incident.location}
`).join('')}
    `;
    
    // For now, return a simple buffer with the report content
    // In production, use a proper PDF generation library
    return Buffer.from(reportContent, 'utf-8');
  } catch (error) {
    console.error('Error generating PDF report:', error);
    throw new Error('Failed to generate PDF report');
  }
}

// Helper function to generate Excel reports  
async function generateIncidentExcelReport(reportData: any): Promise<Buffer> {
  try {
    // This is a placeholder implementation
    // In a real system, you'd use a library like exceljs
    
    const csvContent = [
      'Title,Status,Severity,Date Occurred,Location,Reporter,Description',
      ...reportData.incidents.map((incident: any) => 
        `"${incident.title}","${incident.status}","${incident.severity}","${incident.date_occurred}","${incident.location}","${incident.reporter_name || ''}","${(incident.description || '').replace(/"/g, '""')}"`
      )
    ].join('\n');
    
    // For now, return CSV format as a buffer
    // In production, generate actual Excel format
    return Buffer.from(csvContent, 'utf-8');
  } catch (error) {
    console.error('Error generating Excel report:', error);
    throw new Error('Failed to generate Excel report');
  }
}

// Helper function to generate chart data for dashboard
function generateIncidentChartData(incidents: any[]) {
  try {
    // Generate data for the last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const incidentsByDate = incidents.reduce((acc: any, incident) => {
      const date = incident.date_occurred.split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const chartData = last30Days.map(date => ({
      date,
      incidents: incidentsByDate[date] || 0
    }));

    // Status distribution
    const statusDistribution = incidents.reduce((acc: any, incident) => {
      acc[incident.status] = (acc[incident.status] || 0) + 1;
      return acc;
    }, {});

    // Severity distribution
    const severityDistribution = incidents.reduce((acc: any, incident) => {
      acc[incident.severity] = (acc[incident.severity] || 0) + 1;
      return acc;
    }, {});

    return {
      timeline: chartData,
      statusDistribution: Object.entries(statusDistribution).map(([status, count]) => ({
        status,
        count
      })),
      severityDistribution: Object.entries(severityDistribution).map(([severity, count]) => ({
        severity, 
        count
      }))
    };
  } catch (error) {
    console.error('Error generating chart data:', error);
    return {
      timeline: [],
      statusDistribution: [],
      severityDistribution: []
    };
  }
}
