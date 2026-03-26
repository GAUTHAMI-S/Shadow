import { Router } from 'express';
import { body } from 'express-validator';
import * as habit from '../controllers/habit.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

const habitValidators = [
  body('name').trim().notEmpty().withMessage('Habit name is required'),
  body('frequencyType').isIn(['DAILY', 'CUSTOM']).withMessage('Frequency must be DAILY or CUSTOM'),
  body('customDays').optional().isArray().withMessage('Custom days must be an array'),
  body('hasGraceDay').optional().isBoolean().withMessage('hasGraceDay must be boolean'),
];

router.get('/', habit.getAll);
router.get('/calendar', habit.getCalendar);
router.get('/:id', habit.getOne);
router.post('/', habitValidators, habit.create);
router.patch('/:id', habit.update);
router.delete('/:id', habit.remove);
router.post('/:id/log', [
  body('date').isISO8601().withMessage('Date must be ISO 8601'),
  body('status').isIn(['COMPLETED', 'MISSED', 'GRACE']).withMessage('Invalid status'),
], habit.logCompletion);
router.get('/:id/streak', habit.getStreak);

export default router;
