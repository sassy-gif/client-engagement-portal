const express = require('express');
const router = express.Router();
const { getOverview } = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/analytics/overview', authenticate, authorize('admin', 'team_member'), getOverview);

module.exports = router;