import { Router } from 'express';
import standardsRouter from './standards';

const router = Router();

// Mount compliance standard routes
router.use('/standards', standardsRouter);

export default router;