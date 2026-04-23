import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'donor' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, hsla(349, 100%, 58%, 0.15) 0%, transparent 70%)', zIndex: 0, filter: 'blur(80px)' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, hsla(160, 84%, 39%, 0.1) 0%, transparent 70%)', zIndex: 0, filter: 'blur(80px)' }}></div>

      <div className="animate-slide-up" style={{
        width: '100%',
        maxWidth: '520px',
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
            Join Registry
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error mb-6" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', borderLeft: '4px solid #ef4444' }}>{error}</div>}

          <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ color: '#cbd5e1', fontWeight: 700 }}>Username</label>
              <input type="text" className="form-control" required
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Enter Your Name" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ color: '#cbd5e1', fontWeight: 700 }}>Type</label>
              <select className="form-control" required
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="donor" style={{ background: '#0a0f1d' }}>Donor</option>
                <option value="recipient" style={{ background: '#0a0f1d' }}>Recipient</option>
                <option value="hospital_admin" style={{ background: '#0a0f1d' }}>Hospital</option>
              </select>
            </div>
          </div>

          <div className="form-group mb-6">
            <label className="form-label" style={{ color: '#cbd5e1', fontWeight: 700 }}>Contact Email</label>
            <input type="email" className="form-control" required
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', height: '56px' }}
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="Enter Your Email" />
          </div>

          <div className="form-group mb-8">
            <label className="form-label" style={{ color: '#cbd5e1', fontWeight: 700 }}>Secure Password</label>
            <input type="password" className="form-control" required
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', height: '56px' }}
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••" />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ height: '56px', fontSize: '1.1rem', borderRadius: '100px' }}>
            {loading ? 'Initializing Core...' : 'Register Now'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '3rem', color: '#94a3b8', fontSize: '1rem' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 800, color: 'white', textDecoration: 'none', borderBottom: '2px solid var(--primary)' }}>Login Here</Link>
        </p>
      </div>

      <div style={{ position: 'absolute', bottom: '2rem', left: '0', right: '0', textAlign: 'center', color: '#475569', fontSize: '0.85rem' }}>
        Registry protocols secured by OrganMatch Network v2.4
      </div>
    </div>
  );
}
