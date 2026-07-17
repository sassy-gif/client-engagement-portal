const express = require('express');
const router = express.Router();
const { createProject, getProjects } = require('../controllers/projectController');
const { authenticate, authorize } = require('../middleware/auth');

// Only Admin can create new projects
router.post('/projects', authenticate, authorize('admin'), createProject);

// Admin and Team Member can view the project list
router.get('/projects', authenticate, authorize('admin', 'team_member'), getProjects);

module.exports = router;