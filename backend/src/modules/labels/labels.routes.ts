import { Router } from 'express';
import * as controller from './labels.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { createLabelSchema, updateLabelSchema } from './labels.schema';

const router = Router();

router.use(authenticate);

// Project scope labels
router.get('/projects/:projectId/labels', controller.listLabels);
router.post('/projects/:projectId/labels', validate(createLabelSchema), controller.createLabel);
router.patch('/labels/:labelId', validate(updateLabelSchema), controller.updateLabel);
router.delete('/labels/:labelId', controller.deleteLabel);

// Issue label relationship
router.post('/issues/:issueId/labels/:labelId', controller.attachLabel);
router.delete('/issues/:issueId/labels/:labelId', controller.detachLabel);

export default router;
