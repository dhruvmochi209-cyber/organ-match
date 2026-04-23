import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_CONFIG = {
  donor: [
    { path: '/donor', label: 'Dashboard', icon: '📊' },
    { path: '/donor/register', label: 'My Profile', icon: '👤' },
    { path: '/donor/reports', label: 'My Reports', icon: '📋' },
    { path: '/donor/matches', label: 'My Matches', icon: '🤝' },
    { path: '/hospital/payments', label: 'My Billing', icon: '💳' },
  ],
  recipient: [
    { path: '/recipient', label: 'Dashboard', icon: '📊' },
    { path: '/recipient/register', label: 'My Profile', icon: '👤' },
    { path: '/recipient/reports', label: 'My Reports', icon: '📋' },
    { path: '/recipient/matches', label: 'My Matches', icon: '🤝' },
    { path: '/hospital/payments', label: 'My Billing', icon: '💳' },
  ],
  hospital_admin: [
    { path: '/hospital', label: 'Dashboard', icon: '📊' },
    { path: '/hospital/patients', label: 'Patients List', icon: '👥' },
    { path: '/hospital/verify-donors', label: 'Verify Donors', icon: '✅' },
    { path: '/hospital/verify-recipients', label: 'Verify Recipients', icon: '📋' },
    { path: '/hospital/reports', label: 'Audit Reports', icon: '📑' },
    { path: '/hospital/matches', label: 'Registry Decisions', icon: '⚖️' },
    { path: '/hospital/transplants', label: 'Transplants', icon: '🏥' },
    { path: '/hospital/payments', label: 'Billing', icon: '💳' },
  ],
  super_admin: [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'User Directory', icon: '👥' },
    { path: '/admin/hospitals', label: 'Registry Nodes', icon: '🏥' },
    { path: '/admin/audit', label: 'Clinical Audit', icon: '📋' },
    { path: '/admin/transplants', label: 'Transplants', icon: '✅' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = NAV_CONFIG[user?.role] || [];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar" style={{ margin: '1.5rem', borderRadius: '32px' }}>
      <div className="sidebar-brand">
        <div style={{ 
          width: '40px', height: '40px', background: 'var(--primary)', 
          borderRadius: '12px', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', fontSize: '1.4rem', boxShadow: '0 8px 16px var(--primary-glow)' 
        }}>❤️</div>
        <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 1000, letterSpacing: '-0.04em' }}>Organ<span className="text-gradient">Match</span></h2>
      </div>

      <nav className="sidebar-nav" style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.25rem' }}>
        {navItems.map(item => (
          <div
            key={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      <div style={{ 
        marginTop: 'auto', 
        padding: '1.5rem', 
        background: 'rgba(248, 250, 252, 0.8)',
        borderRadius: '24px',
        border: '1px solid rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ 
            width: '44px', height: '44px', background: 'var(--primary)', color: 'white',
            borderRadius: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: '1.2rem', fontWeight: 900, boxShadow: '0 4px 12px var(--primary-glow)'
          }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.username}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user?.role?.replace(/_/g, ' ')}</div>
          </div>
        </div>
        <button 
          onClick={handleLogout} 
          className="btn w-full" 
          style={{ 
            padding: '0.8rem', 
            fontSize: '0.85rem', 
            borderRadius: '12px', 
            background: '#fff1f2', 
            color: '#e11d48',
            border: '1px solid #fecdd3',
            fontWeight: 800,
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = '#ffe4e6'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          🔒 Logout Session
        </button>
      </div>
    </aside>
  );
}
