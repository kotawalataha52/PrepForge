const pdfParse = require('pdf-parse');
const { analyzeResumeATS, rewriteAndTailorResume, rescoreTailoredResume } = require('../services/geminiService');

/**
 * @desc    Analyze resume for ATS score & feedback
 * @route   POST /api/resume/intel
 * @access  Private
 */
exports.analyzeResume = async (req, res) => {
  if (!req.file || !req.body.role) {
    return res.status(400).json({ success: false, message: 'Please provide both a Resume PDF and a Target Role.' });
  }

  try {
    const dataBuffer = req.file.buffer;
    const pdfData = await pdfParse(dataBuffer);
    const pdfText = pdfData.text.replace(/\s+/g, ' ').trim();

    if (!pdfText || pdfText.length < 50) {
      return res.status(400).json({ success: false, message: 'Could not extract readable text from this PDF. Please ensure it is text-searchable.' });
    }

    const result = await analyzeResumeATS(pdfText, req.body.role);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Critical Resume Intel Error:", error);
    return res.status(500).json({ success: false, message: 'Error processing resume intel analysis.' });
  }
};

/**
 * @desc    Rewrite & Tailor Resume for a specific Job Description
 * @route   POST /api/resume/rewrite
 * @access  Private
 */
exports.rewriteResume = async (req, res) => {
  try {
    const { jobDescription, rawResumeText } = req.body;

    if (!jobDescription || jobDescription.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Job Description with at least 20 characters.'
      });
    }

    let resumeContent = '';

    // Extract text from uploaded PDF file if provided
    if (req.file) {
      try {
        const dataBuffer = req.file.buffer;
        const pdfData = await pdfParse(dataBuffer);
        resumeContent = pdfData.text.replace(/\s+/g, ' ').trim();
      } catch (pdfErr) {
        console.error('PDF parsing error:', pdfErr);
        return res.status(400).json({
          success: false,
          message: 'Failed to read text from uploaded PDF. Please verify the file.'
        });
      }
    } else if (rawResumeText && rawResumeText.trim().length > 30) {
      resumeContent = rawResumeText.trim();
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please upload your existing Resume (PDF) or paste your resume content.'
      });
    }

    if (!resumeContent || resumeContent.length < 40) {
      return res.status(400).json({
        success: false,
        message: 'Resume content appears too short or unreadable. Please provide complete resume text.'
      });
    }

    console.log(`[Resume Tailor] Processing rewrite for JD length: ${jobDescription.length}, Resume length: ${resumeContent.length}`);
    const tailoredData = await rewriteAndTailorResume(resumeContent, jobDescription);

    return res.status(200).json({
      success: true,
      data: tailoredData
    });
  } catch (error) {
    console.error('Resume Rewrite Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to rewrite and tailor resume with AI: ' + (error.message || 'Server error')
    });
  }
};

/**
 * @desc    Instant ATS Re-Score for Edited Tailored Resume
 * @route   POST /api/resume/rescore
 * @access  Private
 */
exports.rescoreResume = async (req, res) => {
  try {
    const { resumeData, jobDescription } = req.body;

    if (!resumeData || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both the updated resume data and target job description.'
      });
    }

    console.log(`[Resume Re-score] Re-evaluating ATS score for target role: ${resumeData.targetRole || 'SWE'}`);
    const auditResult = await rescoreTailoredResume(resumeData, jobDescription);

    return res.status(200).json({
      success: true,
      data: auditResult
    });
  } catch (error) {
    console.error('Resume Rescore Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to re-score resume: ' + (error.message || 'Server error')
    });
  }
};
