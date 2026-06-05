import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, Loader2, AlertCircle, ScanLine, Target, LayoutList, ChevronRight } from 'lucide-react';
import api from '../utils/api';

const ResumeIntel = () => {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null); // { score, keywords, improvements }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== 'application/pdf') {
      setError('Only PDF files are allowed.');
      setFile(null);
      return;
    }
    setError('');
    setFile(selectedFile);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file || !role.trim()) {
      setError('Please provide both your Resume PDF and the Target Role you are applying for.');
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
      setError(err.response?.data?.message || 'Failed to analyze resume. Ensure the Ollama engine is running.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400 stroke-green-400';
    if (score >= 50) return 'text-amber-400 stroke-amber-400';
    return 'text-red-400 stroke-red-400';
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = results ? circumference - (results.score / 100) * circumference : circumference;

  return (
    <div className="w-full max-w-5xl mx-auto pb-10">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 md:p-8 rounded-3xl border border-white/5 mb-8 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
        <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center gap-3">
          <ScanLine className="w-8 h-8 text-cyan-400" /> Resume Intel Engine
        </h1>
        <p className="text-gray-400 max-w-2xl">Ping your resume against our predictive Applicant Tracking System (ATS) multi-agent logic. We dissect keyword drop-off and structural formatting flaws against your target role instantly.</p>
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        
        {/* STATE: UPLOADER */}
        {!loading && !results && (
          <motion.form 
            key="upload-form"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }}
            onSubmit={handleAnalyze} 
            className="flex flex-col md:flex-row gap-6 items-start"
          >
            {/* Input Configs */}
            <div className="w-full md:w-1/2 space-y-6">
              <div className="glass-card p-6 rounded-3xl border border-white/5">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-cyan-400" /> Target Role
                </label>
                <input
                  type="text" value={role} onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-4 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div className="glass-card p-6 rounded-3xl border border-white/5">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-purple-400" /> Upload PDF Resume
                </label>
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-700 hover:border-cyan-500/50 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 transition-colors group">
                  <div className="flex flex-col items-center justify-center">
                    {file ? (
                      <>
                        <FileText className="w-10 h-10 text-cyan-400 mb-2" />
                        <p className="text-sm text-gray-200 font-medium">{file.name}</p>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-10 h-10 text-gray-500 group-hover:text-cyan-400 transition-colors mb-2" />
                        <p className="text-sm text-gray-400"><span className="text-white font-medium">Click to upload</span> or drag and drop</p>
                      </>
                    )}
                  </div>
                  <input key={file ? file.name : 'empty'} type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                </label>
              </div>
            </div>

            {/* Submit Action */}
            <div className="w-full md:w-1/2 flex items-center justify-center h-full min-h-[300px]">
              <button
                type="submit" disabled={!file || !role.trim()}
                className="w-full max-w-sm py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all duration-300 flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                Launch Intel Analysis <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.form>
        )}

        {/* STATE: LOADING PIPELINE */}
        {loading && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-64 glass-card rounded-3xl border border-white/5 border-t-cyan-500 shadow-[0_-5px_20px_rgba(0,240,255,0.1)] relative overflow-hidden"
          >
            {/* Ping animation scanner background */}
            <motion.div animate={{ top: ['-10%', '110%'] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent to-cyan-500/20 pointer-events-none" />
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4 relative z-10" />
            <p className="text-xl font-display font-bold text-white tracking-widest relative z-10">ANALYZING AST VECTORS</p>
            <p className="text-gray-400 text-sm mt-2 relative z-10">Evaluating keyword drop-off against "{role}"...</p>
          </motion.div>
        )}

        {/* STATE: RESULTS DASHBOARD */}
        {!loading && results && (
          <motion.div 
            key="results"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* ATS Score Circle Container */}
              <div className="glass-card rounded-3xl border border-white/5 p-8 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-sm font-medium text-gray-400 mb-6 uppercase tracking-wider">ATS Match Score</h3>
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-800" />
                    <motion.circle 
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      cx="50" cy="50" r="45" fill="none" 
                      stroke="currentColor" strokeWidth="8" strokeLinecap="round" 
                      className={getScoreColor(results.score)}
                      style={{ strokeDasharray: circumference }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className={`text-4xl font-display font-bold ${getScoreColor(results.score).split(' ')[0]}`}>
                      {results.score}
                    </span>
                    <span className="text-xs text-gray-500 font-bold">/ 100</span>
                  </div>
                </div>
                <button 
                  onClick={() => { setResults(null); setFile(null); setRole(''); }}
                  className="mt-8 text-sm text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  Analyze another
                </button>
              </div>

              {/* Keyword Deficiencies */}
              <div className="md:col-span-2 glass-card rounded-3xl border border-white/5 p-8">
                <h3 className="text-lg font-display font-semibold text-white mb-6 flex items-center gap-2">
                  <Target className="w-5 h-5 text-red-400" /> Required Keywords Missing
                </h3>
                <div className="flex flex-wrap gap-3">
                  {results.keywords && results.keywords.length > 0 ? (
                    results.keywords.map((kw, i) => (
                      <span key={i} className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                        {kw}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">Wow! You hit all the major keywords.</p>
                  )}
                </div>
              </div>

            </div>

            {/* Strategic Improvements */}
            <div className="glass-card rounded-3xl border border-white/5 p-8">
              <h3 className="text-lg font-display font-semibold text-white mb-6 flex items-center gap-2">
                <LayoutList className="w-5 h-5 text-purple-400" /> Strategic Structural Advice
              </h3>
              <ul className="space-y-4">
                {results.improvements && results.improvements.length > 0 ? (
                  results.improvements.map((imp, i) => (
                    <li key={i} className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs text-purple-400 font-bold">{i + 1}</span>
                      </div>
                      <p className="text-gray-300 leading-relaxed text-sm md:text-base">{imp}</p>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500">Your resume formatting is flawlessly tailored.</p>
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
