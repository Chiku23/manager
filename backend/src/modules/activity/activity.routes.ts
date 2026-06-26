import { Router } from 'express';
import * as controller from './activity.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/issues/:issueId/activity', controller.getIssueActivity);

export default router;
