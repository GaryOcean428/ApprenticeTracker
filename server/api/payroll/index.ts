import { Router } from 'express';
import { chargeRateRouter } from './charge-rates';

const payrollRouter = Router();

// Mount charge rate routes
payrollRouter.use('/charge-rates', chargeRateRouter);

export default payrollRouter;
