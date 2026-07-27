const express = require('express');
const router = express.Router();
const { createTask, getProjectTasks, updateTaskStatus } = require('../controllers/taskController');
const { authenticate, authorize } = require('../middleware/auth');

router.post(
  '/projects/:projectId/tasks',
  authenticate,
  authorize('admin'),
  createTask
);

router.get(
  '/projects/:projectId/tasks',
  authenticate,
  authorize('admin', 'team_member'),
  getProjectTasks
);

router.patch(
  '/tasks/:taskId',
  authenticate,
  authorize('admin', 'team_member'),
  updateTaskStatus
);

module.exports = router;