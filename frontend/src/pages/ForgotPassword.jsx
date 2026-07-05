import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: Request OTP, Step 2: Verify OTP & Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setStep(2);
      toast.success(res.data.message || 'OTP sent to your email.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) return;
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password-otp', { email, otp, newPassword });
      toast.success('Password reset successfully! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP or Error resetting password.');
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ show, toggle }) => (
    <button 
      type="button" 
      onClick={toggle}
      style={{
        position: 'absolute',
        right: '15px',
        bottom: '15px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#64748b'
      }}
    >
      {show ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
      )}
    </button>
  );

  return (
    <div className="auth-split-container">
      {/* Left Image Side */}
      <div className="auth-left">
        <img src="/transplant_auth_bg.png" alt="Transplant Concept" />
      </div>

      {/* Right Form Side */}
      <div className="auth-right">
        <div className="auth-form-container">
          <h1 style={{ fontSize: '2.4rem' }}>
            {step === 1 ? 'Forgot Password' : 'Enter OTP'}
          </h1>
          <p>
            {step === 1 ? 'Enter your email to receive a 6-digit OTP.' : `OTP sent to ${email}`}
          </p>

          {step === 1 ? (
            <form onSubmit={handleRequestOtp}>
              <div className="auth-form-group mb-4">
                <label className="auth-label">Registered Email</label>
                <input type="email" className="auth-input" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Enter Your Email" />
              </div>

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Sending...' : 'Get OTP'}
              </button>
              
              <div className="auth-footer-text">
                Remember your password? <Link to="/login" className="auth-link">Login Here</Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="auth-form-group mb-4">
                <label className="auth-label">6-Digit OTP</label>
                <input type="text" className="auth-input" required maxLength={6} minLength={6}
                  style={{ letterSpacing: '0.5em', textAlign: 'center', fontWeight: 800 }}
                  value={otp} onChange={e => setOtp(e.target.value)}
                  placeholder="000000" />
              </div>

              <div className="auth-form-group mb-4" style={{ position: 'relative' }}>
                <label className="auth-label">New Password</label>
                <input type={showNewPassword ? "text" : "password"} className="auth-input" required minLength="6"
                  style={{ paddingRight: '40px' }}
                  value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••" />
                <EyeIcon show={showNewPassword} toggle={() => setShowNewPassword(!showNewPassword)} />
              </div>

              <div className="auth-form-group mb-4" style={{ position: 'relative' }}>
                <label className="auth-label">Confirm New Password</label>
                <input type={showConfirmPassword ? "text" : "password"} className="auth-input" required minLength="6"
                  style={{ paddingRight: '40px' }}
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" />
                <EyeIcon show={showConfirmPassword} toggle={() => setShowConfirmPassword(!showConfirmPassword)} />
              </div>

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Verifying...' : 'Reset Password'}
              </button>
              
              <div className="auth-footer-text">
                <button type="button" onClick={() => setStep(1)} className="auth-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
                  Cancel & Change Email
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
