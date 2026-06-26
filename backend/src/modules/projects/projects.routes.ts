import { Router } from 'express';
import * as controller from './projects.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import {
  createProjectSchema,
  updateProjectSchema,
  addProjectMemberSchema,
  updateProjectMemberSchema,
} from './projects.schema';

const router = Router();

router.use(authenticate);

// Workspace scope projects
router.post('/workspaces/:workspaceId/projects', validate(createProjectSchema), controller.createProject);
router.get('/workspaces/:workspaceId/projects', controller.listProjects);
router.get('/workspaces/:workspaceId/projects/:projectId', controller.getProject);
router.patch('/workspaces/:workspaceId/projects/:projectId', validate(updateProjectSchema), controller.updateProject);
router.patch('/workspaces/:workspaceId/projects/:projectId/archive', controller.archiveProject);
router.delete('/workspaces/:workspaceId/projects/:projectId', controller.deleteProject);

// Project member scope
router.get('/projects/:projectId/members', controller.listProjectMembers);
router.post('/projects/:projectId/members', validate(addProjectMemberSchema), controller.addProjectMember);
router.patch('/projects/:projectId/members/:userId', validate(updateProjectMemberSchema), controller.updateProjectMember);
router.delete('/projects/:projectId/members/:userId', controller.removeProjectMember);

export default router;
