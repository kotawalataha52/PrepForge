import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  Loader2, 
  ShieldCheck, 
  LayoutList,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const ResumeIntel = () => {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file || !role.trim()) {
      setError('Please upload a PDF resume and specify a target job title.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('role', role);

      const res = await api.post('/resume/intel', formData);
      setResults(res.data.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to analyze resume.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 stroke-emerald-500';
    if (score >= 50) return 'text-amber-600 stroke-amber-500';
    return 'text-rose-600 stroke-rose-500';
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = results ? circumference - (results.score / 100) * circumference : circumference;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-7 pb-12">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold mb-3">
          <Target className="w-3.5 h-3.5" /> Predictive ATS Diagnostics
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 tracking-tight">
          Resume <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Intel Engine</span>
        </h1>
        <p className="text-slate-500 text-xs md:text-sm mt-1 max-w-2xl">
          Scan your resume against your target engineering role to pinpoint missing keywords, structural deficiencies, and concrete steps to pass candidate filtering.
        </p>
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-700 text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-slate-400 hover:text-slate-700">✕</button>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        
        {/* STATE: UPLOADER */}
        {!loading && !results && (
          <motion.form 
            key="upload-form"
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, y: -15 }}
            onSubmit={handleAnalyze} 
            className="grid md:grid-cols-12 gap-6 items-stretch"
          >
            {/* Left Configs */}
            <div className="md:col-span-7 space-y-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <Target className="w-3.5 h-3.5 text-teal-600" /> Target Job Title
                </label>
                <input
                  type="text" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer, Cloud Architect"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl px-4 py-3 text-xs md:text-sm focus:outline-none focus:border-teal-500 focus:bg-white transition"
                />
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> Upload PDF Resume
                </label>
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-xl cursor-pointer bg-slate-50 hover:bg-teal-50/20 transition-all group">
                  <div className="flex flex-col items-center justify-center text-center px-4">
                    {file ? (
                      <>
                        <FileText className="w-8 h-8 text-teal-600 mb-1" />
                        <p className="text-xs text-slate-900 font-semibold">{file.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Ready for deep ATS scan</p>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-teal-600 transition mb-1" />
                        <p className="text-xs text-slate-600"><span className="text-teal-600 font-bold">Click to upload</span> or drag and drop</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">PDF up to 5MB</p>
                      </>
                    )}
                  </div>
                  <input key={file ? file.name : 'empty'} type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                </label>
              </div>
            </div>

            {/* Submit Action */}
            <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900">What we evaluate:</h4>
                <ul className="space-y-2.5 text-xs text-slate-500">
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" /> Exact keyword density & tools
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" /> Action-verb & metric quantification
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" /> Structural formatting & alignment
                  </li>
                </ul>
              </div>

              <button
                type="submit" 
                disabled={!file || !role.trim()}
                className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white font-semibold text-xs flex justify-center items-center gap-2 shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Launch Diagnostics</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.form>
        )}

        {/* STATE: LOADING */}
        {loading && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200/90 shadow-xs text-center p-6"
          >
            <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-4" />
            <p className="text-base font-display font-bold text-slate-900 tracking-wide">Processing ATS Intelligence Scan</p>
            <p className="text-slate-400 text-xs mt-1">Cross-referencing core competencies against "{role}"...</p>
          </motion.div>
        )}

        {/* STATE: RESULTS DASHBOARD */}
        {!loading && results && (
          <motion.div 
            key="results"
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* ATS Score Circle */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 flex flex-col items-center justify-center text-center">
                <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">ATS Alignment Score</h3>
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100" />
                    <motion.circle 
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      cx="50" cy="50" r="45" fill="none" 
                      stroke="currentColor" strokeWidth="8" strokeLinecap="round" 
                      className={getScoreColor(results.score)}
                      style={{ strokeDasharray: circumference }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className={`text-3xl font-display font-bold ${getScoreColor(results.score).split(' ')[0]}`}>
                      {results.score}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">/ 100</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-2 w-full">
                  <Link
                    to="/resume-tailor"
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Tailor This Resume
                  </Link>

                  <button 
                    onClick={() => { setResults(null); setFile(null); setRole(''); }}
                    className="text-xs text-slate-400 hover:text-slate-700 py-1 transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Scan another resume
                  </button>
                </div>
              </div>

              {/* Missing Keywords */}
              <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-rose-600" /> Core Keywords & Technologies Missing
                </h3>
                <div className="flex flex-wrap gap-2">
                  {results.keywords && results.keywords.length > 0 ? (
                    results.keywords.map((kw, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                        {kw}
                      </span>
                    ))
                  ) : (
                    <p className="text-slate-400 text-xs">All essential keywords are present in your resume.</p>
                  )}
                </div>
              </div>

            </div>

            {/* Strategic Improvements */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <LayoutList className="w-4 h-4 text-teal-600" /> Actionable Resume Improvements
              </h3>
              <ul className="space-y-3">
                {results.improvements && results.improvements.length > 0 ? (
                  results.improvements.map((imp, i) => (
                    <li key={i} className="flex gap-3 text-xs leading-relaxed text-slate-600 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                        {i + 1}
                      </span>
                      <span>{imp}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-slate-400 text-xs">Your resume formatting is well optimized.</p>
                )}
              </ul>
            </div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default ResumeIntel;
