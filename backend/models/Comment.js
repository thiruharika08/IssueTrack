const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    bug: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bug',
      required: [true, 'Bug reference is required'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    message: {
      type: String,
      required: [true, 'Comment message is required'],
      maxlength: 2000,
    },
    attachments: [
      {
        filename: String,
        path: String,
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.index({ bug: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
