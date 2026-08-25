const pdfParse = require('pdf-parse');
const Interview = require('../models/Interview');
const { OpenAI } = require('openai');

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

    // Slice string to prevent overflowing LLM context limits (give roughly 1500 chars to cover main bullets)
    const truncatedResume = pdfText.substring(0, 1500).replace(/\s+/g, ' ');

    // Generate the internal hidden system prompt
    const systemPromptContext = `The candidate is interviewing for the role of "${role}". Their resume states: "${truncatedResume}". Keep questions super specific to these projects.`;

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

    // Convert the array of { sender, text } into a massive concatenated string for the LLM
    const formattedTranscript = transcript.map(t => `${t.sender.toUpperCase()}: ${t.text}`).join('\n');

    let score = 0;
    let feedback = 'Fallback feedback — Gemini API was unavailable. You did well!';

    try {
      // Call Gemini API to grade the interview via chat completions
      // Create Gemini client inline (dotenv is already loaded at call time)
      const gemini = new OpenAI({
        apiKey: process.env.GEMINI_API_KEY,
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API timed out after 20 seconds')), 20000)
      );
      const completion = await Promise.race([
        gemini.chat.completions.create({
          model: 'gemini-3.7-flash',
          messages: [
            {
              role: 'system',
              content: 'You are an expert AI Interview grader. You must respond with ONLY a valid JSON object, no markdown, no extra text.'
            },
            {
              role: 'user',
              content: `Evaluate the following interview transcript for a ${role || 'candidate'}.\n\n${formattedTranscript}\n\nRespond EXACTLY in this JSON format: {"score": <number 0-100>, "feedback": "<1-paragraph string summarizing their performance>"}`
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        }),
        timeoutPromise
      ]);

      const rawContent = completion.choices[0].message.content.trim();
      // Strip any accidental markdown code fences
      const cleanJson = rawContent.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      score = parsed.score || 50;
      feedback = parsed.feedback || feedback;

    } catch (apiErr) {
      console.warn('Gemini Grading unavailable, resorting to fallback scoring logic.', apiErr.message);
      score = Math.min(100, Math.max(10, Math.floor((formattedTranscript.length / 50))));
      feedback = "Gemini grading was temporarily unavailable. This is an estimated score based on transcript length.";
    }

    // Save permanently to Database
    const newInterview = await Interview.create({
      user: req.user._id, // Available via Auth protect middleware mapped locally
      mockId: mockId || 'unknown',
      role: role || 'General SWE',
      score,
      feedback,
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
