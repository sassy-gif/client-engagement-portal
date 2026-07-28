const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  uploadDocument,
  getProjectDocuments,
  downloadDocument
} = require('../controllers/documentController');
const { authenticate, authorize } = require('../middleware/auth');

// Configure where and how multer saves uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    // Prefix with timestamp to avoid filename collisions
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.post(
  '/projects/:projectId/documents',
  authenticate,
  authorize('admin', 'team_member'),
  upload.single('file'),
  uploadDocument
);

router.get(
  '/projects/:projectId/documents',
  authenticate,
  authorize('admin', 'team_member', 'client'),
  getProjectDocuments
);

router.get(
  '/documents/:documentId/download',
  authenticate,
  authorize('admin', 'team_member', 'client'),
  downloadDocument
);

module.exports = router;