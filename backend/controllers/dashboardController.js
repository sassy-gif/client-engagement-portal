const pool = require('../config/db');

// GET /api/clients/:clientId/dashboard
// Assembles the full client workspace: client info + all their projects,
// each with milestones (if applicable) and recent client-visible activity.
async function getClientDashboard(req, res) {
  const requestedClientId = parseInt(req.params.clientId, 10);

  // A client user can only ever view their own workspace
  if (req.user.role === 'client' && req.user.clientId !== requestedClientId) {
    return res.status(403).json({ message: 'You can only view your own workspace' });
  }

  try {
    const [clientRows] = await pool.query(
      'SELECT id, company_name, contact_person, contact_email, logo_url FROM clients WHERE id = ? AND is_active = TRUE',
      [requestedClientId]
    );

    if (clientRows.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const client = clientRows[0];

    const [projects] = await pool.query(
      `SELECT p.id, p.name, p.service_type, p.progress_mode, p.status,
              p.start_date, p.end_date, u.full_name AS account_manager
       FROM projects p
       LEFT JOIN users u ON p.account_manager_id = u.id
       WHERE p.client_id = ?
       ORDER BY p.status = 'active' DESC, p.created_at DESC`,
      [requestedClientId]
    );

    const enrichedProjects = await Promise.all(
      projects.map(async (project) => {
        let milestones = [];
        if (project.progress_mode === 'milestone' || project.progress_mode === 'hybrid') {
          const [milestoneRows] = await pool.query(
            `SELECT id, title, sequence_order, status, completed_at
             FROM project_milestones
             WHERE project_id = ?
             ORDER BY sequence_order ASC`,
            [project.id]
          );
          milestones = milestoneRows;
        }

        const [recentActivity] = await pool.query(
          `SELECT id, type, title, description, created_at
           FROM activities
           WHERE project_id = ? AND visibility = 'client_visible'
           ORDER BY created_at DESC
           LIMIT 5`,
          [project.id]
        );

        return { ...project, milestones, recentActivity };
      })
    );

    res.json({ client, projects: enrichedProjects });
  } catch (err) {
    console.error('Dashboard fetch error:', err);
    res.status(500).json({ message: 'Server error loading dashboard' });
  }
}

module.exports = { getClientDashboard };