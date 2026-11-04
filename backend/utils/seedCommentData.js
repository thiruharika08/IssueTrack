/**
 * Comment data generator for BugTracker Pro seed script.
 * Generates 4-7 realistic QA conversation comments per bug.
 * Comments follow bug lifecycle and are timestamped chronologically.
 */

// Comment templates by role type
const QA_COMMENTS = [
  'Reproduced consistently on {browser} {os}. Attaching screenshot.',
  'Confirmed this is still present on the latest build (v{version}).',
  'Tested on staging after the fix was deployed. Issue no longer reproducible.',
  'Unable to reproduce on my end. Can you provide the exact build version?',
  'This is a regression. Was working correctly in last week\'s release.',
  'Severity should be escalated — this affects the checkout flow for all users.',
  'Verified the fix on Chrome, Firefox, and Safari. All passing.',
  'Retested after the patch. Same error persists in Edge browser.',
  'Adding additional steps to reproduce. The bug only appears after clearing cache.',
  'Confirmed fix in build {version}. Closing.',
  'Customer reported this via support ticket #ST-{ticket}. High priority.',
  'This blocks the smoke test suite. Cannot proceed with release testing.',
  'Narrowed down the root cause — it only happens when the user has 2FA enabled.',
  'I see this on both Android 13 and 14. iOS seems unaffected.',
  'Frequency: approximately 1 in 5 attempts. Intermittent but consistent on slow networks.',
  'Screenshot attached showing the error state. Console has no visible errors.',
  'Updated steps to reproduce. The original steps were missing step 3.',
  'Ran automated regression suite — 3 related test cases now failing.',
];

const DEV_COMMENTS = [
  'Root cause identified. The state is not persisted to the session store on page navigation.',
  'Fix pushed in commit {commit}. Please verify on staging.',
  'This is a known race condition. Implementing optimistic locking.',
  'Fixed. The issue was a missing null check in the response handler.',
  'Deployed to staging. @QA please verify when you get a chance.',
  'Investigating. Need access to production logs for the affected time window.',
  'The API returns 200 but the response payload is malformed. Fixing the serializer.',
  'Fixed by adding a debounce to the submit handler. PR #{pr} is up for review.',
  'This requires a database migration. Scheduling for next maintenance window.',
  'Root cause: cache invalidation timing. Increased TTL to 5 minutes.',
  'Applied the fix. Also added unit tests to prevent regression.',
  'Cannot reproduce locally. Requesting environment details and network HAR file.',
  'Hotfix deployed to production. Monitoring for recurrence.',
  'The issue is in the third-party SDK. Filed upstream bug report.',
  'Refactored the component to handle edge cases. Ready for QA.',
];

const LEAD_COMMENTS = [
  'Please prioritize this before Sprint Review on Friday.',
  'Escalating to P1. This is impacting 200+ users daily.',
  'Adding to the regression test suite to prevent recurrence.',
  'Good catch. Let\'s add a smoke test for this flow.',
  'Defer to next sprint. Current sprint capacity is full.',
  'This needs to be fixed before we can certify the release.',
  'Assigning back to development. Fix did not address the root cause.',
  'Moving to Ready for Testing. Dev confirmed the fix in staging.',
  'Let\'s schedule a root cause analysis meeting for this cluster of bugs.',
  'Verified internally. Promoting to UAT for stakeholder sign-off.',
];

const MANAGER_COMMENTS = [
  'Customer escalation received from the enterprise accounts team.',
  'This is blocking the Q3 release milestone. Please expedite.',
  'Stakeholders are asking for an ETA on resolution.',
  'Adding this to the risk register for the steering committee update.',
  'Can we get a workaround documented while the permanent fix is in progress?',
  'Great work on the quick turnaround. Client is satisfied with the fix.',
  'Please update the release notes to reflect this fix.',
  'Adding to the post-mortem agenda for Friday\'s retrospective.',
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomCommit() {
  return Math.random().toString(16).substring(2, 9);
}

function randomVersion() {
  return `${randomInt(2, 5)}.${randomInt(0, 9)}.${randomInt(0, 20)}`;
}

function fillTemplate(template) {
  return template
    .replace('{browser}', randomElement(['Chrome 125', 'Firefox 128', 'Safari 17', 'Edge 124']))
    .replace('{os}', randomElement(['Windows 11', 'macOS Sonoma', 'Ubuntu 22.04', 'Android 14']))
    .replace('{version}', randomVersion())
    .replace('{commit}', randomCommit())
    .replace('{pr}', String(randomInt(1200, 4500)))
    .replace('{ticket}', String(randomInt(5000, 9999)));
}

function generateCommentData(users, bugs) {
  const comments = [];

  // User role mapping for realistic conversations
  // QA: indices 3-9, Dev: 10-14, Managers: 1-2, Admin: 0
  const qaUsers = [users[3], users[4], users[5], users[6], users[7], users[8], users[9]];
  const devUsers = [users[10], users[11], users[12], users[13], users[14]];
  const leadUsers = [users[3], users[4], users[5]]; // QA leads double as leads
  const mgrUsers = [users[1], users[2]];

  for (const bug of bugs) {
    const numComments = randomInt(4, 7);
    const bugCreatedAt = bug.createdAt ? new Date(bug.createdAt) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    for (let i = 0; i < numComments; i++) {
      // Chronological progression: each comment 1-14 days after previous
      const daysAfterCreation = (i + 1) * randomInt(1, 14);
      const commentDate = new Date(bugCreatedAt.getTime() + daysAfterCreation * 24 * 60 * 60 * 1000);

      // Determine who comments based on position in conversation
      let author, message;
      const phase = i / numComments; // 0.0 to 1.0 through lifecycle

      if (phase < 0.25) {
        // Early: QA reporting details
        author = randomElement(qaUsers);
        message = fillTemplate(randomElement(QA_COMMENTS));
      } else if (phase < 0.5) {
        // Middle-early: Dev investigating
        author = bug.assignedTo ? users.find(u => u._id.toString() === bug.assignedTo.toString()) || randomElement(devUsers) : randomElement(devUsers);
        message = fillTemplate(randomElement(DEV_COMMENTS));
      } else if (phase < 0.75) {
        // Middle-late: Mix of lead/dev updates
        if (Math.random() > 0.5) {
          author = randomElement(leadUsers);
          message = fillTemplate(randomElement(LEAD_COMMENTS));
        } else {
          author = randomElement(devUsers);
          message = fillTemplate(randomElement(DEV_COMMENTS));
        }
      } else {
        // Late: Final verification or manager sign-off
        if (Math.random() > 0.6) {
          author = randomElement(mgrUsers);
          message = fillTemplate(randomElement(MANAGER_COMMENTS));
        } else {
          author = randomElement(qaUsers);
          message = fillTemplate(randomElement(QA_COMMENTS));
        }
      }

      comments.push({
        bug: bug._id,
        author: author._id,
        message,
        isEdited: Math.random() < 0.08, // 8% chance of being edited
        createdAt: commentDate,
        updatedAt: commentDate,
      });
    }
  }

  return comments;
}

module.exports = generateCommentData;
