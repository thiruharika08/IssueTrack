const bugService = require('../services/bugService');

exports.createBug = async (req, res, next) => {
  try {
    const bugData = { ...req.body };

    if (req.files && req.files.length > 0) {
      bugData.screenshots = req.files.map((file) => ({
        filename: file.originalname,
        path: `/uploads/${file.filename}`,
      }));
    }

    const bug = await bugService.createBug(bugData, req.user._id);
    res.status(201).json({ success: true, data: bug });
  } catch (error) {
    next(error);
  }
};

exports.getBugs = async (req, res, next) => {
  try {
    const { page, limit, sort, order, ...filters } = req.query;
    const result = await bugService.getBugs(filters, { page, limit, sort, order });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

exports.getBugById = async (req, res, next) => {
  try {
    const bug = await bugService.getBugById(req.params.id);
    res.status(200).json({ success: true, data: bug });
  } catch (error) {
    next(error);
  }
};

exports.getBugByBugId = async (req, res, next) => {
  try {
    const bug = await bugService.getBugByBugId(req.params.bugId);
    res.status(200).json({ success: true, data: bug });
  } catch (error) {
    next(error);
  }
};

exports.updateBug = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    if (req.files && req.files.length > 0) {
      // Append new screenshots rather than replacing all existing ones
      updateData.$push = {
        screenshots: {
          $each: req.files.map((file) => ({
            filename: file.originalname,
            path: `/uploads/${file.filename}`,
          })),
        },
      };
    }

    const bug = await bugService.updateBug(req.params.id, updateData, req.user._id);
    res.status(200).json({ success: true, data: bug });
  } catch (error) {
    next(error);
  }
};

exports.deleteBug = async (req, res, next) => {
  try {
    await bugService.deleteBug(req.params.id);
    res.status(200).json({ success: true, message: 'Bug deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = await bugService.getDashboardStats(req.user._id, req.user.role);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

exports.updateBugStatus = async (req, res, next) => {
  try {
    const { status, comment } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    const bug = await bugService.updateBug(
      req.params.id,
      { status, statusComment: comment },
      req.user._id
    );
    res.status(200).json({ success: true, data: bug });
  } catch (error) {
    next(error);
  }
};

exports.getBugActivity = async (req, res, next) => {
  try {
    const activities = await bugService.getBugActivity(req.params.id);
    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    next(error);
  }
};

exports.deleteScreenshot = async (req, res, next) => {
  try {
    const { screenshotId } = req.params;
    const Bug = require('../models/Bug');
    const bug = await Bug.findByIdAndUpdate(
      req.params.id,
      { $pull: { screenshots: { _id: screenshotId } } },
      { new: true }
    )
      .populate('reporter', 'firstName lastName email avatar')
      .populate('assignedTo', 'firstName lastName email avatar')
      .populate('project', 'name key');

    if (!bug) {
      return res.status(404).json({ success: false, message: 'Bug not found' });
    }
    res.status(200).json({ success: true, data: bug });
  } catch (error) {
    next(error);
  }
};
