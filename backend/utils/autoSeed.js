/**
 * Auto-Seed Module
 * Called by server.js on startup in development mode.
 * Seeds the database ONLY if it's empty (0 users).
 * Does not call process.exit — runs inline with the server process.
 */

const User = require('../models/User');
const Project = require('../models/Project');
const Bug = require('../models/Bug');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');

async function autoSeed() {
  // Check if database already has data
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    console.log(`  ℹ Database already has ${userCount} users — skipping auto-seed`);
    return;
  }

  console.log('  ⏳ Empty database detected — running auto-seed...');
  const startTime = Date.now();

  try {
    // Load data generators
    const getUserData = require('./seedUserData');
    const getProjectData = require('./seedProjectData');
    const getBugDataBatch1 = require('./seedBugData');
    const getBugDataBatch2 = require('./seedBugData2');
    const getCommentData = require('./seedCommentData');
    const getActivityData = require('./seedActivityData');

    // 1. Insert Users
    const users = await User.create(getUserData());
    console.log(`  ✔ ${users.length} users seeded`);

    // 2. Insert Projects
    const projectData = getProjectData(users);
    const projects = await Project.create(projectData);
    console.log(`  ✔ ${projects.length} projects seeded`);

    // 3. Insert Bugs (sequential for bugId auto-generation)
    const bugData = [...getBugDataBatch1(users, projects), ...getBugDataBatch2(users, projects)];
    const bugs = [];
    for (const data of bugData) {
      const bug = await Bug.create(data);
      bugs.push(bug);
    }
    console.log(`  ✔ ${bugs.length} bugs seeded`);

    // 4. Insert Comments
    const commentData = getCommentData(users, bugs);
    await Comment.insertMany(commentData);
    console.log(`  ✔ ${commentData.length} comments seeded`);

    // 5. Insert Activities
    const activityData = getActivityData(users, projects, bugs);
    await Activity.insertMany(activityData);
    console.log(`  ✔ ${activityData.length} activities seeded`);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`  ✅ Auto-seed complete in ${elapsed}s`);
    console.log(`  🔑 Login: siva0225@gmail.com / 1231231234`);

  } catch (error) {
    console.error('  ⚠ Auto-seed failed:', error.message);
    // Don't crash the server — just log the error
  }
}

module.exports = autoSeed;
