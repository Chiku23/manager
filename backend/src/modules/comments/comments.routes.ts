import { Router } from 'express';
import * as controller from './comments.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { createCommentSchema, updateCommentSchema } from './comments.schema';

const router = Router();

router.use(authenticate);

router.get('/issues/:issueId/comments', controller.listComments);
router.post('/issues/:issueId/comments', validate(createCommentSchema), controller.createComment);
router.patch('/comments/:commentId', validate(updateCommentSchema), controller.updateComment);
router.delete('/comments/:commentId', controller.deleteComment);

export default router;
