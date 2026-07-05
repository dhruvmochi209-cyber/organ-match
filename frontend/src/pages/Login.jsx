import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const ROLE_REDIRECTS = {
    donor: '/donor', recipient: '/recipient',
    hospital_admin: '/hospital', super_admin: '/admin'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await login(form.email, form.password);
      navigate(ROLE_REDIRECTS[data.user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-split-container">
      {/* Left Image Side */}
      <div className="auth-left">
        <img src="/transplant_auth_bg.png" alt="Transplant Concept" />
      </div>

      {/* Right Form Side */}
      <div className="auth-right">
        <div className="auth-form-container">
          <h1>Welcome Back!</h1>
          <p>Login Your Account</p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-error mb-6" style={{ background: 'rgba(255,255,255,0.9)', color: '#ef4444', borderLeft: '4px solid #ef4444' }}>
                {error}
              </div>
            )}

            <div className="auth-form-group">
              <label className="auth-label">Email Address</label>
              <input type="email" className="auth-input" required
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="vk@gmail.com" />
            </div>

            <div className="auth-form-group mb-4" style={{ position: 'relative' }}>
              <label className="auth-label">Password</label>
              <input type={showPassword ? "text" : "password"} className="auth-input" required minLength="6"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••" style={{ paddingRight: '40px' }} />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
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
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'white', cursor: 'pointer' }}>
                <input type="checkbox" style={{ cursor: 'pointer' }} /> Remember Me
              </label>
              
              <Link to="/forgot-password" style={{ color: 'white', fontSize: '0.9rem', textDecoration: 'none' }}>
                Forget Password?
              </Link>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Verifying...' : 'Login'}
            </button>
          </form>

          <div className="auth-footer-text">
            Don't have an account? <Link to="/register" className="auth-link">Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
