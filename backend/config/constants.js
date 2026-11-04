module.exports = {
  ROLES: {
    ADMIN: 'admin',
    MANAGER: 'manager',
    DEVELOPER: 'developer',
    QA: 'qa_engineer',
  },

  BUG_STATUS: {
    OPEN: 'open',
    ASSIGNED: 'assigned',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    READY_FOR_TESTING: 'ready_for_testing',
    CLOSED: 'closed',
    REOPENED: 'reopened',
  },

  BUG_PRIORITY: {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
  },

  BUG_SEVERITY: {
    BLOCKER: 'blocker',
    CRITICAL: 'critical',
    MAJOR: 'major',
    MINOR: 'minor',
    TRIVIAL: 'trivial',
  },

  ENVIRONMENTS: ['production', 'staging', 'development', 'testing', 'uat'],

  BROWSERS: ['chrome', 'firefox', 'safari', 'edge', 'opera', 'other'],

  OPERATING_SYSTEMS: ['windows', 'macos', 'linux', 'android', 'ios', 'other'],

  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
};
