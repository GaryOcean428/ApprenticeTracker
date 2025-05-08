import { Router } from 'express';
import standardsRouter from './standards';
import { storage } from '../../storage';

const router = Router();

// Register sub-routers
router.use('/standards', standardsRouter);

/**
 * Get all compliance records
 * @route GET /api/compliance
 * @access Private
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, organizationId } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    
    // Prepare filter options
    const filterOptions: any = {};
    
    if (status) {
      filterOptions.status = status;
    }
    
    if (organizationId) {
      filterOptions.organizationId = parseInt(organizationId as string);
    }

    // Get compliance records with pagination
    const result = await storage.getComplianceRecords(
      pageNum, 
      limitNum, 
      filterOptions
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching compliance records:', error);
    res.status(500).json({ 
      message: 'Error fetching compliance records',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Get compliance record by ID
 * @route GET /api/compliance/:id
 * @access Private
 */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const record = await storage.getComplianceRecord(id);
    
    if (!record) {
      return res.status(404).json({ message: 'Compliance record not found' });
    }
    
    res.json(record);
  } catch (error) {
    console.error('Error fetching compliance record:', error);
    res.status(500).json({ 
      message: 'Error fetching compliance record',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Create compliance record
 * @route POST /api/compliance
 * @access Private
 */
router.post('/', async (req, res) => {
  try {
    const recordData = req.body;
    const record = await storage.createComplianceRecord(recordData);
    
    res.status(201).json(record);
  } catch (error) {
    console.error('Error creating compliance record:', error);
    res.status(500).json({ 
      message: 'Error creating compliance record',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Update compliance record
 * @route PATCH /api/compliance/:id
 * @access Private
 */
router.patch('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const recordData = req.body;
    
    const record = await storage.updateComplianceRecord(id, recordData);
    
    if (!record) {
      return res.status(404).json({ message: 'Compliance record not found' });
    }
    
    res.json(record);
  } catch (error) {
    console.error('Error updating compliance record:', error);
    res.status(500).json({ 
      message: 'Error updating compliance record',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Delete compliance record
 * @route DELETE /api/compliance/:id
 * @access Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteComplianceRecord(id);
    
    if (success) {
      res.status(204).end();
    } else {
      res.status(404).json({ message: 'Compliance record not found' });
    }
  } catch (error) {
    console.error('Error deleting compliance record:', error);
    res.status(500).json({ 
      message: 'Error deleting compliance record',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;