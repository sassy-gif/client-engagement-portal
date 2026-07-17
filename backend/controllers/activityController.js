const pool = require('../config/db');

const VALID_TYPES = ['meeting', 'call', 'email', 'update', 'document', 'task', 'note', 'feedback'];

// POST /api/projects/:projectId/activities
// Team Member / Admin logs an activity entry against a project.
async function createActivity(req, res) {
  const { projectId } = req.params;
  const { type, title, description, visibility } = req.body;

  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ message: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` });
  }
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const finalVisibility = visibility === 'client_visible' ? 'client_visible' : 'internal';

  try {
    const [result] = await pool.query(
      `INSERT INTO activities (project_id, author_id, type, title, description, visibility)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [projectId, req.user.id, type, title, description || null, finalVisibility]
    );

    res.status(201).json({
      id: result.insertId,
      projectId: Number(projectId),
      type,
      title,
      description,
      visibility: finalVisibility
    });
  } catch (err) {
    console.error('Create activity error:', err);
    res.status(500).json({ message: 'Server error logging activity' });
  }
}

// GET /api/projects/:projectId/activities
async function getProjectActivities(req, res) {
  const { projectId } = req.params;

  try {
    let query = `
      SELECT a.id, a.type, a.title, a.description, a.visibility, a.created_at,
             u.full_name AS author_name
      FROM activities a
      JOIN users u ON a.author_id = u.id
      WHERE a.project_id = ?
    `;
    const params = [projectId];

    if (req.user.role === 'client') {
      query += " AND a.visibility = 'client_visible'";
    }

    query += ' ORDER BY a.created_at DESC';

    const [activities] = await pool.query(query, params);
    res.json(activities);
  } catch (err) {
    console.error('Get activities error:', err);
    res.status(500).json({ message: 'Server error fetching activities' });
  }
}

module.exports = { createActivity, getProjectActivities };