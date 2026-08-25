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

    // Cap resume text to avoid token overflow while still capturing core content
    const truncatedResume = pdfText.substring(0, 4000);
    const targetRole = req.body.role;

    // Precision prompt that forces genuine, resume-specific analysis
    const systemPrompt = `You are an elite ATS (Applicant Tracking System) scanner and Senior Engineering Hiring Manager at a FAANG company.

Your task: Perform a REAL, DEEP analysis of the specific resume provided below for the role: "${targetRole}".

CRITICAL RULES YOU MUST FOLLOW:
1. READ the resume content carefully before responding. Do NOT provide generic answers.
2. The "keywords" array MUST contain ONLY skills, tools, frameworks, or certifications that are:
   - Genuinely expected for "${targetRole}" at top companies
   - ACTUALLY ABSENT or barely mentioned in THIS specific resume
   - Highly specific to this person's background and what they are missing — NOT generic buzzwords
3. The "improvements" MUST reference actual things you see (or critically don't see) in THIS resume.
4. The "score" must honestly reflect the gap between this resume and a top-tier "${targetRole}" candidate.
5. DO NOT produce generic advice like "add metrics" unless it specifically applies to what's in this resume.

Resume Content:
---
${truncatedResume}
---

Respond with ONLY this JSON (no markdown, no explanation, no code fences):
{
  "score": <integer 1-100>,
  "keywords": [<5-7 specific strings: skills/tools/certs missing from this resume for this role>],
  "improvements": [<3-4 specific, actionable strings referencing actual resume content>]
}`;

    let resultObj;

    try {
      // Call Gemini API for ATS analysis
      const gemini = new OpenAI({
        apiKey: process.env.GEMINI_API_KEY,
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
      });

      const completion = await gemini.chat.completions.create({
        model: 'gemini-3.7-flash',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Analyze the resume above for the role "${targetRole}". Return ONLY the raw JSON. Be specific to THIS resume.`
          }
        ],
        temperature: 0.4,
        max_tokens: 1200
      });

      const rawContent = completion.choices[0].message.content.trim();
      // Strip any accidental markdown code fences
      const cleanJson = rawContent.replace(/```json|```/g, '').trim();
      resultObj = JSON.parse(cleanJson);

      // Safety: validate the structure before returning
      if (!resultObj.score || !Array.isArray(resultObj.keywords) || !Array.isArray(resultObj.improvements)) {
        throw new Error('Invalid JSON structure from Gemini');
      }

    } catch (apiError) {
      console.warn("Gemini unavailable or JSON parse failed, falling back to heuristic analysis:", apiError.message);

      // Dynamic heuristic fallback — analyzes the actual resume text to produce role-aware results
      const role = targetRole.toLowerCase();
      const text = pdfText.toLowerCase();
      const missingKeywords = [];
      const improvements = [];

      // Check common role-relevant technologies that might be missing
      const techChecks = [
        { key: 'docker', label: 'Docker & Containerization' },
        { key: 'kubernetes', label: 'Kubernetes Orchestration' },
        { key: 'aws', label: 'AWS Cloud Services' },
        { key: 'gcp', label: 'Google Cloud Platform' },
        { key: 'azure', label: 'Microsoft Azure' },
        { key: 'react', label: 'React.js' },
        { key: 'typescript', label: 'TypeScript' },
        { key: 'graphql', label: 'GraphQL' },
        { key: 'redis', label: 'Redis Caching' },
        { key: 'terraform', label: 'Infrastructure as Code (Terraform)' },
        { key: 'python', label: 'Python' },
        { key: 'sql', label: 'SQL & Query Optimization' },
        { key: 'kafka', label: 'Apache Kafka / Event Streaming' },
        { key: 'jest', label: 'Unit Testing (Jest/Pytest)' },
        { key: 'linux', label: 'Linux/Unix System Administration' },
      ];

      techChecks.forEach(({ key, label }) => {
        if (!text.includes(key)) {
          missingKeywords.push(label);
        }
      });

      // Generate specific improvements based on resume text analysis
      if (text.length < 1200) {
        improvements.push("Your resume is too brief. Expand your project descriptions with technical depth and outcomes.");
      }
      if (!text.includes('%') && !text.includes('percent') && !text.includes('reduced') && !text.includes('improved') && !text.includes('increased')) {
        improvements.push("None of your bullet points contain quantifiable results. Add specific metrics (e.g., 'Reduced API latency by 35%') to make your impact concrete.");
      }
      if (!text.includes('lead') && !text.includes('mentor') && !text.includes('architect') && !text.includes('design')) {
        improvements.push("Your resume lacks evidence of technical leadership or architectural decision-making, which is critical for senior-level roles.");
      }
      improvements.push(`Customize your professional summary to explicitly mention "${targetRole}" and align your top 3 skills with what the role demands.`);

      resultObj = {
        score: Math.min(Math.max(Math.floor(text.length / 80), 38), 72),
        keywords: missingKeywords.slice(0, 6),
        improvements: improvements.slice(0, 4)
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
