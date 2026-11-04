const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();
const bugController = require('../controllers/bugController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

router.use(protect);

// Dashboard stats — must be before /:id
router.get('/dashboard', bugController.getDashboardStats);

// Create
router.post(
  '/',
  upload.array('screenshots', 5),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('project').notEmpty().withMessage('Project is required'),
    body('priority')
      .optional()
      .isIn(['critical', 'high', 'medium', 'low'])
      .withMessage('Invalid priority'),
    body('severity')
      .optional()
      .isIn(['blocker', 'critical', 'major', 'minor', 'trivial'])
      .withMessage('Invalid severity'),
    body('environment')
      .optional()
      .isIn(['production', 'staging', 'development', 'testing', 'uat'])
      .withMessage('Invalid environment'),
  ],
  validate,
  bugController.createBug
);

// List with filters / sort / pagination
router.get('/', bugController.getBugs);

// Get by human-readable bugId (e.g. PROJ-0001)
router.get('/ref/:bugId', bugController.getBugByBugId);

// Get single
router.get('/:id', bugController.getBugById);

// Activity timeline for a bug
router.get('/:id/activity', bugController.getBugActivity);

// Full update (supports multipart for screenshots)
router.put('/:id', upload.array('screenshots', 5), bugController.updateBug);

// Patch status only
router.patch(
  '/:id/status',
  [
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn(['open', 'assigned', 'in_progress', 'resolved', 'ready_for_testing', 'closed', 'reopened'])
      .withMessage('Invalid status'),
  ],
  validate,
  bugController.updateBugStatus
);

// Delete a specific screenshot
router.delete('/:id/screenshots/:screenshotId', bugController.deleteScreenshot);

// Delete bug (admin + manager only)
router.delete('/:id', authorize('admin', 'manager'), bugController.deleteBug);

module.exports = router;
