import express from 'express';
import { getFinancialSummary } from './summary';

const router = express.Router();

// Financial summary endpoint
router.get('/summary', getFinancialSummary);

export default router;
