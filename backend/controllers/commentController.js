const commentService = require('../services/commentService');

exports.createComment = async (req, res, next) => {
  try {
    const comment = await commentService.createComment(
      req.params.bugId,
      req.body.message,
      req.user._id
    );
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

exports.getComments = async (req, res, next) => {
  try {
    const comments = await commentService.getComments(req.params.bugId);
    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    next(error);
  }
};

exports.updateComment = async (req, res, next) => {
  try {
    const comment = await commentService.updateComment(
      req.params.commentId,
      req.body.message,
      req.user._id
    );
    res.status(200).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const result = await commentService.deleteComment(
      req.params.commentId,
      req.user._id,
      req.user.role
    );
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
