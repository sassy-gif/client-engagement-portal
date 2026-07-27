const pool = require('../config/db');

// POST /api/projects/:projectId/tasks — Admin only
async function createTask(req, res) {
  const { projectId } = req.params;
  const { title, description, assignedTo, priority, dueDate } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO tasks (project_id, assigned_to, title, description, priority, due_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [projectId, assignedTo || null, title, description || null, priority || 'medium', dueDate || null]
    );

    res.status(201).json({ id: result.insertId, projectId: Number(projectId), title, status: 'todo' });
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ message: 'Server error creating task' });
  }
}

// GET /api/projects/:projectId/tasks — Admin, Team Member
async function getProjectTasks(req, res) {
  const { projectId } = req.params;

  try {
    const [tasks] = await pool.query(
      `SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date,
              u.full_name AS assignee_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.project_id = ?
       ORDER BY t.created_at DESC`,
      [projectId]
    );
    res.json(tasks);
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
}

// PATCH /api/tasks/:taskId — Admin, or the Team Member it's assigned to
async function updateTaskStatus(req, res) {
  const { taskId } = req.params;
  const { status } = req.body;

  const validStatuses = ['todo', 'in_progress', 'review', 'done'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    // Team members can only update tasks assigned to them
    if (req.user.role === 'team_member') {
      const [taskRows] = await pool.query('SELECT assigned_to FROM tasks WHERE id = ?', [taskId]);
      if (taskRows.length === 0) {
        return res.status(404).json({ message: 'Task not found' });
      }
      if (taskRows[0].assigned_to !== req.user.id) {
        return res.status(403).json({ message: 'You can only update tasks assigned to you' });
      }
    }

    await pool.query('UPDATE tasks SET status = ? WHERE id = ?', [status, taskId]);
    res.json({ id: Number(taskId), status });
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ message: 'Server error updating task' });
  }
}

module.exports = { createTask, getProjectTasks, updateTaskStatus };