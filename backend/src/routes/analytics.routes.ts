import { Router } from 'express';
import * as analytics from '../controllers/analytics.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/dashboard', analytics.getDashboard);
router.get('/weekly', analytics.getWeekly);
router.get('/monthly', analytics.getMonthly);
router.get('/streaks', analytics.getAllStreaks);

export default router;
