import { Router } from 'express';
import * as controller from './auth.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from './auth.schema';

const router = Router();

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);

// Protected
router.get('/me', authenticate, controller.getMe);
router.patch('/me', authenticate, validate(updateProfileSchema), controller.updateMe);
router.patch('/me/password', authenticate, validate(changePasswordSchema), controller.changePassword);

export default router;
