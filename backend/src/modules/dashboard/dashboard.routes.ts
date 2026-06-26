import { Router } from 'express';
import * as controller from './dashboard.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/workspaces/:workspaceId/dashboard/stats', controller.getDashboardStats);
router.get('/workspaces/:workspaceId/dashboard/my-issues', controller.getMyIssues);
router.get('/workspaces/:workspaceId/dashboard/activity', controller.getWorkspaceActivity);

export default router;
