const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
const Bug = require('../models/Bug');

class CommentService {
  async createComment(bugId, message, userId) {
    const bug = await Bug.findById(bugId);
    if (!bug) {
      throw Object.assign(new Error('Bug not found'), { statusCode: 404 });
    }

    const comment = await Comment.create({
      bug: bugId,
      author: userId,
      message,
    });

    await Activity.create({
      user: userId,
      action: 'commented',
      bug: bugId,
      project: bug.project,
      details: `Commented on bug: ${bug.title}`,
    });

    return await Comment.findById(comment._id).populate(
      'author',
      'firstName lastName email avatar role'
    );
  }

  async getComments(bugId) {
    return await Comment.find({ bug: bugId })
      .populate('author', 'firstName lastName email avatar role')
      .sort({ createdAt: -1 });
  }

  async updateComment(commentId, message, userId) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw Object.assign(new Error('Comment not found'), { statusCode: 404 });
    }

    if (comment.author.toString() !== userId.toString()) {
      throw Object.assign(new Error('Not authorized to edit this comment'), { statusCode: 403 });
    }

    comment.message = message;
    comment.isEdited = true;
    await comment.save();

    return await Comment.findById(commentId).populate(
      'author',
      'firstName lastName email avatar role'
    );
  }

  async deleteComment(commentId, userId, userRole) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw Object.assign(new Error('Comment not found'), { statusCode: 404 });
    }

    if (comment.author.toString() !== userId.toString() && userRole !== 'admin') {
      throw Object.assign(new Error('Not authorized to delete this comment'), { statusCode: 403 });
    }

    await Comment.findByIdAndDelete(commentId);
    return { message: 'Comment deleted successfully' };
  }
}

module.exports = new CommentService();
