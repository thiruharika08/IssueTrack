const Bug = require('../models/Bug');
const Activity = require('../models/Activity');
const { PAGINATION } = require('../config/constants');

class BugService {
  async createBug(bugData, userId) {
    const bug = await Bug.create({ ...bugData, reporter: userId });

    await Activity.create({
      user: userId,
      action: 'created_bug',
      bug: bug._id,
      project: bug.project,
      details: `Created bug: ${bug.title}`,
    });

    return await Bug.findById(bug._id)
      .populate('reporter', 'firstName lastName email avatar')
      .populate('assignedTo', 'firstName lastName email avatar')
      .populate('project', 'name key');
  }

  async getBugs(filters = {}, pagination = {}) {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      sort = 'createdAt',
      order = 'desc',
    } = pagination;

    // CRIT-001 fix: Validate sort field against whitelist
    const ALLOWED_SORT_FIELDS = ['createdAt', 'updatedAt', 'priority', 'severity', 'status', 'title'];
    const safeSort = ALLOWED_SORT_FIELDS.includes(sort) ? sort : 'createdAt';
    const safeOrder = order === 'asc' ? 1 : -1;

    // CRIT-002 fix: Cap limit to prevent memory exhaustion
    const safePage = Math.max(1, parseInt(page) || PAGINATION.DEFAULT_PAGE);
    const safeLimit = Math.min(
      Math.max(1, parseInt(limit) || PAGINATION.DEFAULT_LIMIT),
      PAGINATION.MAX_LIMIT
    );

    const query = this.buildQuery(filters);
    const skip = (safePage - 1) * safeLimit;
    const sortObj = { [safeSort]: safeOrder };

    const [bugs, total] = await Promise.all([
      Bug.find(query)
        .populate('reporter', 'firstName lastName email avatar')
        .populate('assignedTo', 'firstName lastName email avatar')
        .populate('project', 'name key')
        .sort(sortObj)
        .skip(skip)
        .limit(safeLimit),
      Bug.countDocuments(query),
    ]);

    return {
      bugs,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getBugById(bugId) {
    const bug = await Bug.findById(bugId)
      .populate('reporter', 'firstName lastName email avatar role')
      .populate('assignedTo', 'firstName lastName email avatar role')
      .populate('project', 'name key modules')
      .populate('statusHistory.changedBy', 'firstName lastName avatar');

    if (!bug) {
      throw Object.assign(new Error('Bug not found'), { statusCode: 404 });
    }
    return bug;
  }

  async getBugByBugId(bugId) {
    const bug = await Bug.findOne({ bugId })
      .populate('reporter', 'firstName lastName email avatar role')
      .populate('assignedTo', 'firstName lastName email avatar role')
      .populate('project', 'name key modules')
      .populate('statusHistory.changedBy', 'firstName lastName avatar');

    if (!bug) {
      throw Object.assign(new Error('Bug not found'), { statusCode: 404 });
    }
    return bug;
  }

  async updateBug(bugId, updateData, userId) {
    const bug = await Bug.findById(bugId);
    if (!bug) {
      throw Object.assign(new Error('Bug not found'), { statusCode: 404 });
    }

    // Handle screenshot append ($push passed from controller)
    const screenshotPush = updateData.$push;
    delete updateData.$push;

    const oldValues = {
      status: bug.status,
      priority: bug.priority,
      severity: bug.severity,
      assignedTo: bug.assignedTo?.toString(),
    };

    // Track status change — record in history
    if (updateData.status && updateData.status !== oldValues.status) {
      bug.statusHistory.push({
        status: updateData.status,
        changedBy: userId,
        comment: updateData.statusComment || '',
      });
      await Activity.create({
        user: userId,
        action: 'status_changed',
        bug: bug._id,
        project: bug.project,
        details: `Status changed from "${oldValues.status}" to "${updateData.status}"`,
        metadata: { from: oldValues.status, to: updateData.status },
      });
    }

    // Track priority change
    if (updateData.priority && updateData.priority !== oldValues.priority) {
      await Activity.create({
        user: userId,
        action: 'updated_bug',
        bug: bug._id,
        project: bug.project,
        details: `Priority changed from "${oldValues.priority}" to "${updateData.priority}"`,
        metadata: { field: 'priority', from: oldValues.priority, to: updateData.priority },
      });
    }

    // Track severity change
    if (updateData.severity && updateData.severity !== oldValues.severity) {
      await Activity.create({
        user: userId,
        action: 'updated_bug',
        bug: bug._id,
        project: bug.project,
        details: `Severity changed from "${oldValues.severity}" to "${updateData.severity}"`,
        metadata: { field: 'severity', from: oldValues.severity, to: updateData.severity },
      });
    }

    // Track assignment change
    if (
      updateData.assignedTo !== undefined &&
      updateData.assignedTo?.toString() !== oldValues.assignedTo
    ) {
      await Activity.create({
        user: userId,
        action: 'assigned_bug',
        bug: bug._id,
        project: bug.project,
        details: updateData.assignedTo
          ? `Bug assigned to a new developer`
          : `Bug unassigned`,
        metadata: { assignedTo: updateData.assignedTo },
      });
    }

    // Track general update
    const editableFields = ['title', 'description', 'stepsToReproduce', 'expectedResult', 'actualResult'];
    const hasEdit = editableFields.some(
      (f) => updateData[f] !== undefined && updateData[f] !== bug[f]
    );
    if (hasEdit) {
      await Activity.create({
        user: userId,
        action: 'updated_bug',
        bug: bug._id,
        project: bug.project,
        details: `Bug details updated`,
      });
    }

    // Remove internal field before assigning
    delete updateData.statusComment;
    Object.assign(bug, updateData);

    // Append screenshots if any
    if (screenshotPush?.screenshots?.$each?.length) {
      bug.screenshots.push(...screenshotPush.screenshots.$each);
    }

    await bug.save();

    return await Bug.findById(bugId)
      .populate('reporter', 'firstName lastName email avatar')
      .populate('assignedTo', 'firstName lastName email avatar')
      .populate('project', 'name key');
  }

  async deleteBug(bugId) {
    const bug = await Bug.findByIdAndDelete(bugId);
    if (!bug) {
      throw Object.assign(new Error('Bug not found'), { statusCode: 404 });
    }
    return bug;
  }

  async getBugActivity(bugId) {
    return await Activity.find({ bug: bugId })
      .populate('user', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(50);
  }

  async getDashboardStats(userId, role) {
    const matchStage = {};
    if (role === 'developer') {
      // HIGH-005 fix: Show bugs assigned to OR reported by the developer
      matchStage.$or = [{ assignedTo: userId }, { reporter: userId }];
    }

    const [
      totalBugs,
      openBugs,
      closedBugs,
      criticalBugs,
      majorBugs,
      minorBugs,
      assignedToMe,
      statusDistribution,
      severityDistribution,
      priorityDistribution,
      monthlyTrend,
      recentActivity,
    ] = await Promise.all([
      Bug.countDocuments(matchStage),
      Bug.countDocuments({ ...matchStage, status: { $in: ['open', 'assigned', 'reopened'] } }),
      Bug.countDocuments({ ...matchStage, status: 'closed' }),
      Bug.countDocuments({ ...matchStage, priority: 'critical' }),
      Bug.countDocuments({ ...matchStage, severity: 'major' }),
      Bug.countDocuments({ ...matchStage, severity: 'minor' }),
      Bug.countDocuments({ assignedTo: userId, status: { $nin: ['closed'] } }),
      Bug.aggregate([
        { $match: matchStage },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Bug.aggregate([
        { $match: matchStage },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
      ]),
      Bug.aggregate([
        { $match: matchStage },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Bug.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 },
      ]),
      Activity.find()
        .populate('user', 'firstName lastName avatar')
        .populate('bug', 'title bugId')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    return {
      stats: {
        totalBugs,
        openBugs,
        closedBugs,
        criticalBugs,
        majorBugs,
        minorBugs,
        assignedToMe,
      },
      charts: {
        statusDistribution,
        severityDistribution,
        priorityDistribution,
        monthlyTrend,
      },
      recentActivity,
    };
  }

  buildQuery(filters) {
    const query = {};

    if (filters.search) {
      // Regex fallback for text search (works even without text index)
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { bugId: { $regex: filters.search, $options: 'i' } },
      ];
    }
    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.severity) query.severity = filters.severity;
    if (filters.project) query.project = filters.project;
    // CRIT-004 fix: Handle "unassigned" special value
    if (filters.assignedTo) {
      if (filters.assignedTo === 'unassigned') {
        query.assignedTo = { $eq: null };
      } else {
        query.assignedTo = filters.assignedTo;
      }
    }
    if (filters.reporter) query.reporter = filters.reporter;
    if (filters.module) query.module = filters.module;
    if (filters.environment) query.environment = filters.environment;

    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) {
        const end = new Date(filters.dateTo);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    return query;
  }
}

module.exports = new BugService();
