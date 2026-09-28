const express = require('express');
const multer = require('multer');
const { protect } = require('../middlewares/authMiddleware');
const { analyzeResume, rewriteResume, rescoreResume } = require('../controllers/resumeController');

const router = express.Router();

// Memory limits for Resume PDF
const storage = multer.memoryStorage();
const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only .pdf format allowed!'), false);
    }
  }
});

// ATS score and missing keywords endpoint
router.post('/intel', protect, upload.single('resume'), analyzeResume);

// AI Resume Rewriter and Job Description Tailor endpoint
router.post('/rewrite', protect, upload.single('resume'), rewriteResume);

// NEW: Instant ATS Re-score for user edits
router.post('/rescore', protect, express.json(), rescoreResume);

module.exports = router;
