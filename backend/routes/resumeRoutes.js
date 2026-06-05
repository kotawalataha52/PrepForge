const express = require('express');
const multer = require('multer');
const { protect } = require('../middlewares/authMiddleware');
const { analyzeResume } = require('../controllers/resumeController');

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

// Single Endpoint for ATS processing
router.post('/intel', protect, upload.single('resume'), analyzeResume);

module.exports = router;
