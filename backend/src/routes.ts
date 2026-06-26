import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes';
import workspaceRoutes from './modules/workspaces/workspaces.routes';
import projectRoutes from './modules/projects/projects.routes';
import sprintRoutes from './modules/sprints/sprints.routes';
import issueRoutes from './modules/issues/issues.routes';
import commentRoutes from './modules/comments/comments.routes';
import labelRoutes from './modules/labels/labels.routes';
import activityRoutes from './modules/activity/activity.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';

const router = Router();

// API Health Check
router.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Mount modules
router.use('/auth', authRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/', projectRoutes); // Mounts /workspaces/:workspaceId/projects and /projects/:projectId/members
router.use('/', sprintRoutes);  // Mounts /projects/:projectId/sprints
router.use('/', issueRoutes);   // Mounts /projects/:projectId/issues and /issues/:issueId
router.use('/', commentRoutes); // Mounts /issues/:issueId/comments and /comments/:commentId
router.use('/', labelRoutes);   // Mounts /projects/:projectId/labels, /labels/:labelId, /issues/:issueId/labels
router.use('/', activityRoutes);// Mounts /issues/:issueId/activity
router.use('/', dashboardRoutes);// Mounts /workspaces/:workspaceId/dashboard

export default router;
