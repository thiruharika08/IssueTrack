const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Project name is required'),
    body('key')
      .trim()
      .notEmpty()
      .withMessage('Project key is required')
      .isLength({ max: 10 })
      .withMessage('Key must be 10 characters or less'),
    body('status')
      .optional()
      .isIn(['planning', 'active', 'on_hold', 'completed', 'archived'])
      .withMessage('Invalid status'),
    body('startDate').optional().isISO8601().withMessage('Invalid start date'),
    body('endDate').optional().isISO8601().withMessage('Invalid end date'),
  ],
  validate,
  projectController.createProject
);

router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);

router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Project name cannot be empty'),
    body('status')
      .optional()
      .isIn(['planning', 'active', 'on_hold', 'completed', 'archived'])
      .withMessage('Invalid status'),
    body('startDate').optional().isISO8601().withMessage('Invalid start date'),
    body('endDate').optional().isISO8601().withMessage('Invalid end date'),
  ],
  validate,
  projectController.updateProject
);

router.delete('/:id', authorize('admin', 'manager'), projectController.deleteProject);

module.exports = router;
