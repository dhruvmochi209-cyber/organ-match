import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';
import api from '../../services/api';
import PaymentModal from '../../components/PaymentModal';
import { toast } from 'react-toastify';

export default function HospitalDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hospital, setHospital] = useState(null);
  const [patients, setPatients] = useState({ donors: [], recipients: [] });
  const [pendingReports, setPendingReports] = useState([]);
  const [matches, setMatches] = useState([]);
  const [transplants, setTransplants] = useState([]);
  const [billing, setBilling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingPatients, setPendingPatients] = useState({ donors: [], recipients: [] });
  const [processing, setProcessing] = useState(false);
  const [modalMatch, setModalMatch] = useState(null);
  const [decision, setDecision] = useState({ decision: 'Approved', reason: '' });
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (['patients', 'reports', 'matches', 'verify-donors', 'verify-recipients', 'transplants'].includes(path)) {
      setActiveTab(path === 'patients' ? 'overview' : path);
    } else {
      setActiveTab('overview');
    }
  }, [location.pathname]);

  const load = async () => {
    try {
      const [h, p, r, m, v, t, b] = await Promise.all([
        api.get('/hospital/profile').catch(() => ({ data: null })),
        api.get('/hospital/patients').catch(() => ({ data: { donors: [], recipients: [] } })),
        api.get('/hospital/pending-reports').catch(() => ({ data: [] })),
        api.get('/hospital/matches').catch(() => ({ data: [] })),
        api.get('/hospital/pending-patients').catch(() => ({ data: { donors: [], recipients: [] } })),
        api.get('/hospital/transplants').catch(() => ({ data: [] })),
        api.get('/hospital/billing').catch(() => ({ data: [] })),
      ]);
      setHospital(h.data); setPatients(p.data);
      setPendingReports(r.data); setMatches(m.data);
      setPendingPatients(v.data); setTransplants(t.data);
      setBilling(b.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { 
    load(); 
    
    // ✅ Real-time Updates via Socket.io
    const socket = import('../../services/socket').then(m => {
      const s = m.default;
      s.on('USER_UPDATED', (data) => {
        console.log('Real-time Update received:', data);
        load(); // Refresh all data when any user is updated/deleted
      });
      return s;
    });

    return () => {
       socket.then(s => s.off('USER_UPDATED'));
    };
  }, []);

  const handleVerifyPatient = async (type, id, status) => {
    setProcessing(true);
    try {
      const url = type === 'donor' ? `/hospital/verify-donor/${id}` : `/hospital/verify-recipient/${id}`;
      await api.post(url, { status });
      toast.success(`Patient ${status}`);
      load();
    } catch (err) { toast.error('Failed: ' + (err.response?.data?.error || 'Error')); }
    finally { setProcessing(false); }
  };

  const handleVerifyReport = async (id, dec) => {
    setProcessing(true);
    try {
      await api.post(`/hospital/verify-report/${id}`, { decision: dec });
      setPendingReports(prev => prev.filter(r => r.id !== id));
      toast.success(`Report ${dec}`);
    } catch (err) { toast.error('Failed: ' + (err.response?.data?.error || 'Error')); }
    finally { setProcessing(false); }
  };

  const handleMatchDecision = async () => {
    if (!modalMatch) return;
    setProcessing(true);
    try {
      await api.post(`/hospital/approve-match/${modalMatch.id}`, decision);
      toast.success(`Match ${decision.decision}`);
      setModalMatch(null);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setProcessing(false); }
  };

  const handleUpdateMatchStatus = async (matchId, status) => {
    setProcessing(true);
    try {
      await api.post(`/hospital/update-match-status/${matchId}`, { status });
      toast.success(`Match updated to ${status}`);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setProcessing(false); }
  };

  const handleDownloadReport = async (matchId) => {
    try {
      const res = await api.get(`/report/match-report/${matchId}`);
      const data = res.data;
      const content = `Match Record ID: #${data.match_id}\nStatus: ${data.status}\nScore: ${data.match_score}%`;
      const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(content);
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `Report_${matchId}.txt`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } catch (err) { toast.error('Failed to download report'); }
  };

  const handleGenerateMatches = async (donorId) => {
    setProcessing(true);
    try {
      const res = await api.post('/matches/generate', { donor_id: donorId });
      toast.success(res.data.message);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setProcessing(false); }
  };

  if (loading) return <div className="dashboard-layout"><Sidebar /><div className="main-content"><div className="loading-spinner"><div className="spinner"></div></div></div></div>;

  if (!hospital) return (
    <div className="dashboard-layout"><Sidebar />
      <main className="main-content">
        <HospitalRegisterForm onSuccess={() => api.get('/hospital/profile').then(r => setHospital(r.data))} />
      </main>
    </div>
  );

  if (!hospital.is_paid) return (
    <div className="dashboard-layout"><Sidebar />
      <main className="main-content">
        <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
          <div className="card" style={{ padding: '3rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🔒</div>
            <h2 className="mb-2">Registration Fee Required</h2>
            <p className="text-muted mb-6">To access the matching registry and verify patients, your hospital node must pay a one-time registration fee of <strong>₹5,000</strong>.</p>
            <button className="btn btn-primary w-full" style={{ padding: '1rem' }} onClick={() => setShowPayment(true)}>Pay Registration Fee now</button>
            <p className="text-xs mt-4 color-muted">Secure transaction via OrganMatch Payment Gateway</p>
          </div>
        </div>
        <PaymentModal isOpen={showPayment} onClose={() => setShowPayment(false)} onSuccess={load} amount={5000} purpose="Hospital Registration Fee" />
      </main>
    </div>
  );

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ 
          background: 'white', 
          padding: '2rem 3rem', 
          borderRadius: '24px', 
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-premium)',
          border: '1px solid rgba(0,0,0,0.03)'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 1000, letterSpacing: '-0.05em', color: '#0f172a' }}>{hospital.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.8rem' }}>
              <span className={`badge ${hospital.certification_status === 'Certified' ? 'badge-success' : 'badge-warning'}`} style={{ borderRadius: '100px', padding: '0.5rem 1.2rem', fontWeight: 800 }}>{hospital.certification_status} Registry Node</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 800, fontSize: '1rem' }}>📍 {hospital.location}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
          {[
            { label: 'Pending Verification', val: pendingPatients.donors.length + pendingPatients.recipients.length, color: 'var(--primary)', icon: '⌛' },
            { label: 'Active Patients', val: patients.donors.length + patients.recipients.length, color: '#6366f1', icon: '👥' },
            { label: 'Clinical Audit', val: pendingReports.length, color: '#8b5cf6', icon: '📑' },
            { label: 'Completed Transplants', val: transplants.length, color: '#f59e0b', icon: '✅' },
            { label: 'Total Collections', val: `₹${billing.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}`, color: '#10b981', icon: '💳' },
          ].map((item, index) => (
            <div key={item.label} className="stat-card animate-slide-up" style={{ 
              animationDelay: `${index * 0.1}s`,
              border: 'none',
              borderRadius: '24px',
              padding: '2.5rem',
              boxShadow: 'var(--shadow-premium)',
              background: 'white',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>{item.icon}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>{item.label}</div>
              <div style={{ color: item.color, fontSize: '2.4rem', fontWeight: 1000 }}>{item.val}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
          {[
            ['overview', 'Dashboard', '/hospital'], 
            ['verify-donors', 'Donor Verification', '/hospital/verify-donors'],
            ['verify-recipients', 'Recipient Registry', '/hospital/verify-recipients'],
            ['reports', 'Clinical Audit', '/hospital/reports'], 
            ['matches', 'Decisions', '/hospital/matches'],
            ['transplants', 'Completed Transplants', '/hospital/transplants']
          ].map(([t, label, path]) => (
            <button key={t} 
              style={{
                padding: '0.75rem 1.5rem', border: 'none', background: 'transparent',
                borderBottom: activeTab === t ? `3px solid var(--primary)` : '3px solid transparent',
                color: activeTab === t ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeTab === t ? 700 : 500, fontSize: '0.9rem', cursor: 'pointer'
              }}
              onClick={() => navigate(path)}
            >{label}</button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid-2 animate-slide-up">
            <div className="card">
              <h4 className="mb-4">Verified Donors</h4>
              <div className="table-container">
                <table className="table">
                  <thead><tr><th>Name</th><th>Group</th><th>Action</th></tr></thead>
                  <tbody>
                    {patients.donors.filter(d => !matches.some(m => m.donor_id === d.id && m.status === 'Completed')).map(d => (
                      <tr key={d.id}>
                        <td>{d.full_name}</td>
                        <td><span className="badge badge-info">{d.blood_type}</span></td>
                        <td><button className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={() => handleGenerateMatches(d.id)}>Match</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h4 className="mb-4">Active Recipients</h4>
              <div className="table-container">
                <table className="table">
                  <thead><tr><th>Name</th><th>Urgency</th><th>Need</th></tr></thead>
                  <tbody>
                    {patients.recipients.filter(r => !matches.some(m => m.recipient_id === r.id && m.status === 'Completed')).map(r => (
                      <tr key={r.id}>
                        <td>{r.full_name}</td>
                        <td><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '40px', height: '6px', background: '#e2e8f0', borderRadius: '10px' }}><div style={{ width: `${r.urgency * 10}%`, height: '100%', background: 'var(--primary)', borderRadius: '10px' }}></div></div><strong>{r.urgency}/10</strong></div></td>
                        <td><span className="badge badge-info">{r.organ_needed}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'verify-donors' && (
          <div className="card">
            <h4 className="mb-4">Donor Verification Queue</h4>
            <table className="table">
              <thead><tr><th>Name</th><th>Identity</th><th>Organ</th><th>Decision</th></tr></thead>
              <tbody>
                {pendingPatients.donors.map(d => (
                  <tr key={d.id}>
                    <td>{d.full_name}</td><td><span className="badge badge-info">{d.blood_type}</span></td><td>{d.organ_to_donate}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-sm btn-success" onClick={() => handleVerifyPatient('donor', d.id, 'Verified')}>Approve</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleVerifyPatient('donor', d.id, 'Rejected')}>Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'verify-recipients' && (
          <div className="card">
            <h4 className="mb-4">Recipient Verification Queue</h4>
            <table className="table">
              <thead><tr><th>Name</th><th>Identity</th><th>Needed Organ</th><th>Verdict</th></tr></thead>
              <tbody>
                {pendingPatients.recipients.map(r => (
                  <tr key={r.id}>
                    <td>{r.full_name}</td><td><span className="badge badge-info">{r.blood_type}</span></td><td>{r.organ_needed}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-sm btn-success" onClick={() => handleVerifyPatient('recipient', r.id, 'Verified')}>Approve</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleVerifyPatient('recipient', r.id, 'Rejected')}>Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="card">
            <h4 className="mb-4">Clinical Report Audit</h4>
            <table className="table">
              <thead><tr><th>ID</th><th>User</th><th>Type</th><th>Date</th><th>Action</th></tr></thead>
              <tbody>
                {pendingReports.map(r => (
                  <tr key={r.id}>
                    <td>#{r.id.substring(0,8).toUpperCase()}</td><td><strong>{r.username}</strong></td><td><span className="badge badge-info">{r.report_type}</span></td><td>{new Date(r.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-sm btn-success" onClick={() => handleVerifyReport(r.id, 'Verified')}>Verify</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleVerifyReport(r.id, 'Rejected')}>Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="card">
            <h4 className="mb-4">Match Verifications</h4>
            <table className="table">
              <thead><tr><th>Case</th><th>Score</th><th>Risk</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {matches.map(m => (
                  <tr key={m.id}>
                    <td>Case #{m.id.substring(0,8).toUpperCase()}</td><td><strong>{m.match_score}%</strong></td><td><span className={`badge ${m.risk_level === 'Low' ? 'badge-success' : 'badge-error'}`}>{m.risk_level}</span></td>
                    <td><span className="text-xs">{m.status}</span></td>
                    <td>
                        {m.approval?.hospital_decision === 'Pending' ? (
                          <button className="btn btn-sm btn-primary" onClick={() => { setModalMatch(m); setDecision({ decision: 'Approved', reason: '' }); }}>Review</button>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
                            <span className={`badge ${m.approval?.hospital_decision === 'Approved' ? 'badge-success' : 'badge-error'}`}>{m.approval?.hospital_decision}</span>
                            {m.approval?.hospital_decision === 'Approved' && m.status !== 'Completed' && m.status !== 'Rejected' && (
                               <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                 {m.status === 'Hospital Approved' && <button className="btn btn-sm btn-outline" onClick={() => handleUpdateMatchStatus(m.id, 'In Progress')}>In Progress</button>}
                                 {m.status === 'In Progress' && <button className="btn btn-sm btn-success" onClick={() => handleUpdateMatchStatus(m.id, 'Completed')}>Completed</button>}
                               </div>
                            )}
                          </div>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'transplants' && (
          <div className="card">
            <h4 className="mb-4">Surgery History (Completed)</h4>
            <table className="table">
              <thead><tr><th>ID</th><th>Donor</th><th>Recipient</th><th>Score</th><th>Date</th></tr></thead>
              <tbody>
                {transplants.map(t => (
                  <tr key={t.id}>
                    <td>#{t.id.substring(0,8).toUpperCase()}</td><td><strong>{t.donor_name}</strong></td><td><strong>{t.recipient_name}</strong></td>
                    <td><span className="badge badge-success">{t.match_score}%</span></td>
                    <td>{new Date(t.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {transplants.length === 0 && <tr><td colSpan="5" className="text-center text-muted"><p style={{padding: '2rem'}}>No completed transplants found yet.</p></td></tr>}
              </tbody>
            </table>
          </div>
        )}

        <Modal isOpen={!!modalMatch} onClose={() => setModalMatch(null)} title={`Match Review Case #${modalMatch?.id.substring(0,8).toUpperCase()}`}>
          {modalMatch && (
            <div>
              <div className="card" style={{ background: '#f9fafb', padding: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)' }}>{modalMatch.match_score}%</div>
                <p className="text-xs uppercase font-bold text-muted">Compatibility Index</p>
              </div>
              <div className="form-group mb-4">
                <label className="font-bold">Clinical Verdict</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                   <button className={`btn ${decision.decision === 'Approved' ? 'btn-success' : 'btn-outline'}`} onClick={() => setDecision({...decision, decision: 'Approved'})}>Approve</button>
                   <button className={`btn ${decision.decision === 'Rejected' ? 'btn-danger' : 'btn-outline'}`} onClick={() => setDecision({...decision, decision: 'Rejected'})}>Reject</button>
                </div>
              </div>
              <textarea className="form-control" rows={4} placeholder="Audit notes..." value={decision.reason} onChange={e => setDecision({ ...decision, reason: e.target.value })} />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1.5rem' }}>
                 <button className="btn btn-outline" onClick={() => handleDownloadReport(modalMatch.id)}>Download Report</button>
                 <button className="btn btn-primary" style={{ flex: 1 }} disabled={processing} onClick={handleMatchDecision}>{processing ? 'Saving...' : 'Submit Decision'}</button>
              </div>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
}

function HospitalRegisterForm({ onSuccess }) {
  const [form, setForm] = useState({ name: '', location: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await api.post('/hospital/register', form); onSuccess(); }
    catch (err) { setError(err.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };
  return (
    <div style={{ maxWidth: '480px', margin: '4rem auto' }}>
      <div className="card">
        <h3>Register Hospital</h3>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Name</label><input className="form-control" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-group"><label>Location</label><input className="form-control" required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>{loading ? 'Registering...' : 'Submit'}</button>
        </form>
      </div>
    </div>
  );
}
