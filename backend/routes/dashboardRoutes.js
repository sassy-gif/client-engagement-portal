const express = require('express');
const router = express.Router();
const { getClientDashboard } = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');

router.get(
  '/clients/:clientId/dashboard',
  authenticate,
  authorize('admin', 'team_member', 'client'),
  getClientDashboard
);

module.exports = router;