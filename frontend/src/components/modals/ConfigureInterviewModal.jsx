import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, UploadCloud, Loader2, FileText, AlertCircle, Sparkles, Check } from 'lucide-react';
import api from '../../utils/api';

const TRENDING_ROLES = [
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "DevOps & Cloud Engineer",
  "Site Reliability Engineer (SRE)",
  "Data Scientist",
  "Data Engineer",
  "Machine Learning Engineer",
  "AI Research Scientist",
  "Mobile Developer (iOS/Android)",
  "Cloud Architect",
  "Cybersecurity Engineer",
  "Systems & Distributed Systems Engineer"
];

const ConfigureInterviewModal = ({ isOpen, onClose }) => {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

  const handleRoleChange = (e) => {
    const value = e.target.value;
    setRole(value);
    
    if (value.length >= 2) {
      const filtered = TRENDING_ROLES.filter(r => r.toLowerCase().includes(value.toLowerCase()));
      setFilteredRoles(filtered);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !role.trim()) {
      setError('Please provide both a Resume PDF and a Target Role.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('role', role);

      const res = await api.post('/interview/upload-resume', formData);
      const { interviewId, context } = res.data.data;
      
      onClose();
      navigate(`/interview/${interviewId}`, { state: { context, role } });

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to process resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={!loading ? onClose : undefined}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            className="relative w-full max-w-lg bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 z-10 shadow-2xl text-slate-800"
          >
            <button 
              onClick={onClose} 
              disabled={loading}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition cursor-pointer p-1 rounded-lg hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3 h-3" /> Live Technical Simulation
            </div>

            <h2 className="text-xl font-display font-bold text-slate-900 mb-1">Configure Mock Session</h2>
            <p className="text-slate-500 text-xs mb-6">Upload your resume to tailor interview questions specifically to your background.</p>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1.5 relative z-50">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Target Role</label>
                <div className="relative">
                  <input
                    type="text"
                    value={role}
                    onChange={handleRoleChange}
                    onFocus={() => {
                      if (role.length >= 2 && filteredRoles.length > 0) setShowDropdown(true);
                    }}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition"
                    disabled={loading}
                    autoComplete="off"
                  />
                  <AnimatePresence>
                    {showDropdown && filteredRoles.length > 0 && (
                      <motion.ul 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="relative z-20 w-full mt-1.5 py-1.5 bg-white rounded-xl border border-slate-200 shadow-xl max-h-44 overflow-y-auto"
                      >
                        {filteredRoles.map((r, idx) => (
                          <li 
                            key={idx}
                            onClick={() => handleRoleSelect(r)}
                            className="px-3.5 py-2 hover:bg-blue-50 hover:text-blue-700 cursor-pointer text-xs text-slate-700 font-medium transition"
                          >
                            {r}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Upload PDF Resume</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl cursor-pointer bg-slate-50 hover:bg-blue-50/20 transition group">
                  <div className="flex flex-col items-center justify-center p-3 text-center">
                    {file ? (
                      <div className="flex flex-col items-center">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
                          <Check className="w-5 h-5" />
                        </div>
                        <p className="text-xs text-emerald-700 font-bold">{file.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Ready for simulation</p>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-7 h-7 text-slate-400 group-hover:text-blue-600 transition mb-1" />
                        <p className="text-xs text-slate-600"><span className="font-bold text-blue-600">Click to upload</span> or drag and drop</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">PDF (MAX. 5MB)</p>
                      </>
                    )}
                  </div>
                  <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} disabled={loading} />
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !file || !role.trim()}
                className="w-full py-3.5 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Resume & Building Room...</span>
                  </>
                ) : (
                  'Launch Mock Interview'
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfigureInterviewModal;
