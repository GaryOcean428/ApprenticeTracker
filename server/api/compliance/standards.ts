import { Router } from 'express';
import { db } from '../../db';
import { gtoComplianceStandards } from '@shared/schema';
import { isAuthenticated } from '../../middleware/auth';
import { eq, like } from 'drizzle-orm';

const router = Router();

/**
 * Get all compliance standards
 * @route GET /api/compliance/standards
 * @access Private
 */
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const standards = await db.select().from(gtoComplianceStandards);
    res.json(standards);
  } catch (error) {
    console.error('Error fetching compliance standards:', error);
    res.status(500).json({ error: 'Failed to fetch compliance standards' });
  }
});

/**
 * Get compliance standards by category
 * @route GET /api/compliance/standards/category/:category
 * @access Private
 */
router.get('/category/:category', isAuthenticated, async (req, res) => {
  try {
    const { category } = req.params;
    const standards = await db
      .select()
      .from(gtoComplianceStandards)
      .where(eq(gtoComplianceStandards.category, category));
    res.json(standards);
  } catch (error) {
    console.error('Error fetching compliance standards by category:', error);
    res.status(500).json({ error: 'Failed to fetch compliance standards' });
  }
});

/**
 * Get compliance standard by prefix (1.x, 2.x, 3.x, 4.x)
 * @route GET /api/compliance/standards/prefix/:prefix
 * @access Private
 */
router.get('/prefix/:prefix', isAuthenticated, async (req, res) => {
  try {
    const { prefix } = req.params;
    const standards = await db
      .select()
      .from(gtoComplianceStandards)
      .where(like(gtoComplianceStandards.standardNumber, `${prefix}%`));
    res.json(standards);
  } catch (error) {
    console.error('Error fetching compliance standards by prefix:', error);
    res.status(500).json({ error: 'Failed to fetch compliance standards' });
  }
});

/**
 * Get compliance standard by ID
 * @route GET /api/compliance/standards/:id
 * @access Private
 */
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const standard = await db
      .select()
      .from(gtoComplianceStandards)
      .where(eq(gtoComplianceStandards.id, parseInt(id)))
      .limit(1);
    
    if (standard.length === 0) {
      return res.status(404).json({ error: 'Compliance standard not found' });
    }
    
    res.json(standard[0]);
  } catch (error) {
    console.error('Error fetching compliance standard:', error);
    res.status(500).json({ error: 'Failed to fetch compliance standard' });
  }
});

export default router;