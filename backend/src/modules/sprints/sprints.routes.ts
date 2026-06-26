import { Router } from 'express';
import * as controller from './sprints.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { createSprintSchema, updateSprintSchema } from './sprints.schema';

const router = Router();

router.use(authenticate);

router.post('/projects/:projectId/sprints', validate(createSprintSchema), controller.createSprint);
router.get('/projects/:projectId/sprints', controller.listSprints);
router.get('/projects/:projectId/sprints/:sprintId', controller.getSprint);
router.patch('/projects/:projectId/sprints/:sprintId', validate(updateSprintSchema), controller.updateSprint);
router.post('/projects/:projectId/sprints/:sprintId/start', controller.startSprint);
router.post('/projects/:projectId/sprints/:sprintId/complete', controller.completeSprint);
router.delete('/projects/:projectId/sprints/:sprintId', controller.deleteSprint);

export default router;
