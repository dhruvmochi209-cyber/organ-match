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

  return (
    <div className="animate-fade" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#0a0f1d', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, hsla(349, 100%, 58%, 0.15) 0%, transparent 70%)', zIndex: 0, filter: 'blur(80px)' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, hsla(160, 84%, 39%, 0.1) 0%, transparent 70%)', zIndex: 0, filter: 'blur(80px)' }}></div>

      <div className="animate-slide-up" style={{ width: '100%', maxWidth: '480px', padding: '4rem', background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '40px', boxShadow: '0 40px 100px rgba(0, 0, 0, 0.5)', color: 'white', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h1 style={{ fontWeight: 950, fontSize: '2.5rem', marginBottom: '0.5rem', letterSpacing: '-0.04em', color: 'white' }}>
            {step === 1 ? 'Forgot Password' : 'Enter OTP'}
          </h1>
          <p style={{ color: '#94a3b8' }}>
            {step === 1 ? 'Enter your email to receive a 6-digit OTP.' : `OTP sent to ${email}`}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestOtp}>
            <div className="form-group mb-8">
              <label className="form-label" style={{ color: '#cbd5e1', fontWeight: 700 }}>Registered Email</label>
              <input type="email" className="form-control" required
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', height: '56px' }}
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Enter Your Email" />
            </div>

            <button type="submit" className="btn btn-primary w-full mb-6" disabled={loading} style={{ height: '56px', fontSize: '1.1rem', borderRadius: '100px' }}>
              {loading ? 'Sending...' : 'Get OTP'}
            </button>
            
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '1rem' }}>
              Remember your password? <Link to="/login" style={{ fontWeight: 800, color: 'white', textDecoration: 'none', borderBottom: '2px solid var(--primary)' }}>Login Here</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="form-group mb-4">
              <label className="form-label" style={{ color: '#cbd5e1', fontWeight: 700 }}>6-Digit OTP</label>
              <input type="text" className="form-control" required maxLength={6}
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', height: '56px', letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.2rem', fontWeight: 800 }}
                value={otp} onChange={e => setOtp(e.target.value)}
                placeholder="000000" />
            </div>

            <div className="form-group mb-4">
              <label className="form-label" style={{ color: '#cbd5e1', fontWeight: 700 }}>New Password</label>
              <input type="password" className="form-control" required
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', height: '56px' }}
                value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••" />
            </div>

            <div className="form-group mb-8">
              <label className="form-label" style={{ color: '#cbd5e1', fontWeight: 700 }}>Confirm New Password</label>
              <input type="password" className="form-control" required
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', height: '56px' }}
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••" />
            </div>

            <button type="submit" className="btn btn-primary w-full mb-6" disabled={loading} style={{ height: '56px', fontSize: '1.1rem', borderRadius: '100px' }}>
              {loading ? 'Verifying & Updating...' : 'Reset Password'}
            </button>
            
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '1rem' }}>
              <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', fontWeight: 800, color: 'white', cursor: 'pointer', textDecoration: 'none', borderBottom: '2px solid var(--primary)' }}>Cancel & Change Email</button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
