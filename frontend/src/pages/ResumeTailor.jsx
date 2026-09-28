import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  UploadCloud,
  FileText,
  Briefcase,
  Download,
  Printer,
  Copy,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Zap,
  Edit3,
  ArrowRight,
  AlertCircle,
  TrendingUp,
  Info,
  CheckCircle2
} from 'lucide-react';
import api from '../utils/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const SAMPLE_JDS = {
  frontend: {
    title: 'Senior Frontend Engineer (React/TypeScript)',
    text: `We are looking for a Senior Frontend Engineer to build high-performance web applications.
Requirements:
- 4+ years of hands-on experience with React, TypeScript, Next.js, and modern CSS frameworks (Tailwind CSS).
- Deep expertise in state management, frontend architecture, and performance optimization (reducing LCP, FID, CLS).
- Experience with testing frameworks (Jest, React Testing Library, Cypress) and CI/CD pipelines.
- Strong collaboration with product designers and backend engineers to integrate REST/GraphQL APIs.
- Mentoring junior engineers and driving code quality standards.`
  },
  fullstack: {
    title: 'Lead Full Stack Developer (Node.js/React/AWS)',
    text: `Seeking a Lead Full Stack Developer to architect and deliver scalable cloud-native microservices.
Requirements:
- Strong proficiency in Node.js, Express, TypeScript, React, and MongoDB/PostgreSQL.
- Demonstrated experience deploying and managing cloud infrastructure on AWS (EC2, S3, Lambda, CloudFront).
- Experience building event-driven systems with Redis, Kafka, or RabbitMQ.
- Proven track record of improving database query performance and API response times.
- Passion for clean architecture, automated testing, and secure authentication (OAuth/JWT).`
  },
  backend: {
    title: 'Backend & Cloud Systems Engineer (Python/Go/Distributed Systems)',
    text: `Join our core platform team to build distributed backend systems handling millions of daily requests.
Requirements:
- Strong experience in Python, Go, or Java with focus on high-throughput REST and gRPC microservices.
- Mastery of relational and NoSQL databases, indexing strategies, and caching with Redis.
- Hands-on experience with Docker, Kubernetes, Terraform, and AWS cloud ecosystem.
- Deep understanding of concurrency, data modeling, reliability engineering, and observability (Prometheus/Grafana).`
  }
};

/**
 * Defensive Normalization: guarantees every single field exists with safe types
 * so React never crashes on undefined property mappings.
 */
const normalizeResumeData = (raw) => {
  let data = raw;
  if (typeof data === 'string') {
    try {
      const clean = data.replace(/```json|```/g, '').trim();
      data = JSON.parse(clean);
    } catch (e) {
      console.warn('Could not parse resume data string as JSON:', e);
      data = {};
    }
  }

  if (!data || typeof data !== 'object') {
    data = {};
  }

  // Normalize personal info
  const pInfo = data.personalInfo || data.personal_info || data.contact || {};
  const personalInfo = {
    fullName: pInfo.fullName || pInfo.full_name || pInfo.name || 'Candidate Name',
    email: pInfo.email || '',
    phone: pInfo.phone || pInfo.phoneNumber || '',
    location: pInfo.location || pInfo.address || 'Remote / Open to Relocation',
    linkedin: pInfo.linkedin || pInfo.linkedIn || '',
    github: pInfo.github || '',
    portfolio: pInfo.portfolio || pInfo.website || ''
  };

  // Normalize skills
  let skills = { languages: [], frameworks: [], toolsAndCloud: [], methodologies: [] };
  if (Array.isArray(data.skills)) {
    skills.languages = data.skills;
  } else if (data.skills && typeof data.skills === 'object') {
    skills.languages = Array.isArray(data.skills.languages) ? data.skills.languages : [];
    skills.frameworks = Array.isArray(data.skills.frameworks) ? data.skills.frameworks : (Array.isArray(data.skills.libraries) ? data.skills.libraries : []);
    skills.toolsAndCloud = Array.isArray(data.skills.toolsAndCloud) ? data.skills.toolsAndCloud : (Array.isArray(data.skills.tools) ? data.skills.tools : (Array.isArray(data.skills.cloud) ? data.skills.cloud : []));
    skills.methodologies = Array.isArray(data.skills.methodologies) ? data.skills.methodologies : (Array.isArray(data.skills.other) ? data.skills.other : []);
  }

  // Normalize experience
  const rawExp = Array.isArray(data.experience) ? data.experience : (Array.isArray(data.work_experience) ? data.work_experience : []);
  const experience = rawExp.map((exp) => {
    let bullets = [];
    if (Array.isArray(exp.bullets)) bullets = exp.bullets;
    else if (Array.isArray(exp.highlights)) bullets = exp.highlights;
    else if (Array.isArray(exp.responsibilities)) bullets = exp.responsibilities;
    else if (typeof exp.description === 'string') bullets = exp.description.split('. ').filter(Boolean);

    return {
      title: exp.title || exp.role || exp.position || 'Software Engineer',
      company: exp.company || exp.organization || 'Tech Company',
      location: exp.location || '',
      startDate: exp.startDate || exp.start_date || exp.start || '2023',
      endDate: exp.endDate || exp.end_date || exp.end || 'Present',
      bullets: bullets.length > 0 ? bullets : ['Led core feature development aligned with modern engineering standards.']
    };
  });

  // Normalize projects
  const rawProj = Array.isArray(data.projects) ? data.projects : [];
  const projects = rawProj.map((p) => ({
    name: p.name || p.title || 'Key Engineering Project',
    techStack: Array.isArray(p.techStack) ? p.techStack : (Array.isArray(p.technologies) ? p.technologies : []),
    description: p.description || '',
    bullets: Array.isArray(p.bullets) ? p.bullets : (Array.isArray(p.highlights) ? p.highlights : [])
  }));

  // Normalize education
  const rawEdu = Array.isArray(data.education) ? data.education : [];
  const education = rawEdu.map((edu) => ({
    degree: edu.degree || 'B.S. in Computer Science or Related Field',
    institution: edu.institution || edu.university || edu.school || 'University',
    location: edu.location || '',
    graduationYear: edu.graduationYear || edu.year || edu.graduation_date || ''
  }));

  return {
    personalInfo,
    targetRole: data.targetRole || data.target_role || 'Target Engineering Role',
    matchScore: parseInt(data.matchScore || data.match_score || 92, 10),
    summary: typeof data.summary === 'string' ? data.summary : 'Results-driven engineer with proven track record of architecting scalable systems and delivering high-impact solutions.',
    skills,
    experience: experience.length > 0 ? experience : [{
      title: 'Software Engineer',
      company: 'Engineering Firm',
      location: 'Remote',
      startDate: '2022',
      endDate: 'Present',
      bullets: ['Architected scalable features improving performance and reliability.']
    }],
    projects,
    education: education.length > 0 ? education : [{
      degree: 'B.S. in Computer Science',
      institution: 'University',
      location: '',
      graduationYear: '2023'
    }],
    tailoringHighlights: Array.isArray(data.tailoringHighlights) ? data.tailoringHighlights : [
      'Tailored technical keywords to match target job requirements',
      'Re-engineered bullet points with action verbs and metrics'
    ],
    remainingGaps: Array.isArray(data.remainingGaps) ? data.remainingGaps : []
  };
};

const ResumeTailor = () => {
  const [activeInputTab, setActiveInputTab] = useState('upload');
  const [file, setFile] = useState(null);
  const [rawResumeText, setRawResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [error, setError] = useState(null);

  const [resumeData, setResumeData] = useState(null);
  const [activeEditorSection, setActiveEditorSection] = useState('summary');
  const [resumeTemplate, setResumeTemplate] = useState('modern');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [copied, setCopied] = useState(false);

  // Re-scoring State
  const [isRescoring, setIsRescoring] = useState(false);
  const [scoreDelta, setScoreDelta] = useState(null);
  const [rescoreSuccessMsg, setRescoreSuccessMsg] = useState('');

  const resumeSheetRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setError(null);
    } else {
      setError('Please select a valid .pdf file.');
    }
  };

  const handleApplySampleJD = (key) => {
    if (SAMPLE_JDS[key]) {
      setJobDescription(SAMPLE_JDS[key].text);
      setError(null);
    }
  };

  const handleGenerate = async () => {
    if (!jobDescription || jobDescription.trim().length < 15) {
      setError('Please enter a target Job Description.');
      return;
    }

    if (activeInputTab === 'upload' && !file) {
      setError('Please select and upload your existing resume PDF.');
      return;
    }

    if (activeInputTab === 'paste' && (!rawResumeText || rawResumeText.trim().length < 20)) {
      setError('Please paste your existing resume text.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setScoreDelta(null);
    setGenerationStep('Reading resume and analyzing core competencies...');

    try {
      const formData = new FormData();
      formData.append('jobDescription', jobDescription);

      if (activeInputTab === 'upload' && file) {
        formData.append('resume', file);
      } else {
        formData.append('rawResumeText', rawResumeText);
      }

      setTimeout(() => setGenerationStep('Matching candidate skills against Job Description...'), 1500);
      setTimeout(() => setGenerationStep('Re-engineering achievements with quantified metrics...'), 3500);
      setTimeout(() => setGenerationStep('Finalizing ATS formatting and PDF layout...'), 5500);

      const res = await api.post('/resume/rewrite', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success && res.data?.data) {
        const normalized = normalizeResumeData(res.data.data);
        setResumeData(normalized);
      } else {
        throw new Error(res.data?.message || 'Failed to tailor resume.');
      }
    } catch (err) {
      console.error('Resume Tailor Error:', err);
      const msg = err.response?.data?.message || err.message || 'Error communicating with tailoring service. Please try again.';
      setError(msg);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  // Instant ATS Re-score Handler
  const handleRescore = async () => {
    if (!resumeData || !jobDescription) return;
    setIsRescoring(true);
    setError(null);

    const oldScore = resumeData.matchScore || 90;

    try {
      const res = await api.post('/resume/rescore', {
        resumeData,
        jobDescription
      });

      if (res.data?.success && res.data?.data) {
        const { matchScore, tailoringHighlights, remainingGaps } = res.data.data;
        const delta = matchScore - oldScore;
        setScoreDelta(delta);

        setResumeData((prev) => ({
          ...prev,
          matchScore,
          tailoringHighlights: tailoringHighlights?.length ? tailoringHighlights : prev.tailoringHighlights,
          remainingGaps: remainingGaps || []
        }));

        setRescoreSuccessMsg(`ATS Audit Complete: Score updated to ${matchScore}%`);
        setTimeout(() => setRescoreSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Rescore Error:', err);
      setError('Could not complete live re-score. Please try again.');
    } finally {
      setIsRescoring(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!resumeSheetRef.current) return;
    setIsDownloadingPdf(true);

    try {
      const element = resumeSheetRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `${resumeData?.personalInfo?.fullName?.replace(/\s+/g, '_') || 'Tailored'}_Resume.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('PDF export error:', err);
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleCopyText = () => {
    if (!resumeData) return;
    let text = `${resumeData.personalInfo.fullName}\n${resumeData.personalInfo.email} | ${resumeData.personalInfo.phone} | ${resumeData.personalInfo.location}\n\nPROFESSIONAL SUMMARY\n${resumeData.summary}\n\nTECHNICAL SKILLS\n`;
    if (resumeData.skills?.languages?.length) text += `Languages: ${resumeData.skills.languages.join(', ')}\n`;
    if (resumeData.skills?.frameworks?.length) text += `Frameworks: ${resumeData.skills.frameworks.join(', ')}\n`;
    if (resumeData.skills?.toolsAndCloud?.length) text += `Tools & Cloud: ${resumeData.skills.toolsAndCloud.join(', ')}\n`;
    text += `\nEXPERIENCE\n`;

    resumeData.experience?.forEach((exp) => {
      text += `${exp.title} - ${exp.company} (${exp.startDate} - ${exp.endDate})\n`;
      exp.bullets?.forEach((b) => (text += `• ${b}\n`));
      text += '\n';
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updatePersonalInfo = (field, val) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: val }
    }));
  };

  const updateSummary = (val) => {
    setResumeData((prev) => ({ ...prev, summary: val }));
  };

  const updateExperienceBullet = (expIdx, bulletIdx, val) => {
    setResumeData((prev) => {
      const nextExp = [...prev.experience];
      if (nextExp[expIdx]?.bullets) {
        nextExp[expIdx].bullets[bulletIdx] = val;
      }
      return { ...prev, experience: nextExp };
    });
  };

  const addExperienceBullet = (expIdx) => {
    setResumeData((prev) => {
      const nextExp = [...prev.experience];
      if (nextExp[expIdx]?.bullets) {
        nextExp[expIdx].bullets.push('Architected scalable solution yielding 25% performance improvement.');
      }
      return { ...prev, experience: nextExp };
    });
  };

  const deleteExperienceBullet = (expIdx, bulletIdx) => {
    setResumeData((prev) => {
      const nextExp = [...prev.experience];
      if (nextExp[expIdx]?.bullets) {
        nextExp[expIdx].bullets.splice(bulletIdx, 1);
      }
      return { ...prev, experience: nextExp };
    });
  };

  const removeSkill = (category, skillIdx) => {
    setResumeData((prev) => {
      if (!prev.skills?.[category]) return prev;
      return {
        ...prev,
        skills: {
          ...prev.skills,
          [category]: prev.skills[category].filter((_, idx) => idx !== skillIdx)
        }
      };
    });
  };

  return (
    <div className="space-y-7 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Smart Resume Studio & PDF Generator
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 tracking-tight">
            Job-Tailored <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Resume Builder</span>
          </h1>
          <p className="text-slate-500 text-xs md:text-sm max-w-xl mt-0.5">
            Upload your resume and target job description. Our engine rewrites each section to maximize ATS alignment and delivers a customizable, export-ready PDF.
          </p>
        </div>

        {resumeData && (
          <button
            onClick={() => setResumeData(null)}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Start New Resume
          </button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-slate-400 hover:text-slate-700">✕</button>
        </motion.div>
      )}

      {rescoreSuccessMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 shadow-xs"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{rescoreSuccessMsg}</span>
        </motion.div>
      )}

      {/* STEP 1: INPUT VIEW (When no tailored resume yet) */}
      {!resumeData && (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left: Resume Input */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Step 1: Your Existing Resume
                </h3>

                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveInputTab('upload')}
                    className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                      activeInputTab === 'upload' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Upload PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveInputTab('paste')}
                    className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                      activeInputTab === 'paste' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Paste Text
                  </button>
                </div>
              </div>

              {activeInputTab === 'upload' ? (
                <div className="space-y-3">
                  <label
                    htmlFor="resume-upload"
                    className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                      file
                        ? 'border-emerald-400 bg-emerald-50/50'
                        : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 bg-slate-50'
                    }`}
                  >
                    <input
                      id="resume-upload"
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-3 text-blue-600 shadow-xs">
                      {file ? <Check className="w-6 h-6 text-emerald-600" /> : <UploadCloud className="w-6 h-6" />}
                    </div>
                    {file ? (
                      <div>
                        <p className="text-emerald-700 font-bold text-xs">{file.name}</p>
                        <p className="text-slate-400 text-[10px] mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to tailor</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-slate-800 font-semibold text-xs">Click to upload your resume (PDF)</p>
                        <p className="text-slate-400 text-[10px] mt-0.5">Text-searchable PDF up to 5MB</p>
                      </div>
                    )}
                  </label>
                </div>
              ) : (
                <div>
                  <textarea
                    rows={9}
                    value={rawResumeText}
                    onChange={(e) => setRawResumeText(e.target.value)}
                    placeholder="Paste the raw text of your existing resume here (Experience, Projects, Skills, Education)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition font-mono leading-relaxed placeholder:text-slate-400"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right: Job Description Input */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  Step 2: Target Job Description
                </h3>

                <span className="text-[11px] text-slate-400">Quick-fill sample JD:</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleApplySampleJD('frontend')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[11px] font-medium transition cursor-pointer"
                >
                  Frontend Engineer
                </button>
                <button
                  type="button"
                  onClick={() => handleApplySampleJD('fullstack')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[11px] font-medium transition cursor-pointer"
                >
                  Full Stack Lead
                </button>
                <button
                  type="button"
                  onClick={() => handleApplySampleJD('backend')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[11px] font-medium transition cursor-pointer"
                >
                  Backend / Cloud
                </button>
              </div>

              <textarea
                rows={activeInputTab === 'upload' ? 7 : 9}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target Job Description, responsibilities, and requirements here..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition leading-relaxed placeholder:text-slate-400"
              />

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs md:text-sm flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{generationStep || 'Crafting Tailored Resume with Gemini...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-white" />
                    <span>Rewrite & Tailor Resume</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: DUAL-PANE INTERACTIVE STUDIO (When Tailored Resume is Ready) */}
      {resumeData && (
        <div className="space-y-6">
          {/* Match Score & Live ATS Re-Score Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col items-center justify-center text-center shrink-0 relative overflow-hidden">
                <span className="text-lg font-bold font-display text-blue-700">
                  {resumeData.matchScore || 92}%
                </span>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Match</span>
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Tailored for: <span className="text-blue-700">{resumeData.targetRole}</span>
                  </h3>

                  {scoreDelta !== null && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      scoreDelta >= 0 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      <TrendingUp className="w-3 h-3" />
                      {scoreDelta >= 0 ? `+${scoreDelta}%` : `${scoreDelta}%`}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-1.5">
                  {resumeData.tailoringHighlights?.map((hl, i) => (
                    <span key={i} className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                      <ShieldCheck className="w-3 h-3" /> {hl}
                    </span>
                  ))}
                  {resumeData.remainingGaps?.map((gap, i) => (
                    <span key={`gap-${i}`} className="text-[11px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                      <Info className="w-3 h-3" /> Tip: {gap}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions & Re-score button */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              {/* NEW: Instant ATS Re-score button */}
              <button
                type="button"
                onClick={handleRescore}
                disabled={isRescoring}
                className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-xs"
                title="Re-calculate ATS score against Job Description based on your recent edits"
              >
                {isRescoring ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                )}
                <span>{isRescoring ? 'Auditing...' : 'Re-Score ATS'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyText}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isDownloadingPdf}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                {isDownloadingPdf ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>Download PDF</span>
              </button>
            </div>
          </motion.div>

          {/* DUAL PANE: Editor (Left) & Live Document Preview (Right) */}
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: Section Editor Tabs & Forms */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-blue-600" /> Live Editor
                  </h3>
                  <span className="text-[10px] text-slate-400">Edits update sheet instantly</span>
                </div>

                {/* Section Navigation Tabs */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'info', label: 'Contact' },
                    { id: 'summary', label: 'Summary' },
                    { id: 'experience', label: 'Experience' },
                    { id: 'skills', label: 'Skills' },
                    { id: 'projects', label: 'Projects' },
                    { id: 'education', label: 'Education' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveEditorSection(tab.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        activeEditorSection === tab.id
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* SECTION 1: Personal Info */}
                {activeEditorSection === 'info' && (
                  <div className="space-y-2.5 pt-1">
                    <div>
                      <label className="text-[11px] text-gray-400">Full Name</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo?.fullName || ''}
                        onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                        className="w-full mt-0.5 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-gray-400">Email</label>
                        <input
                          type="email"
                          value={resumeData.personalInfo?.email || ''}
                          onChange={(e) => updatePersonalInfo('email', e.target.value)}
                          className="w-full mt-0.5 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-400">Phone</label>
                        <input
                          type="text"
                          value={resumeData.personalInfo?.phone || ''}
                          onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                          className="w-full mt-0.5 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-gray-400">Location</label>
                        <input
                          type="text"
                          value={resumeData.personalInfo?.location || ''}
                          onChange={(e) => updatePersonalInfo('location', e.target.value)}
                          className="w-full mt-0.5 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-400">LinkedIn</label>
                        <input
                          type="text"
                          value={resumeData.personalInfo?.linkedin || ''}
                          onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                          className="w-full mt-0.5 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 2: Summary */}
                {activeEditorSection === 'summary' && (
                  <div className="space-y-2 pt-1">
                    <label className="text-[11px] text-gray-400">Executive Summary</label>
                    <textarea
                      rows={5}
                      value={resumeData.summary || ''}
                      onChange={(e) => updateSummary(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-xs focus:border-indigo-500 focus:outline-none leading-relaxed"
                    />
                  </div>
                )}

                {/* SECTION 3: Experience */}
                {activeEditorSection === 'experience' && (
                  <div className="space-y-4 pt-1 max-h-[460px] overflow-y-auto pr-1">
                    {resumeData.experience?.map((exp, expIdx) => (
                      <div key={expIdx} className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <input
                              type="text"
                              value={exp.title}
                              onChange={(e) => {
                                const next = [...resumeData.experience];
                                next[expIdx].title = e.target.value;
                                setResumeData({ ...resumeData, experience: next });
                              }}
                              className="font-bold text-white text-xs bg-transparent border-b border-transparent hover:border-white/20 focus:border-indigo-500 focus:outline-none"
                            />
                            <div className="text-[11px] text-indigo-400">{exp.company} • {exp.startDate} - {exp.endDate}</div>
                          </div>
                        </div>

                        {/* Bullets */}
                        <div className="space-y-1.5">
                          {exp.bullets?.map((bullet, bulletIdx) => (
                            <div key={bulletIdx} className="flex items-start gap-1.5">
                              <span className="text-indigo-400 mt-1.5 text-xs">•</span>
                              <textarea
                                rows={2}
                                value={bullet}
                                onChange={(e) => updateExperienceBullet(expIdx, bulletIdx, e.target.value)}
                                className="flex-1 bg-black/30 border border-white/5 rounded-lg p-1.5 text-xs text-gray-200 focus:border-indigo-500 focus:outline-none leading-relaxed"
                              />
                              <button
                                type="button"
                                onClick={() => deleteExperienceBullet(expIdx, bulletIdx)}
                                className="p-1 text-gray-500 hover:text-rose-400 transition"
                                title="Delete bullet point"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => addExperienceBullet(expIdx)}
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1 pt-1"
                          >
                            <Plus className="w-3 h-3" /> Add Bullet Point
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* SECTION 4: Skills */}
                {activeEditorSection === 'skills' && (
                  <div className="space-y-3 pt-1">
                    {['languages', 'frameworks', 'toolsAndCloud', 'methodologies'].map((cat) => (
                      <div key={cat} className="space-y-1.5">
                        <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                          {cat === 'toolsAndCloud' ? 'Tools & Cloud' : cat}
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {resumeData.skills?.[cat]?.map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px] flex items-center gap-1"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeSkill(cat, sIdx)}
                                className="hover:text-rose-400 transition ml-0.5 text-xs"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* SECTION 5: Projects */}
                {activeEditorSection === 'projects' && (
                  <div className="space-y-3 pt-1">
                    {resumeData.projects?.map((proj, pIdx) => (
                      <div key={pIdx} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                        <input
                          type="text"
                          value={proj.name}
                          onChange={(e) => {
                            const next = [...resumeData.projects];
                            next[pIdx].name = e.target.value;
                            setResumeData({ ...resumeData, projects: next });
                          }}
                          className="font-bold text-white text-xs bg-transparent border-b border-transparent hover:border-white/20 focus:border-indigo-500 focus:outline-none w-full"
                        />
                        <textarea
                          rows={2}
                          value={proj.description}
                          onChange={(e) => {
                            const next = [...resumeData.projects];
                            next[pIdx].description = e.target.value;
                            setResumeData({ ...resumeData, projects: next });
                          }}
                          className="w-full bg-black/30 border border-white/5 rounded-lg p-1.5 text-xs text-gray-200 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* SECTION 6: Education */}
                {activeEditorSection === 'education' && (
                  <div className="space-y-3 pt-1">
                    {resumeData.education?.map((edu, eIdx) => (
                      <div key={eIdx} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const next = [...resumeData.education];
                            next[eIdx].degree = e.target.value;
                            setResumeData({ ...resumeData, education: next });
                          }}
                          className="font-bold text-white text-xs bg-transparent border-b border-transparent hover:border-white/20 focus:border-indigo-500 focus:outline-none w-full"
                        />
                        <div className="text-[11px] text-gray-400">{edu.institution} ({edu.graduationYear})</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Live Printable / Exportable Sheet */}
            <div className="lg:col-span-7 space-y-3">
              {/* Template Style Selector */}
              <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">Template Style:</span>
                  <button
                    type="button"
                    onClick={() => setResumeTemplate('modern')}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition cursor-pointer ${
                      resumeTemplate === 'modern' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Clean Tech
                  </button>
                  <button
                    type="button"
                    onClick={() => setResumeTemplate('minimal')}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition cursor-pointer ${
                      resumeTemplate === 'minimal' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Ivy Minimal
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-1 rounded text-gray-400 hover:text-white transition"
                  title="Print Sheet"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* THE RESUME DOCUMENT SHEET */}
              <div className="overflow-x-auto shadow-2xl rounded-xl border border-white/10">
                <div
                  id="resume-preview-sheet"
                  ref={resumeSheetRef}
                  className={`bg-white text-gray-900 p-8 md:p-10 min-h-[980px] w-full max-w-[760px] mx-auto text-[12px] leading-normal shadow-lg ${
                    resumeTemplate === 'minimal' ? 'font-serif' : 'font-sans'
                  }`}
                  style={{ color: '#111827' }}
                >
                  {/* HEADER */}
                  <div className="border-b pb-3 mb-4 border-gray-300 text-center">
                    <h1 className="text-2xl font-bold uppercase tracking-wide text-gray-950 font-display">
                      {resumeData.personalInfo?.fullName || 'Candidate Name'}
                    </h1>
                    <p className="text-[11px] text-gray-600 mt-1 flex flex-wrap justify-center gap-2.5 font-medium">
                      {resumeData.personalInfo?.email && <span>{resumeData.personalInfo.email}</span>}
                      {resumeData.personalInfo?.phone && <span>• {resumeData.personalInfo.phone}</span>}
                      {resumeData.personalInfo?.location && <span>• {resumeData.personalInfo.location}</span>}
                      {resumeData.personalInfo?.linkedin && <span>• {resumeData.personalInfo.linkedin}</span>}
                      {resumeData.personalInfo?.github && <span>• {resumeData.personalInfo.github}</span>}
                    </p>
                  </div>

                  {/* SUMMARY */}
                  {resumeData.summary && (
                    <div className="mb-4">
                      <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5 mb-1.5 font-display">
                        Professional Summary
                      </h2>
                      <p className="text-gray-800 text-justify leading-relaxed">
                        {resumeData.summary}
                      </p>
                    </div>
                  )}

                  {/* TECHNICAL SKILLS */}
                  {resumeData.skills && (
                    <div className="mb-4">
                      <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5 mb-1.5 font-display">
                        Technical Skills
                      </h2>
                      <div className="space-y-0.5 text-[11px] text-gray-800">
                        {resumeData.skills.languages?.length > 0 && (
                          <div>
                            <span className="font-semibold text-gray-950">Languages: </span>
                            {resumeData.skills.languages.join(', ')}
                          </div>
                        )}
                        {resumeData.skills.frameworks?.length > 0 && (
                          <div>
                            <span className="font-semibold text-gray-950">Frameworks & Libraries: </span>
                            {resumeData.skills.frameworks.join(', ')}
                          </div>
                        )}
                        {resumeData.skills.toolsAndCloud?.length > 0 && (
                          <div>
                            <span className="font-semibold text-gray-950">Tools & Cloud: </span>
                            {resumeData.skills.toolsAndCloud.join(', ')}
                          </div>
                        )}
                        {resumeData.skills.methodologies?.length > 0 && (
                          <div>
                            <span className="font-semibold text-gray-950">Methodologies: </span>
                            {resumeData.skills.methodologies.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* WORK EXPERIENCE */}
                  {resumeData.experience?.length > 0 && (
                    <div className="mb-4">
                      <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5 mb-2 font-display">
                        Work Experience
                      </h2>
                      <div className="space-y-3">
                        {resumeData.experience.map((exp, idx) => (
                          <div key={idx} className="space-y-0.5">
                            <div className="flex justify-between items-baseline">
                              <span className="font-bold text-gray-950 text-xs">
                                {exp.title}
                              </span>
                              <span className="text-[11px] text-gray-600 font-medium">
                                {exp.startDate} - {exp.endDate}
                              </span>
                            </div>
                            <div className="flex justify-between text-[11px] text-gray-700 italic">
                              <span>{exp.company}</span>
                              <span>{exp.location}</span>
                            </div>
                            <ul className="list-disc ml-4 space-y-0.5 text-gray-800 text-[11px] mt-0.5">
                              {exp.bullets?.map((bullet, bIdx) => (
                                <li key={bIdx} className="leading-relaxed">
                                  {bullet}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PROJECTS */}
                  {resumeData.projects?.length > 0 && (
                    <div className="mb-4">
                      <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5 mb-1.5 font-display">
                        Key Projects
                      </h2>
                      <div className="space-y-2">
                        {resumeData.projects.map((proj, pIdx) => (
                          <div key={pIdx} className="text-[11px] space-y-0.5">
                            <div className="flex justify-between font-bold text-gray-950">
                              <span>{proj.name}</span>
                              {proj.techStack?.length > 0 && (
                                <span className="font-normal text-gray-600 text-[10px]">
                                  [{proj.techStack.join(', ')}]
                                </span>
                              )}
                            </div>
                            {proj.description && <p className="text-gray-800">{proj.description}</p>}
                            {proj.bullets?.length > 0 && (
                              <ul className="list-disc ml-4 space-y-0.5 text-gray-800">
                                {proj.bullets.map((b, bI) => (
                                  <li key={bI}>{b}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* EDUCATION */}
                  {resumeData.education?.length > 0 && (
                    <div>
                      <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5 mb-1.5 font-display">
                        Education
                      </h2>
                      <div className="space-y-1">
                        {resumeData.education.map((edu, eIdx) => (
                          <div key={eIdx} className="flex justify-between text-[11px]">
                            <div>
                              <span className="font-bold text-gray-950">{edu.degree}</span>
                              <span className="text-gray-700">, {edu.institution}</span>
                            </div>
                            <span className="text-gray-600">{edu.graduationYear}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeTailor;
