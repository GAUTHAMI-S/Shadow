import { Router } from 'express';
import { body } from 'express-validator';
import * as auth from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  auth.signup
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  auth.login
);

router.get('/me', authMiddleware, auth.getMe);
router.patch('/me', authMiddleware, auth.updateMe);
router.patch('/me/password', authMiddleware, auth.changePassword);

export default router;
