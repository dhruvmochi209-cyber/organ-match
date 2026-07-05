import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [completedTransplants, setCompletedTransplants] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (['users', 'hospitals', 'audit', 'transplants'].includes(path)) {
      setActiveTab(path);
    } else {
      setActiveTab('stats');
    }
  }, [location.pathname]);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const load = async () => {
    try {
      const [s, u, h, a, ct] = await Promise.all([
        api.get('/admin/dashboard-stats').catch(() => ({ data: {} })),
        api.get('/admin/users').catch(() => ({ data: [] })),
        api.get('/admin/hospitals').catch(() => ({ data: [] })),
        api.get('/admin/audit-logs').catch(() => ({ data: [] })),
        api.get('/admin/completed-transplants').catch(() => ({ data: [] })),
      ]);
      setStats(s.data); setUsers(u.data); setHospitals(h.data); setAuditLogs(a.data); setCompletedTransplants(ct.data);
    } finally { setLoading(false); }
  };

  const handleRefresh = async () => {
    setProcessing(true);
    await load();
    setProcessing(false);
  };

  useEffect(() => {
    load();

    // ✅ Real-time Updates via Socket.io
    const socketPromise = import('../../services/socket').then(m => {
      const s = m.default;
      s.on('USER_UPDATED', (data) => {
        console.log('Admin real-time sync:', data);
        load();
      });
      return s;
    });

    return () => {
      socketPromise.then(s => s.off('USER_UPDATED'));
    };
  }, []);

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    setProcessing(true);
    try { await api.delete(`/admin/user/${id}`); toast.success('User deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setProcessing(false); }
  };

  const handleHospitalDecision = async (id, status) => {
    setProcessing(true);
    try {
      await api.post(`/admin/approve-hospital/${id}`, { status });
      toast.success(`Hospital ${status}`); load();
    } catch (err) { toast.error('Failed'); }
    finally { setProcessing(false); }
  };

  if (loading) return <div className="dashboard-layout"><Sidebar /><div className="main-content"><div className="loading-spinner"><div className="spinner"></div></div></div></div>;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(20px)',
          padding: '2rem',
          borderRadius: '24px',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
          border: '1px solid rgba(255,255,255,1)'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 1000, letterSpacing: '-0.05em' }}>Centralized Control</h1>
            <p className="text-muted" style={{ fontWeight: 600 }}>OrganMatch Registry Master Dashboard</p>
          </div>
          <button className="btn btn-primary" onClick={handleRefresh} disabled={processing} style={{ borderRadius: '100px', padding: '1rem 2.5rem' }}>
            {processing ? 'Syncing...' : 'Refresh'}
          </button>
        </div>

        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
            {[
              { label: 'User Directory', val: users.length, color: 'var(--primary)', icon: '👥' },
              { label: 'Registry Nodes', val: hospitals.length, color: '#6366f1', icon: '🏥' },
              { label: 'System Audits', val: auditLogs.length, color: '#8b5cf6', icon: '📑' },
              { label: 'Success Records', val: completedTransplants.length, color: '#10b981', icon: '✅' },
            ].map((item, index) => (
              <div key={item.label} className="stat-card animate-slide-up" style={{
                animationDelay: `${index * 0.1}s`,
                background: 'white',
                boxShadow: 'var(--shadow-premium)',
                border: 'none',
                padding: '2.5rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', background: `${item.color}10`, width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  {item.icon}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>{item.label}</div>
                <div style={{ color: item.color, fontSize: '2.8rem', fontWeight: 1000 }}>{item.val ?? 0}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
          {[
            ['stats', 'Stats', '/admin'],
            ['users', 'Users', '/admin/users'],
            ['hospitals', 'Hospitals', '/admin/hospitals'],
            ['audit', 'Audit Logs', '/admin/audit'],
            ['transplants', 'Completed Transplants', '/admin/transplants'],
          ].map(([t, label, path]) => (
            <button key={t}
              style={{
                padding: '0.75rem 1.5rem', border: 'none', background: 'transparent',
                borderBottom: activeTab === t ? `3px solid var(--primary)` : '3px solid transparent',
                color: activeTab === t ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeTab === t ? 700 : 500, fontSize: '0.9rem', cursor: 'pointer'
              }}
              onClick={() => navigate(path)}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'users' && (
          <div className="card">
            <h4 className="mb-4">Users List</h4>
            <table className="table">
              <thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Action</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>#{u.id.substring(0,8).toUpperCase()}</td>
                    <td><strong>{u.username}</strong></td>
                    <td>{u.email}</td>
                    <td><span className="badge badge-neutral">{u.role}</span></td>
                    <td>
                      {u.id !== user?.id && (
                        <button className="btn btn-sm btn-danger" disabled={processing} onClick={() => handleDeleteUser(u.id)}>Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'hospitals' && (
          <div className="card">
            <h4 className="mb-4">Hospitals Approval</h4>
            <table className="table">
              <thead><tr><th>ID</th><th>Name</th><th>Location</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {hospitals.map(h => (
                  <tr key={h.id}>
                    <td>HID-{h.id.substring(0,8).toUpperCase()}</td>
                    <td>{h.name}</td>
                    <td>{h.location}</td>
                    <td><span className={`badge ${h.certification_status === 'Certified' ? 'badge-success' : 'badge-warning'}`}>{h.certification_status}</span></td>
                    <td>
                      {h.certification_status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-sm btn-success" onClick={() => handleHospitalDecision(h.id, 'Certified')}>Approve</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleHospitalDecision(h.id, 'Rejected')}>Reject</button>
                        </div>
                      ) : <span className="text-xs">Processed</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="card">
            <h4 className="mb-4">Recent System Logs</h4>
            <table className="table">
              <thead><tr><th>ID</th><th>User</th><th>Action</th><th>Date</th></tr></thead>
              <tbody>
                {auditLogs.slice(0, 50).map(log => (
                  <tr key={log.id}>
                    <td>#{log.id.substring(0,8).toUpperCase()}</td>
                    <td><strong>{log.username}</strong></td>
                    <td>{log.action}</td>
                    <td>{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'transplants' && (
          <div className="card">
            <h4 className="mb-4">Completed Transplants</h4>
            <table className="table">
              <thead><tr><th>Match ID</th><th>Donor Name</th><th>Recipient Name</th><th>Match Score</th><th>Completed Date</th></tr></thead>
              <tbody>
                {completedTransplants.map(t => (
                  <tr key={t.id}>
                    <td>#{t.id.substring(0,8).toUpperCase()}</td>
                    <td><strong>{t.donor_name}</strong></td>
                    <td><strong>{t.recipient_name}</strong></td>
                    <td><span className="badge badge-success">{t.match_score}%</span></td>
                    <td>{new Date(t.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {completedTransplants.length === 0 && (
                  <tr><td colSpan="5" className="text-center">No completed transplants yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="card">
            <h4>System Status</h4>
            <p className="text-muted">The system is running on the institutional registry protocol. All data is synchronized across hospital nodes.</p>
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #ddd', marginTop: '1rem' }}>
              <strong>Institutional Orange:</strong> #ea580c | <strong>Institutional Green:</strong> #10b981
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
