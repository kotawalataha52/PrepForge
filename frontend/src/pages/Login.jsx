import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { ArrowRight, Mail, Lock, AlertCircle } from 'lucide-react';
import bgImage from '../assets/bg.png';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(formData.email, formData.password);
    if (success) {
      navigate('/dashboard'); // Will be created later
    }
  };

  return (
    <div 
      className="min-h-screen pt-20 flex items-center justify-center relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/4 w-[30vw] h-[30vw] bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[25vw] h-[25vw] bg-purple-600/10 blur-[80px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md px-6 relative z-10"
      >
        <div className="glass-card p-10 rounded-3xl border border-white/10 box-glow-violet bg-gradient-to-b from-gray-900/50 to-black/80">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400 text-sm">Log in to resume your training.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-sm"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 text-white rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <Link to="#" className="text-xs text-cyan-400 hover:text-cyan-300">Forgot password?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 text-white rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-base hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all duration-300 flex justify-center items-center gap-2 group"
            >
              Log In
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-semibold hover:opacity-80 transition-opacity">
              Start Foraging
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
