import { Router } from 'express';
import * as controller from './workspaces.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from './workspaces.schema';

const router = Router();

router.use(authenticate);

router.post('/', validate(createWorkspaceSchema), controller.createWorkspace);
router.get('/', controller.listWorkspaces);
router.get('/:workspaceId', controller.getWorkspace);
router.patch('/:workspaceId', validate(updateWorkspaceSchema), controller.updateWorkspace);
router.delete('/:workspaceId', controller.deleteWorkspace);

// Members
router.get('/:workspaceId/members', controller.listMembers);
router.post('/:workspaceId/members/invite', validate(inviteMemberSchema), controller.inviteMember);
router.patch('/:workspaceId/members/:userId', validate(updateMemberRoleSchema), controller.updateMemberRole);
router.delete('/:workspaceId/members/:userId', controller.removeMember);

export default router;
