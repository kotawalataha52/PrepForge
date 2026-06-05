const pdfParse = require('pdf-parse');
const { OpenAI } = require('openai');

exports.analyzeResume = async (req, res) => {
  if (!req.file || !req.body.role) {
    return res.status(400).json({ success: false, message: 'Please provide both a Resume PDF and a Target Role.' });
  }

  try {
    const dataBuffer = req.file.buffer;
    const pdfData = await pdfParse(dataBuffer);
    const pdfText = pdfData.text.replace(/\s+/g, ' ').trim();

    // Prompt Engineering for Groq
    const systemPrompt = `You are a strict, top-tier Applicant Tracking System (ATS) and Engineering Manager for Big Tech. 
You must analyze the candidate's resume strictly against the target role: "${req.body.role}".
Return exactly one JSON object, valid stringifiable JSON, containing:
{
  "score": <number from 1 to 100 representing their ATS formatting alignment and role fitness>,
  "keywords": [<array of 4 to 6 exact string keywords/technologies missing from their resume that are crucial for this role>],
  "improvements": [<array of 3 to 4 string sentences advising aggressive structural, metric-based, or descriptive changes to pass ATS scanners>]
}

Resume Content:
${pdfText}`;

    let resultObj;

    try {
      // Call Groq Cloud API for ATS analysis
      // Create Groq client inline (dotenv is already loaded at call time)
      const groq = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1'
      });
      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: 'Analyze the resume provided above and return ONLY the JSON object. No markdown, no explanation, just the raw JSON.'
          }
        ],
        temperature: 0.2,
        max_tokens: 1000
      });

      const rawContent = completion.choices[0].message.content.trim();
      // Strip any accidental markdown code fences
      const cleanJson = rawContent.replace(/```json|```/g, '').trim();
      resultObj = JSON.parse(cleanJson);

    } catch (groqError) {
      console.warn("Groq unavailable or JSON parse failed, falling back to mock Intel Mode:", groqError.message);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // MOCK DATA FALLBACK
      resultObj = {
        score: Math.floor(Math.random() * 30) + 55,
        keywords: ["Docker Containerization", "Microservices Architecture", "GraphQL APIs", "CI/CD Pipelines"],
        improvements: [
          "[Mock Mode] Quantify your bullet points with exact percentages instead of vague descriptions.",
          "[Mock Mode] Your skills section is missing core tools explicitly requested in the target role.",
          "[Mock Mode] Remove the 'Objective' summary at the top and replace it with a hard-hitting 'Technical Profile'."
        ]
      };
    }

    return res.status(200).json({
      success: true,
      data: resultObj
    });
  } catch (error) {
    console.error("Critical Resume Intel Error:", error);
    return res.status(500).json({ success: false, message: 'CRITICAL: Could not process PDF buffer.' });
  }
};
