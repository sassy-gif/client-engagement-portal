const express = require('express');
const router = express.Router();
const { createActivity, getProjectActivities } = require('../controllers/activityController');
const { authenticate, authorize } = require('../middleware/auth');

// Only Admin/Team can log activity entries
router.post(
  '/projects/:projectId/activities',
  authenticate,
  authorize('admin', 'team_member'),
  createActivity
);

// Admin/Team/Client can all view — filtering by visibility happens inside the controller
router.get(
  '/projects/:projectId/activities',
  authenticate,
  authorize('admin', 'team_member', 'client'),
  getProjectActivities
);

module.exports = router;