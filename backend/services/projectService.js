const Project = require('../models/Project');
const Activity = require('../models/Activity');

class ProjectService {
  async createProject(projectData, userId) {
    const project = await Project.create({ ...projectData, lead: userId });

    await Activity.create({
      user: userId,
      action: 'created_project',
      project: project._id,
      details: `Created project: ${project.name}`,
    });

    return await Project.findById(project._id).populate('lead', 'firstName lastName email');
  }

  async getProjects(filters = {}) {
    const query = {};
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.lead) query.lead = filters.lead;

    return await Project.find(query)
      .populate('lead', 'firstName lastName email avatar')
      .populate('members', 'firstName lastName email avatar')
      .sort({ createdAt: -1 });
  }

  async getProjectById(projectId) {
    const project = await Project.findById(projectId)
      .populate('lead', 'firstName lastName email avatar role')
      .populate('members', 'firstName lastName email avatar role');

    if (!project) {
      throw Object.assign(new Error('Project not found'), { statusCode: 404 });
    }
    return project;
  }

  async updateProject(projectId, updateData, userId) {
    const project = await Project.findByIdAndUpdate(projectId, updateData, {
      new: true,
      runValidators: true,
    }).populate('lead', 'firstName lastName email');

    if (!project) {
      throw Object.assign(new Error('Project not found'), { statusCode: 404 });
    }

    await Activity.create({
      user: userId,
      action: 'updated_project',
      project: project._id,
      details: `Updated project: ${project.name}`,
    });

    return project;
  }

  async deleteProject(projectId) {
    // MED-005 fix: Prevent deletion if project has associated bugs
    const Bug = require('../models/Bug');
    const bugCount = await Bug.countDocuments({ project: projectId });
    if (bugCount > 0) {
      throw Object.assign(
        new Error(`Cannot delete project with ${bugCount} associated bug${bugCount > 1 ? 's' : ''}. Reassign or delete bugs first.`),
        { statusCode: 400 }
      );
    }

    const project = await Project.findByIdAndDelete(projectId);
    if (!project) {
      throw Object.assign(new Error('Project not found'), { statusCode: 404 });
    }
    return project;
  }
}

module.exports = new ProjectService();
