/**
 * Activity data generator for BugTracker Pro seed script.
 * Generates 8-15 chronological activity entries per bug.
 * Models realistic bug lifecycle progression.
 */

const VALID_ACTIONS = [
  'created_bug',
  'updated_bug',
  'assigned_bug',
  'status_changed',
  'commented',
  'uploaded_screenshot',
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Status transitions that make sense in order
const STATUS_PROGRESSIONS = {
  open: ['assigned', 'in_progress'],
  assigned: ['in_progress'],
  in_progress: ['resolved', 'ready_for_testing'],
  resolved: ['ready_for_testing', 'closed', 'reopened'],
  ready_for_testing: ['closed', 'reopened'],
  closed: ['reopened'],
  reopened: ['assigned', 'in_progress'],
};

function generateActivityData(users, projects, bugs) {
  const activities = [];

  const qaUsers = [users[3], users[4], users[5], users[6], users[7], users[8], users[9]];
  const devUsers = [users[10], users[11], users[12], users[13], users[14]];
  const mgrUsers = [users[1], users[2]];
  const allUsers = [...qaUsers, ...devUsers, ...mgrUsers, users[0]];

  for (const bug of bugs) {
    const numActivities = randomInt(8, 15);
    const bugCreatedAt = bug.createdAt
      ? new Date(bug.createdAt)
      : new Date(Date.now() - 120 * 24 * 60 * 60 * 1000);

    let currentStatus = 'open';
    let currentTime = new Date(bugCreatedAt.getTime());

    // Activity 1: Always "created_bug"
    activities.push({
      user: bug.reporter || randomElement(qaUsers)._id,
      action: 'created_bug',
      bug: bug._id,
      project: bug.project,
      details: `Created bug: ${bug.title.substring(0, 80)}`,
      createdAt: currentTime,
      updatedAt: currentTime,
    });

    // Generate remaining activities chronologically
    for (let i = 1; i < numActivities; i++) {
      // Advance time by 2-72 hours per activity
      currentTime = new Date(currentTime.getTime() + randomInt(2, 72) * 60 * 60 * 1000);

      // Decide which type of activity to generate
      const activityType = pickActivityType(i, numActivities, currentStatus);
      let activity;

      switch (activityType) {
        case 'status_changed': {
          const possibleNext = STATUS_PROGRESSIONS[currentStatus] || ['in_progress'];
          const newStatus = randomElement(possibleNext);
          const actor = Math.random() > 0.5 ? randomElement(devUsers) : randomElement(qaUsers);
          activity = {
            user: actor._id,
            action: 'status_changed',
            bug: bug._id,
            project: bug.project,
            details: `Status changed from "${currentStatus}" to "${newStatus}"`,
            metadata: { from: currentStatus, to: newStatus },
          };
          currentStatus = newStatus;
          break;
        }

        case 'assigned_bug': {
          const assignee = randomElement(devUsers);
          const assigner = randomElement(mgrUsers);
          activity = {
            user: assigner._id,
            action: 'assigned_bug',
            bug: bug._id,
            project: bug.project,
            details: `Assigned to ${assignee.firstName} ${assignee.lastName}`,
            metadata: { assignedTo: assignee._id },
          };
          break;
        }

        case 'commented': {
          const commenter = randomElement(allUsers);
          activity = {
            user: commenter._id,
            action: 'commented',
            bug: bug._id,
            project: bug.project,
            details: `Commented on bug`,
          };
          break;
        }

        case 'updated_bug': {
          const updater = randomElement([...devUsers, ...qaUsers]);
          const fields = ['priority', 'severity', 'description', 'environment', 'assignedTo'];
          const field = randomElement(fields);
          activity = {
            user: updater._id,
            action: 'updated_bug',
            bug: bug._id,
            project: bug.project,
            details: `Updated ${field}`,
            metadata: { field },
          };
          break;
        }

        case 'uploaded_screenshot': {
          const uploader = randomElement(qaUsers);
          activity = {
            user: uploader._id,
            action: 'uploaded_screenshot',
            bug: bug._id,
            project: bug.project,
            details: `Uploaded screenshot: error_state_${randomInt(1, 9)}.png`,
          };
          break;
        }

        default: {
          const user = randomElement(allUsers);
          activity = {
            user: user._id,
            action: 'commented',
            bug: bug._id,
            project: bug.project,
            details: 'Added a comment',
          };
        }
      }

      activity.createdAt = currentTime;
      activity.updatedAt = currentTime;
      activities.push(activity);
    }
  }

  return activities;
}

/**
 * Pick a realistic activity type based on position in the lifecycle.
 */
function pickActivityType(index, total, currentStatus) {
  const phase = index / total;

  // Early phase: assignment, status changes
  if (phase < 0.2) {
    return randomElement(['assigned_bug', 'status_changed', 'commented']);
  }

  // Development phase: updates, comments, screenshots
  if (phase < 0.5) {
    const opts = ['commented', 'updated_bug', 'status_changed', 'uploaded_screenshot'];
    return randomElement(opts);
  }

  // Testing phase: status changes, comments
  if (phase < 0.8) {
    const opts = ['status_changed', 'commented', 'updated_bug', 'commented'];
    return randomElement(opts);
  }

  // Closure phase: final status changes, comments
  return randomElement(['status_changed', 'commented', 'commented']);
}

module.exports = generateActivityData;
