import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../../storage';

const router = Router();

/**
 * Get all compliance standards
 * @route GET /api/compliance/standards
 * @access Private
 */
router.get('/', async (req, res) => {
  try {
    const standards = await storage.getAllComplianceStandards();
    res.json(standards);
  } catch (error) {
    console.error('Error fetching compliance standards:', error);
    res.status(500).json({
      message: 'Error fetching compliance standards',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Get compliance standards by category
 * @route GET /api/compliance/standards/category/:category
 * @access Private
 */
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const standards = await storage.getComplianceStandardsByCategory(category);
    res.json(standards);
  } catch (error) {
    console.error('Error fetching compliance standards by category:', error);
    res.status(500).json({
      message: 'Error fetching compliance standards by category',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Get compliance standard by prefix (1.x, 2.x, 3.x, 4.x)
 * @route GET /api/compliance/standards/prefix/:prefix
 * @access Private
 */
router.get('/prefix/:prefix', async (req, res) => {
  try {
    const { prefix } = req.params;
    const standards = await storage.getComplianceStandardsByPrefix(prefix);
    res.json(standards);
  } catch (error) {
    console.error('Error fetching compliance standards by prefix:', error);
    res.status(500).json({
      message: 'Error fetching compliance standards by prefix',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Get compliance standard by ID
 * @route GET /api/compliance/standards/:id
 * @access Private
 */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const standard = await storage.getComplianceStandard(id);

    if (!standard) {
      return res.status(404).json({ message: 'Compliance standard not found' });
    }

    res.json(standard);
  } catch (error) {
    console.error('Error fetching compliance standard:', error);
    res.status(500).json({
      message: 'Error fetching compliance standard',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Create compliance standard
 * @route POST /api/compliance/standards
 * @access Private
 */
router.post('/', async (req, res) => {
  try {
    const standardData = req.body;
    const standard = await storage.createComplianceStandard(standardData);
    res.status(201).json(standard);
  } catch (error) {
    console.error('Error creating compliance standard:', error);
    res.status(500).json({
      message: 'Error creating compliance standard',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Update compliance standard
 * @route PATCH /api/compliance/standards/:id
 * @access Private
 */
router.patch('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const standardData = req.body;
    const standard = await storage.updateComplianceStandard(id, standardData);

    if (!standard) {
      return res.status(404).json({ message: 'Compliance standard not found' });
    }

    res.json(standard);
  } catch (error) {
    console.error('Error updating compliance standard:', error);
    res.status(500).json({
      message: 'Error updating compliance standard',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Delete compliance standard
 * @route DELETE /api/compliance/standards/:id
 * @access Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteComplianceStandard(id);

    if (success) {
      res.status(204).end();
    } else {
      res.status(404).json({ message: 'Compliance standard not found' });
    }
  } catch (error) {
    console.error('Error deleting compliance standard:', error);
    res.status(500).json({
      message: 'Error deleting compliance standard',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
