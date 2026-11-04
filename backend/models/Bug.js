const mongoose = require('mongoose');

const bugSchema = new mongoose.Schema(
  {
    bugId: {
      type: String,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Bug title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Bug description is required'],
      maxlength: 5000,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required'],
    },
    module: {
      type: String,
      trim: true,
    },
    environment: {
      type: String,
      enum: ['production', 'staging', 'development', 'testing', 'uat'],
      default: 'development',
    },
    browser: {
      type: String,
      enum: ['chrome', 'firefox', 'safari', 'edge', 'opera', 'other'],
    },
    operatingSystem: {
      type: String,
      enum: ['windows', 'macos', 'linux', 'android', 'ios', 'other'],
    },
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium',
    },
    severity: {
      type: String,
      enum: ['blocker', 'critical', 'major', 'minor', 'trivial'],
      default: 'major',
    },
    status: {
      type: String,
      enum: [
        'open',
        'assigned',
        'in_progress',
        'resolved',
        'ready_for_testing',
        'closed',
        'reopened',
      ],
      default: 'open',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter is required'],
    },
    stepsToReproduce: {
      type: String,
      maxlength: 3000,
    },
    expectedResult: {
      type: String,
      maxlength: 1000,
    },
    actualResult: {
      type: String,
      maxlength: 1000,
    },
    screenshots: [
      {
        filename: String,
        path: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    statusHistory: [
      {
        status: String,
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        changedAt: { type: Date, default: Date.now },
        comment: String,
      },
    ],
    tags: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

bugSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'bug',
});

bugSchema.pre('save', async function (next) {
  if (this.isNew) {
    // CRIT-003 fix: Use atomic $inc on Project.bugCounter to prevent duplicate bugIds
    const Project = mongoose.model('Project');
    const project = await Project.findByIdAndUpdate(
      this.project,
      { $inc: { bugCounter: 1 } },
      { new: true }
    );
    if (project) {
      this.bugId = `${project.key}-${String(project.bugCounter).padStart(4, '0')}`;
    }
  }
  next();
});

bugSchema.index({ title: 'text', description: 'text', bugId: 'text' });
bugSchema.index({ project: 1, status: 1 });
bugSchema.index({ assignedTo: 1, status: 1 });
bugSchema.index({ reporter: 1 });
bugSchema.index({ priority: 1, severity: 1 });

module.exports = mongoose.model('Bug', bugSchema);
