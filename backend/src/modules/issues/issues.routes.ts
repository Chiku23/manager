import { Router } from 'express';
import * as controller from './issues.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import {
  createIssueSchema,
  updateIssueSchema,
  listIssuesSchema,
  moveIssueSchema,
  reorderIssueSchema,
} from './issues.schema';

const router = Router();

router.use(authenticate);

// Project scope issues
router.post('/projects/:projectId/issues', validate(createIssueSchema), controller.createIssue);
router.get('/projects/:projectId/issues', validate(listIssuesSchema), controller.listIssues);
router.get('/projects/:projectId/issues/backlog', controller.listBacklog);

// Specific issue actions
router.get('/issues/:issueId', controller.getIssue);
router.patch('/issues/:issueId', validate(updateIssueSchema), controller.updateIssue);
router.patch('/issues/:issueId/move', validate(moveIssueSchema), controller.moveIssue);
router.patch('/issues/:issueId/reorder', validate(reorderIssueSchema), controller.reorderIssue);
router.delete('/issues/:issueId', controller.deleteIssue);

export default router;
