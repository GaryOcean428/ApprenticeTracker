import express from 'express';
import { isAuthenticated, hasPermission } from '../../middleware/auth';
import logger from '../../utils/logger';
import { db } from '../../db';
import { sql } from 'drizzle-orm';

const router = express.Router();

// Apply authentication middleware to all WHS policy routes
router.use(isAuthenticated);

/**
 * @route GET /api/whs/policies
 * @desc Get all WHS policies with pagination, filtering, and sorting
 * @access Private (requires authentication)
 */
router.get('/policies', hasPermission('whs:read'), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'effective_date', 
      order = 'desc',
      status,
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
    
    if (search) {
      conditions.push(`(title ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }

    // Construct the WHERE clause
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Construct the ORDER BY clause
    const validSortFields = ['effective_date', 'title', 'review_date', 'status', 'version'];
    const sortField = validSortFields.includes(sort as string) ? sort : 'effective_date';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
    
    // Query for policies with pagination
    const policiesQuery = `
      SELECT p.*,
        (SELECT username FROM users WHERE id = p.approved_by) as approver_name,
        (SELECT COUNT(*) FROM whs_policy_acknowledgements WHERE policy_id = p.id) as acknowledgement_count,
        (SELECT name FROM documents WHERE id = p.document_id) as document_name
      FROM whs_policies p
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    params.push(pageSize, offset);
    
    // Query for total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM whs_policies
      ${whereClause}
    `;
    
    // Execute both queries
    const policies = await db.execute(sql.raw(policiesQuery, ...params));
    const totalResult = await db.execute(sql.raw(countQuery, ...params.slice(0, params.length - 2)));
    
    const total = parseInt(totalResult.rows[0].total);
    const totalPages = Math.ceil(total / pageSize);
    
    res.json({
      policies: policies.rows,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages
      }
    });
  } catch (error) {
    logger.error('Error fetching WHS policies: ' + (error instanceof Error ? error.message : String(error)));
    res.status(500).json({ message: 'Error fetching WHS policies' });
  }
});

/**
 * @route GET /api/whs/policies/:id
 * @desc Get a WHS policy by ID
 * @access Private (requires authentication)
 */
router.get('/policies/:id', hasPermission('whs:read'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const policy = await db.execute(sql`
      SELECT p.*,
        (SELECT username FROM users WHERE id = p.approved_by) as approver_name,
        (SELECT name FROM documents WHERE id = p.document_id) as document_name
      FROM whs_policies p
      WHERE p.id = ${id}
    `);

    if (!policy.rows.length) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    // Get acknowledgements
    const acknowledgements = await db.execute(sql`
      SELECT a.*,
        (SELECT username FROM users WHERE id = a.user_id) as user_name,
        (SELECT name FROM apprentices WHERE id = a.apprentice_id) as apprentice_name
      FROM whs_policy_acknowledgements a
      WHERE a.policy_id = ${id}
      ORDER BY a.acknowledged_at DESC
    `);

    res.json({
      policy: policy.rows[0],
      acknowledgements: acknowledgements.rows
    });
  } catch (error) {
    logger.error('Error fetching WHS policy details: ' + (error instanceof Error ? error.message : String(error)));
    res.status(500).json({ message: 'Error fetching WHS policy details' });
  }
});

/**
 * @route POST /api/whs/policies
 * @desc Create a new WHS policy
 * @access Private (requires authentication)
 */
router.post('/policies', hasPermission('whs:create'), async (req, res) => {
  try {
    const {
      title,
      description,
      document_id,
      version,
      effective_date,
      review_date,
      approved_by,
      approval_date,
      status
    } = req.body;

    // Validate required fields
    if (!title || !description || !version || !effective_date || !review_date || !approved_by || !approval_date) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    // Set default status if not provided
    const policyStatus = status || 'active';
    
    // Insert policy
    const result = await db.execute(sql`
      INSERT INTO whs_policies (
        title, description, document_id, version,
        effective_date, review_date, approved_by,
        approval_date, status
      )
      VALUES (
        ${title}, ${description}, ${document_id || null}, ${version},
        ${effective_date}, ${review_date}, ${approved_by},
        ${approval_date}, ${policyStatus}
      )
      RETURNING id
    `);

    res.status(201).json({ 
      message: 'WHS policy created successfully', 
      policyId: result.rows[0].id,
      success: true
    });
  } catch (error) {
    logger.error('Error creating WHS policy: ' + (error instanceof Error ? error.message : String(error)));
    res.status(500).json({ message: 'Error creating WHS policy' });
  }
});

/**
 * @route PUT /api/whs/policies/:id
 * @desc Update a WHS policy
 * @access Private (requires authentication)
 */
router.put('/policies/:id', hasPermission('whs:update'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      document_id,
      version,
      effective_date,
      review_date,
      approved_by,
      approval_date,
      status
    } = req.body;

    // Check if the policy exists
    const checkResult = await db.execute(sql`
      SELECT id FROM whs_policies WHERE id = ${id}
    `);

    if (!checkResult.rows.length) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    // Update policy
    await db.execute(sql`
      UPDATE whs_policies
      SET
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        document_id = ${document_id},
        version = COALESCE(${version}, version),
        effective_date = COALESCE(${effective_date}, effective_date),
        review_date = COALESCE(${review_date}, review_date),
        approved_by = COALESCE(${approved_by}, approved_by),
        approval_date = COALESCE(${approval_date}, approval_date),
        status = COALESCE(${status}, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `);

    res.json({ 
      message: 'WHS policy updated successfully',
      success: true
    });
  } catch (error) {
    logger.error('Error updating WHS policy: ' + (error instanceof Error ? error.message : String(error)));
    res.status(500).json({ message: 'Error updating WHS policy' });
  }
});

/**
 * @route DELETE /api/whs/policies/:id
 * @desc Delete a WHS policy
 * @access Private (requires authentication)
 */
router.delete('/policies/:id', hasPermission('whs:delete'), async (req, res) => {
  try {
    const { id } = req.params;

    // Delete policy (this will cascade delete acknowledgements)
    const result = await db.execute(sql`
      DELETE FROM whs_policies
      WHERE id = ${id}
      RETURNING id
    `);

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    res.json({ 
      message: 'WHS policy deleted successfully',
      success: true
    });
  } catch (error) {
    logger.error('Error deleting WHS policy: ' + (error instanceof Error ? error.message : String(error)));
    res.status(500).json({ message: 'Error deleting WHS policy' });
  }
});

/**
 * @route POST /api/whs/policies/:id/acknowledge
 * @desc Acknowledge a WHS policy
 * @access Private (requires authentication)
 */
router.post('/policies/:id/acknowledge', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      user_id,
      apprentice_id,
      acknowledgement_method,
      ip_address
    } = req.body;

    // Validate required fields
    if (!acknowledgement_method || (!user_id && !apprentice_id)) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    // Check if the policy exists and get its version
    const policy = await db.execute(sql`
      SELECT id, version FROM whs_policies WHERE id = ${id}
    `);

    if (!policy.rows.length) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    const version = policy.rows[0].version;

    // Insert acknowledgement
    await db.execute(sql`
      INSERT INTO whs_policy_acknowledgements (
        policy_id, user_id, apprentice_id,
        acknowledgement_method, ip_address, version_acknowledged
      )
      VALUES (
        ${id}, ${user_id || null}, ${apprentice_id || null},
        ${acknowledgement_method}, ${ip_address || null}, ${version}
      )
    `);

    res.status(201).json({ 
      message: 'WHS policy acknowledged successfully',
      success: true
    });
  } catch (error) {
    logger.error('Error acknowledging WHS policy: ' + (error instanceof Error ? error.message : String(error)));
    res.status(500).json({ message: 'Error acknowledging WHS policy' });
  }
});

export default router;