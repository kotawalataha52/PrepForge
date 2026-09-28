import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { ArrowRight, Mail, Lock, User, AlertCircle } from 'lucide-react';
import Logo from '../components/common/Logo';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const { register, error, clearError } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await register(formData.name, formData.email, formData.password);
    setLoading(false);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center relative px-6 bg-[#F4F7FC] text-slate-800 w-full">
      {/* Subtle Ambient Light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-blue-400/10 blur-[130px] pointer-events-none rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white p-8 md:p-10 rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          {/* Brand Monogram */}
          <div className="flex justify-center mb-6">
            <Logo size="lg" showText={true} darkText={true} />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Create an Account</h2>
            <p className="text-slate-500 text-xs md:text-sm mt-1">Start practicing realistic technical interviews.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }} 
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-700 text-xs"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-3 text-xs md:text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition placeholder:text-slate-400"
                  placeholder="e.g. Alex Morgan"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-3 text-xs md:text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition placeholder:text-slate-400"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  minLength="6"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-3 text-xs md:text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition placeholder:text-slate-400"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs md:text-sm shadow-sm transition flex justify-center items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Get Started'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition">
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
