const pool = require('../config/db');

// GET /api/analytics/overview — Admin, Team Member
// Returns counts for a simple dashboard chart: projects by status, tasks by status.
async function getOverview(req, res) {
  try {
    const [projectStats] = await pool.query(
      `SELECT status, COUNT(*) AS count FROM projects GROUP BY status`
    );

    const [taskStats] = await pool.query(
      `SELECT status, COUNT(*) AS count FROM tasks GROUP BY status`
    );

    const [totals] = await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM clients WHERE is_active = TRUE) AS totalClients,
        (SELECT COUNT(*) FROM projects) AS totalProjects,
        (SELECT COUNT(*) FROM tasks) AS totalTasks`
    );

    res.json({
      projectsByStatus: projectStats,
      tasksByStatus: taskStats,
      totals: totals[0]
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
}

module.exports = { getOverview };