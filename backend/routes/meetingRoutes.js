const express = require('express');
const router = express.Router();
const { createMeeting, getProjectMeetings } = require('../controllers/meetingController');
const { authenticate, authorize } = require('../middleware/auth');

router.post(
  '/projects/:projectId/meetings',
  authenticate,
  authorize('admin', 'team_member'),
  createMeeting
);

router.get(
  '/projects/:projectId/meetings',
  authenticate,
  authorize('admin', 'team_member', 'client'),
  getProjectMeetings
);

module.exports = router;