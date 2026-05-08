import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="animate-fade" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: '#0a0f1d',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Dynamic Background Elements */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, hsla(349, 100%, 58%, 0.15) 0%, transparent 70%)', zIndex: 0, filter: 'blur(80px)' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, hsla(160, 84%, 39%, 0.1) 0%, transparent 70%)', zIndex: 0, filter: 'blur(80px)' }}></div>

      <div className="animate-slide-up" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '4rem',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(30px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '40px',
        boxShadow: '0 40px 100px rgba(0, 0, 0, 0.5)',
        color: 'white',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h1 style={{ 
            fontWeight: 950, 
            fontSize: '2.5rem', 
            marginBottom: '0.5rem', 
            letterSpacing: '-0.04em', 
            color: 'white'
          }}>
            Login Here
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error mb-6" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', borderLeft: '4px solid #ef4444' }}>{error}</div>}

          <div className="form-group mb-6">
            <label className="form-label" style={{ color: '#cbd5e1', fontWeight: 700 }}>Email</label>
            <input type="email" className="form-control" required
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', height: '56px' }}
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="Enter Your Email" />
          </div>

          <div className="form-group mb-8">
            <label className="form-label" style={{ color: '#cbd5e1', fontWeight: 700 }}>Security Password</label>
            <input type="password" className="form-control" required
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', height: '56px' }}
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••" />
          </div>

          <button type="submit" className="btn btn-primary w-full mb-4" disabled={loading} style={{ height: '56px', fontSize: '1.1rem', borderRadius: '100px' }}>
            {loading ? 'Verifying Access...' : 'Login Now'}
          </button>
          
          <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
            <Link to="/forgot-password" style={{ color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'white'} onMouseOut={(e) => e.target.style.color = '#94a3b8'}>
              Forgot Password?
            </Link>
          </div>
        </form>

        <p style={{ textAlign: 'center', marginTop: '3rem', color: '#94a3b8', fontSize: '1rem' }}>
          Institutional partner? <Link to="/register" style={{ fontWeight: 800, color: 'white', textDecoration: 'none', borderBottom: '2px solid var(--primary)' }}>Register Here</Link>
        </p>
      </div>

      <div style={{ position: 'absolute', bottom: '2rem', left: '0', right: '0', textAlign: 'center', color: '#475569', fontSize: '0.85rem' }}>
        Protected by National Health Registry Protocol v2.4
      </div>
    </div>
  );
}
