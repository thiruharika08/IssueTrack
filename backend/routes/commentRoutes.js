const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

router.post(
  '/:bugId',
  [body('message').trim().notEmpty().withMessage('Comment message is required')],
  validate,
  commentController.createComment
);

router.get('/:bugId', commentController.getComments);

router.put(
  '/:commentId',
  [body('message').trim().notEmpty().withMessage('Comment message is required')],
  validate,
  commentController.updateComment
);

router.delete('/:commentId', commentController.deleteComment);

module.exports = router;
