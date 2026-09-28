const pdfParse = require('pdf-parse');
const Interview = require('../models/Interview');
const { gradeInterviewTranscript } = require('../services/geminiService');

// @desc    Upload resume and generate Interview Context Prompt
// @route   POST /api/interview/upload-resume
// @access  Private
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF resume.' });
    }

    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ success: false, message: 'Please specify the role you are interviewing for.' });
    }

    // Parse the PDF text directly from the memory buffer securely
    let dataBuffer = req.file.buffer;
    let pdfText = '';

    try {
      const data = await pdfParse(dataBuffer);
      pdfText = data.text;
    } catch (parseError) {
      console.error('PDF Parse Error:', parseError);
      return res.status(400).json({ success: false, message: 'Could not parse the PDF correctly. Please ensure it is a valid text-searchable PDF.' });
    }

    // Slice string to prevent overflowing LLM context limits (give roughly 2000 chars to cover main bullets)
    const truncatedResume = pdfText.substring(0, 2000).replace(/\s+/g, ' ');

    // Generate the internal hidden system prompt
    const systemPromptContext = `The candidate is interviewing for the role of "${role}". Their resume states: "${truncatedResume}". Keep questions super specific to these projects, architecture, tradeoffs, and system design challenges.`;

    // Generate a secure, random mock-interview ID
    const generatedInterviewId = 'mock-' + Math.random().toString(36).substr(2, 9);

    res.status(200).json({
      success: true,
      data: {
        interviewId: generatedInterviewId,
        context: systemPromptContext
      }
    });

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ success: false, message: 'Server error processing the resume' });
  }
};

// @desc    Grade the transcript using AI and save to DB
// @route   POST /api/interview/finish
// @access  Private
exports.finishInterview = async (req, res) => {
  try {
    const { transcript, role, mockId } = req.body;

    if (!transcript || transcript.length === 0) {
      return res.status(400).json({ success: false, message: 'No interview transcript provided.' });
    }

    // Convert the array of { sender, text } into a formatted transcript
    const formattedTranscript = transcript.map(t => `${t.sender.toUpperCase()}: ${t.text}`).join('\n');

    const evaluation = await gradeInterviewTranscript(role, formattedTranscript);

    // Save permanently to Database
    const newInterview = await Interview.create({
      user: req.user._id,
      mockId: mockId || 'unknown',
      role: role || 'General Software Engineer',
      score: evaluation.score,
      feedback: evaluation.feedback,
      transcript
    });

    res.status(201).json({
      success: true,
      data: newInterview
    });
  } catch (error) {
    console.error('Finish Interview Error:', error);
    res.status(500).json({ success: false, message: 'Server error saving the interview run.' });
  }
};

// @desc    Get user's past interviews
// @route   GET /api/interview/history
// @access  Private
exports.getHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user._id }).sort('-createdAt');
    res.status(200).json({
      success: true,
      data: interviews
    });
  } catch (error) {
    console.error('History Fetch Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching your history.' });
  }
};
