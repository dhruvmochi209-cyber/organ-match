import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'donor' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const ROLE_REDIRECTS = { donor: '/donor', recipient: '/recipient', hospital_admin: '/hospital' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await register({ username: form.name, email: form.email, password: form.password, role: form.role });
      navigate(ROLE_REDIRECTS[data.role] || '/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
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
          <h1 style={{ fontSize: '2.4rem' }}>Join Registry</h1>
          <p>Create an account to get started</p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-error mb-6" style={{ background: 'rgba(255,255,255,0.9)', color: '#ef4444', borderLeft: '4px solid #ef4444' }}>
                {error}
              </div>
            )}

            <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="auth-form-group" style={{ marginBottom: 0 }}>
                <label className="auth-label">Username</label>
                <input type="text" className="auth-input" required minLength="3"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter Name" />
              </div>
              <div className="auth-form-group" style={{ marginBottom: 0 }}>
                <label className="auth-label">Type</label>
                <select className="auth-select" required
                  value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="donor">Donor</option>
                  <option value="recipient">Recipient</option>
                  <option value="hospital_admin">Hospital</option>
                </select>
              </div>
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Contact Email</label>
              <input type="email" className="auth-input" required
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="Enter Email" />
            </div>

            <div className="auth-form-group mb-4" style={{ position: 'relative' }}>
              <label className="auth-label">Secure Password</label>
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

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Initializing...' : 'Register Now'}
            </button>
          </form>

          <div className="auth-footer-text">
            Already have an account? <Link to="/login" className="auth-link">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
