const pool = require('../config/db');

// Milestone templates per service type — matches what we planned earlier.
// Services with no fixed phases (ongoing/hybrid-start) get an empty template.
const MILESTONE_TEMPLATES = {
  operational_improvement: [
    'Assessment / Current State Review',
    'Analysis & Gap Identification',
    'Recommendations',
    'Implementation Support',
    'Review & Handover'
  ],
  branding_coaching: [
    'Discovery',
    'Concept Development',
    'Refinement',
    'Final Delivery'
  ],
  website_development: [
    'Requirements & Planning',
    'Design',
    'Development',
    'Testing & Revisions',
    'Launch'
  ],
  sponsorship_partnership: [
    'Prospecting / Outreach',
    'Discussion / Negotiation',
    'Agreement Signed'
  ],
  social_media_management: [],
  ongoing_consulting: []
};

// Decides progress_mode automatically based on service_type,
// matching the plan we agreed on earlier.
function getProgressMode(serviceType) {
  if (serviceType === 'social_media_management' || serviceType === 'ongoing_consulting') {
    return 'ongoing';
  }
  if (serviceType === 'sponsorship_partnership') {
    return 'hybrid';
  }
  return 'milestone';
}

// POST /api/projects — Admin only
async function createProject(req, res) {
  const { clientId, name, serviceType, accountManagerId, startDate } = req.body;

  if (!clientId || !name || !serviceType) {
    return res.status(400).json({ message: 'clientId, name, and serviceType are required' });
  }

  const progressMode = getProgressMode(serviceType);

  try {
    const [result] = await pool.query(
      `INSERT INTO projects (client_id, name, service_type, progress_mode, account_manager_id, start_date, status)
       VALUES (?, ?, ?, ?, ?, ?, 'planning')`,
      [clientId, name, serviceType, progressMode, accountManagerId || null, startDate || null]
    );

    const projectId = result.insertId;

    // Auto-create milestone rows from the template, if one exists for this service type
    const template = MILESTONE_TEMPLATES[serviceType] || [];
    for (let i = 0; i < template.length; i++) {
      await pool.query(
        `INSERT INTO project_milestones (project_id, title, sequence_order, status)
         VALUES (?, ?, ?, 'pending')`,
        [projectId, template[i], i + 1]
      );
    }

    res.status(201).json({ id: projectId, name, serviceType, progressMode, milestonesCreated: template.length });
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ message: 'Server error creating project' });
  }
}

// GET /api/projects — Admin and Team Member
async function getProjects(req, res) {
  try {
    const [projects] = await pool.query(
      `SELECT p.id, p.name, p.service_type, p.progress_mode, p.status, p.start_date,
              c.company_name AS client_name
       FROM projects p
       JOIN clients c ON p.client_id = c.id
       ORDER BY p.created_at DESC`
    );
    res.json(projects);
  } catch (err) {
    console.error('Get projects error:', err);
    res.status(500).json({ message: 'Server error fetching projects' });
  }
}

module.exports = { createProject, getProjects };