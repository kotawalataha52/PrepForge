import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, UploadCloud, Loader2, FileText, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

const TRENDING_ROLES = [
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "DevOps Engineer",
  "Site Reliability Engineer (SRE)",
  "Data Scientist",
  "Data Engineer",
  "Machine Learning Engineer",
  "AI Research Scientist",
  "Mobile Developer (iOS/Android)",
  "Quality Assurance Engineer",
  "Cloud Architect",
  "Cybersecurity Engineer",
  "Systems Engineer",
  "Embedded Systems Engineer"
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

      // Call our new backend endpoint!
      const res = await api.post('/interview/upload-resume', formData);

      const { interviewId, context } = res.data.data;
      
      // Close modal and Navigate instantly to the Interview Room!
      onClose();
      navigate(`/interview/${interviewId}`, { state: { context } });

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
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={!loading ? onClose : undefined}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg glass-card border border-white/10 rounded-3xl p-8 z-10 shadow-2xl bg-gradient-to-b from-gray-900 to-black"
          >
            <button 
              onClick={onClose} 
              disabled={loading}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-display font-bold text-white mb-2">Configure Mock Session</h2>
            <p className="text-gray-400 text-sm mb-8">Upload your resume to tailor the AI questions to your specific experience.</p>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-2 relative z-50">
                <label className="text-sm font-medium text-gray-300">Target Role</label>
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
                    className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                    disabled={loading}
                    autoComplete="off"
                  />
                  <AnimatePresence>
                    {showDropdown && filteredRoles.length > 0 && (
                      <motion.ul 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="relative z-20 w-full mt-2 py-2 glass-card rounded-xl border border-white/10 bg-gray-900/90 backdrop-blur-md max-h-48 overflow-y-auto shadow-xl"
                      >
                        {filteredRoles.map((r, idx) => (
                          <li 
                            key={idx}
                            onClick={() => handleRoleSelect(r)}
                            className="px-4 py-2 hover:bg-white/10 cursor-pointer text-sm text-gray-200 transition-colors"
                          >
                            {r}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Upload PDF Resume</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 hover:border-cyan-500/50 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 transition-colors group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {file ? (
                      <div className="flex flex-col items-center">
                        <FileText className="w-8 h-8 text-cyan-400 mb-2" />
                        <p className="text-sm text-gray-300 font-medium">{file.name}</p>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 text-gray-500 group-hover:text-cyan-400 transition-colors mb-2" />
                        <p className="text-sm text-gray-400"><span className="font-medium text-white">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-500 mt-1">PDF (MAX. 5MB)</p>
                      </>
                    )}
                  </div>
                  <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} disabled={loading} />
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !file || !role.trim()}
                className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-base hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all duration-300 flex justify-center items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Resume...
                  </>
                ) : (
                  'Generate Interview Room'
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
