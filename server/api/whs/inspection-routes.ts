import express from 'express';
import { isAuthenticated, hasPermission } from '../../middleware/auth';
import logger from '../../utils/logger';
import { db } from '../../db';
import { sql } from 'drizzle-orm';

const router = express.Router();

// Apply authentication middleware to all WHS inspection routes
router.use(isAuthenticated);

/**
 * @route GET /api/whs/inspections
 * @desc Get all WHS site inspections with pagination, filtering, and sorting
 * @access Private (requires authentication)
 */
router.get('/inspections', hasPermission('whs:read'), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'inspection_date', 
      order = 'desc',
      status,
      inspection_type,
      hostEmployerId,
      search,
      start_date,
      end_date
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
    
    if (inspection_type) {
      conditions.push(`inspection_type = $${params.length + 1}`);
      params.push(inspection_type);
    }
    
    if (hostEmployerId) {
      conditions.push(`host_employer_id = $${params.length + 1}`);
      params.push(hostEmployerId);
    }
    
    if (start_date) {
      conditions.push(`inspection_date >= $${params.length + 1}`);
      params.push(start_date);
    }
    
    if (end_date) {
      conditions.push(`inspection_date <= $${params.length + 1}`);
      params.push(end_date);
    }
    
    if (search) {
      conditions.push(`(site_address ILIKE $${params.length + 1} OR findings ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }

    // Construct the WHERE clause
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Construct the ORDER BY clause
    const validSortFields = ['inspection_date', 'site_address', 'overall_rating', 'status'];
    const sortField = validSortFields.includes(sort as string) ? sort : 'inspection_date';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
    
    // Query for inspections with pagination
    const inspectionsQuery = `
      SELECT i.*,
        (SELECT username FROM users WHERE id = i.inspector_id) as inspector_name,
        (SELECT business_name FROM host_employers WHERE id = i.host_employer_id) as host_employer_name,
        (SELECT COUNT(*) FROM whs_inspection_checklist_items WHERE inspection_id = i.id) as checklist_item_count,
        (SELECT COUNT(*) FROM whs_inspection_checklist_items WHERE inspection_id = i.id AND compliance_status = 'non_compliant') as non_compliant_count
      FROM whs_site_inspections i
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    params.push(pageSize, offset);
    
    // Query for total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM whs_site_inspections
      ${whereClause}
    `;
    
    // Execute both queries
    const inspections = await db.execute(sql.raw(inspectionsQuery, ...params));
    const totalResult = await db.execute(sql.raw(countQuery, ...params.slice(0, params.length - 2)));
    
    const total = parseInt(totalResult.rows[0].total);
    const totalPages = Math.ceil(total / pageSize);
    
    res.json({
      inspections: inspections.rows,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages
      }
    });
  } catch (error) {
    logger.error('Error fetching WHS inspections: ' + (error instanceof Error ? error.message : String(error)));
    res.status(500).json({ message: 'Error fetching WHS inspections' });
  }
});

/**
 * @route GET /api/whs/inspections/:id
 * @desc Get a WHS site inspection by ID
 * @access Private (requires authentication)
 */
router.get('/inspections/:id', hasPermission('whs:read'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const inspection = await db.execute(sql`
      SELECT i.*,
        (SELECT username FROM users WHERE id = i.inspector_id) as inspector_name,
        (SELECT business_name FROM host_employers WHERE id = i.host_employer_id) as host_employer_name
      FROM whs_site_inspections i
      WHERE i.id = ${id}
    `);

    if (!inspection.rows.length) {
      return res.status(404).json({ message: 'Inspection not found' });
    }

    // Get checklist items
    const checklist = await db.execute(sql`
      SELECT *
      FROM whs_inspection_checklist_items
      WHERE inspection_id = ${id}
      ORDER BY category, id
    `);

    res.json({
      inspection: inspection.rows[0],
      checklist: checklist.rows
    });
  } catch (error) {
    logger.error('Error fetching WHS inspection details: ' + (error instanceof Error ? error.message : String(error)));
    res.status(500).json({ message: 'Error fetching WHS inspection details' });
  }
});

/**
 * @route POST /api/whs/inspections
 * @desc Create a new WHS site inspection
 * @access Private (requires authentication)
 */
router.post('/inspections', hasPermission('whs:create'), async (req, res) => {
  try {
    const {
      host_employer_id,
      site_address,
      inspection_date,
      inspector_id,
      inspection_type,
      overall_rating,
      findings,
      recommendations,
      corrective_actions,
      follow_up_required,
      follow_up_date,
      status,
      checklist_items
    } = req.body;

    // Validate required fields
    if (!host_employer_id || !site_address || !inspection_date || !inspector_id || !inspection_type || !overall_rating || !findings) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    // Set default status if not provided
    const inspectionStatus = status || 'draft';
    
    // Start a transaction
    await db.execute(sql`BEGIN`);
    
    try {
      // Insert inspection
      const result = await db.execute(sql`
        INSERT INTO whs_site_inspections (
          host_employer_id, site_address, inspection_date,
          inspector_id, inspection_type, overall_rating,
          findings, recommendations, corrective_actions,
          follow_up_required, follow_up_date, status
        )
        VALUES (
          ${host_employer_id}, ${site_address}, ${inspection_date},
          ${inspector_id}, ${inspection_type}, ${overall_rating},
          ${findings}, ${recommendations || null}, ${corrective_actions || null},
          ${follow_up_required || false}, ${follow_up_date || null}, ${inspectionStatus}
        )
        RETURNING id
      `);

      const inspectionId = result.rows[0].id;

      // Insert checklist items if provided
      if (checklist_items && Array.isArray(checklist_items) && checklist_items.length > 0) {
        for (const item of checklist_items) {
          await db.execute(sql`
            INSERT INTO whs_inspection_checklist_items (
              inspection_id, category, item_description,
              compliance_status, severity, notes, photos_document_ids
            )
            VALUES (
              ${inspectionId}, ${item.category}, ${item.item_description},
              ${item.compliance_status}, ${item.severity || null}, ${item.notes || null}, ${item.photos_document_ids || null}
            )
          `);
        }
      }
      
      // Commit the transaction
      await db.execute(sql`COMMIT`);

      res.status(201).json({ 
        message: 'WHS inspection created successfully', 
        inspectionId,
        success: true
      });
    } catch (err) {
      // Rollback the transaction in case of error
      await db.execute(sql`ROLLBACK`);
      throw err;
    }
  } catch (error) {
    logger.error('Error creating WHS inspection: ' + (error instanceof Error ? error.message : String(error)));
    res.status(500).json({ message: 'Error creating WHS inspection' });
  }
});

/**
 * @route PUT /api/whs/inspections/:id
 * @desc Update a WHS site inspection
 * @access Private (requires authentication)
 */
router.put('/inspections/:id', hasPermission('whs:update'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      host_employer_id,
      site_address,
      inspection_date,
      inspector_id,
      inspection_type,
      overall_rating,
      findings,
      recommendations,
      corrective_actions,
      follow_up_required,
      follow_up_date,
      status
    } = req.body;

    // Check if the inspection exists
    const checkResult = await db.execute(sql`
      SELECT id FROM whs_site_inspections WHERE id = ${id}
    `);

    if (!checkResult.rows.length) {
      return res.status(404).json({ message: 'Inspection not found' });
    }

    // Update inspection
    await db.execute(sql`
      UPDATE whs_site_inspections
      SET
        host_employer_id = COALESCE(${host_employer_id}, host_employer_id),
        site_address = COALESCE(${site_address}, site_address),
        inspection_date = COALESCE(${inspection_date}, inspection_date),
        inspector_id = COALESCE(${inspector_id}, inspector_id),
        inspection_type = COALESCE(${inspection_type}, inspection_type),
        overall_rating = COALESCE(${overall_rating}, overall_rating),
        findings = COALESCE(${findings}, findings),
        recommendations = ${recommendations},
        corrective_actions = ${corrective_actions},
        follow_up_required = COALESCE(${follow_up_required}, follow_up_required),
        follow_up_date = ${follow_up_date},
        status = COALESCE(${status}, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `);

    res.json({ 
      message: 'WHS inspection updated successfully',
      success: true
    });
  } catch (error) {
    logger.error('Error updating WHS inspection: ' + (error instanceof Error ? error.message : String(error)));
    res.status(500).json({ message: 'Error updating WHS inspection' });
  }
});

/**
 * @route POST /api/whs/inspections/:id/checklist
 * @desc Add or update checklist items for a WHS site inspection
 * @access Private (requires authentication)
 */
router.post('/inspections/:id/checklist', hasPermission('whs:update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No checklist items provided' });
    }

    // Check if the inspection exists
    const checkResult = await db.execute(sql`
      SELECT id FROM whs_site_inspections WHERE id = ${id}
    `);

    if (!checkResult.rows.length) {
      return res.status(404).json({ message: 'Inspection not found' });
    }

    // Start a transaction
    await db.execute(sql`BEGIN`);
    
    try {
      for (const item of items) {
        if (item.id) {
          // Update existing item
          await db.execute(sql`
            UPDATE whs_inspection_checklist_items
            SET
              category = COALESCE(${item.category}, category),
              item_description = COALESCE(${item.item_description}, item_description),
              compliance_status = COALESCE(${item.compliance_status}, compliance_status),
              severity = ${item.severity},
              notes = ${item.notes},
              photos_document_ids = ${item.photos_document_ids}
            WHERE id = ${item.id} AND inspection_id = ${id}
          `);
        } else {
          // Insert new item
          await db.execute(sql`
            INSERT INTO whs_inspection_checklist_items (
              inspection_id, category, item_description,
              compliance_status, severity, notes, photos_document_ids
            )
            VALUES (
              ${id}, ${item.category}, ${item.item_description},
              ${item.compliance_status}, ${item.severity || null}, ${item.notes || null}, ${item.photos_document_ids || null}
            )
          `);
        }
      }
      
      // Commit the transaction
      await db.execute(sql`COMMIT`);

      res.json({ 
        message: 'Checklist items updated successfully',
        success: true
      });
    } catch (err) {
      // Rollback the transaction in case of error
      await db.execute(sql`ROLLBACK`);
      throw err;
    }
  } catch (error) {
    logger.error('Error updating checklist items: ' + (error instanceof Error ? error.message : String(error)));
    res.status(500).json({ message: 'Error updating checklist items' });
  }
});

/**
 * @route DELETE /api/whs/inspections/:id
 * @desc Delete a WHS site inspection
 * @access Private (requires authentication)
 */
router.delete('/inspections/:id', hasPermission('whs:delete'), async (req, res) => {
  try {
    const { id } = req.params;

    // Delete inspection (this will cascade delete checklist items)
    const result = await db.execute(sql`
      DELETE FROM whs_site_inspections
      WHERE id = ${id}
      RETURNING id
    `);

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Inspection not found' });
    }

    res.json({ 
      message: 'WHS inspection deleted successfully',
      success: true
    });
  } catch (error) {
    logger.error('Error deleting WHS inspection: ' + (error instanceof Error ? error.message : String(error)));
    res.status(500).json({ message: 'Error deleting WHS inspection' });
  }
});

export default router;