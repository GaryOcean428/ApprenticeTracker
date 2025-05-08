import express from 'express';
import { isAuthenticated, hasPermission } from '../../middleware/auth';
import logger from '../../utils/logger';
import { db } from '../../db';
import { sql } from 'drizzle-orm';

const router = express.Router();

// Apply authentication middleware to all WHS routes
router.use(isAuthenticated);

/**
 * @route GET /api/whs/incidents
 * @desc Get all WHS incidents with pagination, filtering, and sorting
 * @access Private (requires authentication)
 */
router.get('/incidents', hasPermission('whs:read'), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'date_reported', 
      order = 'desc',
      type,
      severity,
      status,
      startDate,
      endDate,
      search
    } = req.query;

    const pageNumber = parseInt(page as string);
    const pageSize = parseInt(limit as string);
    const offset = (pageNumber - 1) * pageSize;

    // Build the conditions for filtering
    let conditions = [];
    let params: any[] = [];
    
    if (type) {
      conditions.push(`type = $${params.length + 1}`);
      params.push(type);
    }
    
    if (severity) {
      conditions.push(`severity = $${params.length + 1}`);
      params.push(severity);
    }
    
    if (status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }
    
    if (startDate) {
      conditions.push(`date_occurred >= $${params.length + 1}`);
      params.push(startDate);
    }
    
    if (endDate) {
      conditions.push(`date_occurred <= $${params.length + 1}`);
      params.push(endDate);
    }
    
    if (search) {
      conditions.push(`(title ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }

    // Construct the WHERE clause
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Construct the ORDER BY clause
    const validSortFields = ['date_reported', 'date_occurred', 'title', 'severity', 'status'];
    const sortField = validSortFields.includes(sort as string) ? sort : 'date_reported';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
    
    // Query for incidents with pagination
    const incidentsQuery = `
      SELECT i.*,
        (SELECT COUNT(*) FROM whs_incident_witnesses WHERE incident_id = i.id) as witness_count,
        (SELECT COUNT(*) FROM whs_incident_documents WHERE incident_id = i.id) as document_count,
        (SELECT username FROM users WHERE id = i.reporter_id) as reporter_name,
        (SELECT username FROM users WHERE id = i.assigned_to) as assigned_to_name,
        (SELECT name FROM apprentices WHERE id = i.apprentice_id) as apprentice_name,
        (SELECT business_name FROM host_employers WHERE id = i.host_employer_id) as host_employer_name
      FROM whs_incidents i
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    params.push(pageSize, offset);
    
    // Query for total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM whs_incidents
      ${whereClause}
    `;
    
    // Execute both queries
    const incidents = await db.execute(sql.raw(incidentsQuery, params));
    const totalResult = await db.execute(sql.raw(countQuery, params.slice(0, params.length - 2)));
    
    const total = parseInt(totalResult.rows[0].total as string);
    const totalPages = Math.ceil(total / pageSize);
    
    res.json({
      incidents: incidents.rows,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages
      }
    });
  } catch (error) {
    logger.error('Error fetching WHS incidents: ' + (error instanceof Error ? error.message : String(error)));
    res.status(500).json({ message: 'Error fetching WHS incidents' });
  }
});

/**
 * @route GET /api/whs/incidents/:id
 * @desc Get a WHS incident by ID
 * @access Private (requires authentication)
 */
router.get('/incidents/:id', hasPermission('whs:read'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const incident = await db.execute(sql`
      SELECT i.*,
        (SELECT username FROM users WHERE id = i.reporter_id) as reporter_name,
        (SELECT username FROM users WHERE id = i.assigned_to) as assigned_to_name,
        (SELECT name FROM apprentices WHERE id = i.apprentice_id) as apprentice_name,
        (SELECT business_name FROM host_employers WHERE id = i.host_employer_id) as host_employer_name
      FROM whs_incidents i
      WHERE i.id = ${id}
    `);

    if (!incident.rows.length) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    // Get witnesses
    const witnesses = await db.execute(sql`
      SELECT * FROM whs_incident_witnesses
      WHERE incident_id = ${id}
      ORDER BY created_at DESC
    `);

    // Get documents
    const documents = await db.execute(sql`
      SELECT d.* FROM whs_incident_documents wid
      JOIN documents d ON wid.document_id = d.id
      WHERE wid.incident_id = ${id}
      ORDER BY wid.created_at DESC
    `);

    res.json({
      incident: incident.rows[0],
      witnesses: witnesses.rows,
      documents: documents.rows
    });
  } catch (error) {
    logger.error('Error fetching WHS incident details: ' + (error instanceof Error ? error.message : String(error)));
    res.status(500).json({ message: 'Error fetching WHS incident details' });
  }
});

/**
 * @route POST /api/whs/incidents
 * @desc Create a new WHS incident
 * @access Private (requires authentication)
 */
router.post('/incidents', hasPermission('whs:create'), async (req, res) => {
  try {
    const {
      title,
      type,
      severity,
      location,
      date_occurred,
      description,
      immediate_actions,
      reporter_id,
      apprentice_id,
      host_employer_id,
      status,
      assigned_to,
      notifiable_incident,
      witnesses
    } = req.body;

    // Validate required fields
    if (!title || !type || !severity || !location || !date_occurred || !description) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    // Set default status if not provided
    const incidentStatus = status || 'reported';
    
    // Insert incident
    const result = await db.execute(sql`
      INSERT INTO whs_incidents (
        title, type, severity, location, 
        date_occurred, description, immediate_actions,
        reporter_id, apprentice_id, host_employer_id,
        status, assigned_to, notifiable_incident
      )
      VALUES (
        ${title}, ${type}, ${severity}, ${location},
        ${date_occurred}, ${description}, ${immediate_actions || null},
        ${reporter_id || null}, ${apprentice_id || null}, ${host_employer_id || null},
        ${incidentStatus}, ${assigned_to || null}, ${notifiable_incident || false}
      )
      RETURNING id
    `);

    const incidentId = result.rows[0].id;

    // Insert witnesses if provided
    if (witnesses && Array.isArray(witnesses) && witnesses.length > 0) {
      for (const witness of witnesses) {
        await db.execute(sql`
          INSERT INTO whs_incident_witnesses (
            incident_id, name, contact, statement
          )
          VALUES (
            ${incidentId}, ${witness.name}, ${witness.contact}, ${witness.statement || null}
          )
        `);
      }
    }

    res.status(201).json({ 
      message: 'WHS incident created successfully', 
      incidentId,
      success: true
    });
  } catch (error) {
    logger.error('Error creating WHS incident: ' + (error instanceof Error ? error.message : String(error)));
    res.status(500).json({ message: 'Error creating WHS incident' });
  }
});

/**
 * @route PUT /api/whs/incidents/:id
 * @desc Update a WHS incident
 * @access Private (requires authentication)
 */
router.put('/incidents/:id', hasPermission('whs:update'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      type,
      severity,
      location,
      date_occurred,
      description,
      immediate_actions,
      reporter_id,
      apprentice_id,
      host_employer_id,
      status,
      assigned_to,
      investigation_notes,
      resolution_details,
      resolution_date,
      notifiable_incident,
      authority_notified,
      authority_reference
    } = req.body;

    // Check if the incident exists
    const checkResult = await db.execute(sql`
      SELECT id FROM whs_incidents WHERE id = ${id}
    `);

    if (!checkResult.rows.length) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    // Update incident
    await db.execute(sql`
      UPDATE whs_incidents
      SET
        title = COALESCE(${title}, title),
        type = COALESCE(${type}, type),
        severity = COALESCE(${severity}, severity),
        location = COALESCE(${location}, location),
        date_occurred = COALESCE(${date_occurred}, date_occurred),
        description = COALESCE(${description}, description),
        immediate_actions = ${immediate_actions},
        reporter_id = ${reporter_id},
        apprentice_id = ${apprentice_id},
        host_employer_id = ${host_employer_id},
        status = COALESCE(${status}, status),
        assigned_to = ${assigned_to},
        investigation_notes = ${investigation_notes},
        resolution_details = ${resolution_details},
        resolution_date = ${resolution_date},
        notifiable_incident = COALESCE(${notifiable_incident}, notifiable_incident),
        authority_notified = COALESCE(${authority_notified}, authority_notified),
        authority_reference = ${authority_reference},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `);

    res.json({ 
      message: 'WHS incident updated successfully',
      success: true
    });
  } catch (error) {
    logger.error('Error updating WHS incident: ' + (error instanceof Error ? error.message : String(error)));
    res.status(500).json({ message: 'Error updating WHS incident' });
  }
});

/**
 * @route DELETE /api/whs/incidents/:id
 * @desc Delete a WHS incident
 * @access Private (requires authentication)
 */
router.delete('/incidents/:id', hasPermission('whs:delete'), async (req, res) => {
  try {
    const { id } = req.params;

    // Delete incident (this will cascade delete witnesses and documents)
    const result = await db.execute(sql`
      DELETE FROM whs_incidents
      WHERE id = ${id}
      RETURNING id
    `);

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    res.json({ 
      message: 'WHS incident deleted successfully',
      success: true
    });
  } catch (error) {
    logger.error('Error deleting WHS incident: ' + (error instanceof Error ? error.message : String(error)));
    res.status(500).json({ message: 'Error deleting WHS incident' });
  }
});

// Risk Assessments

/**
 * @route GET /api/whs/risk-assessments
 * @desc Get all WHS risk assessments with pagination, filtering, and sorting
 * @access Private (requires authentication)
 */
router.get('/risk-assessments', hasPermission('whs:read'), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'assessment_date', 
      order = 'desc',
      status,
      hostEmployerId,
      search
    } = req.query;

    const pageNumber = parseInt(page as string);
    const pageSize = parseInt(limit as string);
    const offset = (pageNumber - 1) * pageSize;

    // Build the conditions for filtering
    let conditions = [];
    let params: any[] = [];
    
    if (status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }
    
    if (hostEmployerId) {
      conditions.push(`host_employer_id = $${params.length + 1}`);
      params.push(hostEmployerId);
    }
    
    if (search) {
      conditions.push(`(title ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }

    // Construct the WHERE clause
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Construct the ORDER BY clause
    const validSortFields = ['assessment_date', 'title', 'review_date', 'status'];
    const sortField = validSortFields.includes(sort as string) ? sort : 'assessment_date';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
    
    // Query for risk assessments with pagination
    const assessmentsQuery = `
      SELECT r.*,
        (SELECT username FROM users WHERE id = r.assessor_id) as assessor_name,
        (SELECT business_name FROM host_employers WHERE id = r.host_employer_id) as host_employer_name,
        (SELECT COUNT(*) FROM whs_risk_responsible_persons WHERE risk_assessment_id = r.id) as responsible_persons_count
      FROM whs_risk_assessments r
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    params.push(pageSize, offset);
    
    // Query for total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM whs_risk_assessments
      ${whereClause}
    `;
    
    // Execute both queries
    const assessments = await db.execute(sql.raw(assessmentsQuery, params));
    const totalResult = await db.execute(sql.raw(countQuery, params.slice(0, params.length - 2)));
    
    const total = parseInt(totalResult.rows[0].total as string);
    const totalPages = Math.ceil(total / pageSize);
    
    res.json({
      assessments: assessments.rows,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages
      }
    });
  } catch (error) {
    logger.error('Error fetching WHS risk assessments: ' + (error instanceof Error ? error.message : String(error)));
    res.status(500).json({ message: 'Error fetching WHS risk assessments' });
  }
});

export default router;