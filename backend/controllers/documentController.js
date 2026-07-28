const pool = require('../config/db');

// POST /api/projects/:projectId/documents — Admin, Team Member
// Expects a file upload (handled by multer middleware in the route file)
async function uploadDocument(req, res) {
  const { projectId } = req.params;
  const { visibility } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const finalVisibility = visibility === 'client_visible' ? 'client_visible' : 'internal';

  try {
    const [result] = await pool.query(
      `INSERT INTO documents (project_id, uploaded_by, file_name, file_path, file_size, visibility)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [projectId, req.user.id, req.file.originalname, req.file.path, req.file.size, finalVisibility]
    );

    res.status(201).json({
      id: result.insertId,
      fileName: req.file.originalname,
      visibility: finalVisibility
    });
  } catch (err) {
    console.error('Upload document error:', err);
    res.status(500).json({ message: 'Server error uploading document' });
  }
}

// GET /api/projects/:projectId/documents
async function getProjectDocuments(req, res) {
  const { projectId } = req.params;

  try {
    let query = `
      SELECT d.id, d.file_name, d.file_size, d.visibility, d.created_at,
             u.full_name AS uploaded_by_name
      FROM documents d
      JOIN users u ON d.uploaded_by = u.id
      WHERE d.project_id = ?
    `;
    const params = [projectId];

    if (req.user.role === 'client') {
      query += " AND d.visibility = 'client_visible'";
    }

    query += ' ORDER BY d.created_at DESC';

    const [documents] = await pool.query(query, params);
    res.json(documents);
  } catch (err) {
    console.error('Get documents error:', err);
    res.status(500).json({ message: 'Server error fetching documents' });
  }
}

// GET /api/documents/:documentId/download
async function downloadDocument(req, res) {
  const { documentId } = req.params;

  try {
    const [rows] = await pool.query('SELECT * FROM documents WHERE id = ?', [documentId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const doc = rows[0];

    if (req.user.role === 'client' && doc.visibility !== 'client_visible') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.download(doc.file_path, doc.file_name);
  } catch (err) {
    console.error('Download document error:', err);
    res.status(500).json({ message: 'Server error downloading document' });
  }
}

module.exports = { uploadDocument, getProjectDocuments, downloadDocument };