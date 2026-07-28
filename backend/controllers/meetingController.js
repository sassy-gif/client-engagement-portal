const pool = require('../config/db');

// POST /api/projects/:projectId/meetings — Admin, Team Member
async function createMeeting(req, res) {
  const { projectId } = req.params;
  const { title, meetingDate, notes } = req.body;

  if (!title || !meetingDate) {
    return res.status(400).json({ message: 'Title and meetingDate are required' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO meetings (project_id, scheduled_by, title, meeting_date, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [projectId, req.user.id, title, meetingDate, notes || null]
    );

    res.status(201).json({ id: result.insertId, title, meetingDate });
  } catch (err) {
    console.error('Create meeting error:', err);
    res.status(500).json({ message: 'Server error creating meeting' });
  }
}

// GET /api/projects/:projectId/meetings — Admin, Team Member, Client
async function getProjectMeetings(req, res) {
  const { projectId } = req.params;

  try {
    const [meetings] = await pool.query(
      `SELECT m.id, m.title, m.meeting_date, m.notes, u.full_name AS scheduled_by_name
       FROM meetings m
       JOIN users u ON m.scheduled_by = u.id
       WHERE m.project_id = ?
       ORDER BY m.meeting_date ASC`,
      [projectId]
    );
    res.json(meetings);
  } catch (err) {
    console.error('Get meetings error:', err);
    res.status(500).json({ message: 'Server error fetching meetings' });
  }
}

module.exports = { createMeeting, getProjectMeetings };