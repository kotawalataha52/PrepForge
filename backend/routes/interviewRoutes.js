const express = require('express');
const multer = require('multer');
const { uploadResume, finishInterview, getHistory } = require('../controllers/interviewController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Configure local memory storage for security (no files saved permanently to disk space)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only .pdf format allowed!'), false);
    }
  }
});

router.post('/upload-resume', protect, upload.single('resume'), uploadResume);
router.post('/finish', protect, finishInterview);
router.get('/history', protect, getHistory);

module.exports = router;
