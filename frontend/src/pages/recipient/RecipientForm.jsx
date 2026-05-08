import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const ORGANS = ['Kidney', 'Liver', 'Heart', 'Lung', 'Pancreas', 'Cornea', 'Bone Marrow'];

const ORGAN_REPORTS = {
  Kidney: ['KFT Report', 'Ultrasound KUB', 'Viral Markers', 'Blood Routine'],
  Liver: ['LFT Report', 'Ultrasound Abdomen', 'Viral Markers', 'ECG'],
  Heart: ['ECG', 'Echocardiogram', 'Chest X-Ray', 'Viral Markers'],
  Lung: ['PFT', 'Chest X-Ray', 'Viral Markers', 'Blood Routine'],
  Pancreas: ['Amylase & Lipase', 'Ultrasound', 'Viral Markers', 'Blood Routine'],
  Cornea: ['Eye Exam', 'Viral Markers', 'Blood Routine', 'General Fitness'],
  'Bone Marrow': ['HLA Typing Full', 'CBC', 'Viral Markers', 'General Fitness'],
  default: ['Blood Test', 'Scan', 'Viral Markers', 'General Fitness']
};

export default function RecipientForm() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [form, setForm] = useState({ full_name: '', blood_type: 'O+', age: '', organ_needed: 'Kidney', urgency: 5, medical_history: '', location: '', hospital_id: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existing, setExisting] = useState(false);

  const requiredReports = ORGAN_REPORTS[form.organ_needed] || ORGAN_REPORTS.default;

  const [files, setFiles] = useState({});
  const [uploading, setUploading] = useState({});
  const [reportStatus, setReportStatus] = useState({});

  useEffect(() => {
    api.get('/hospital/all').then(r => setHospitals(r.data)).catch(() => {});
    api.get('/recipient/profile').then(r => {
      if (r.data) { 
        setForm(r.data); 
        setExisting(true); 
        const successState = {};
        (ORGAN_REPORTS[r.data.organ_needed] || ORGAN_REPORTS.default).forEach(rep => {
            successState[rep] = 'success';
        });
        setReportStatus(successState);
      }
    }).catch(() => {});
  }, []);

  const handleFileUpload = async (reportType) => {
    const fileToUpload = files[reportType];
    if (!fileToUpload) return setError(`Please select a file for ${reportType}.`);
    
    setUploading(prev => ({ ...prev, [reportType]: true }));
    setError('');
    
    const fd = new FormData();
    fd.append('file', fileToUpload);
    fd.append('organ', form.organ_needed);
    fd.append('report_type', reportType);

    try {
      await api.post('/recipient/upload-report', fd);
      setReportStatus(prev => ({ ...prev, [reportType]: 'success' }));
    } catch (err) {
      setReportStatus(prev => ({ ...prev, [reportType]: 'failed' }));
      setError(err.response?.data?.error || `Verification failed for ${reportType}.`);
    } finally {
      setUploading(prev => ({ ...prev, [reportType]: false }));
    }
  };
  
  const handleFileChange = (reportType, e) => {
    setFiles(prev => ({ ...prev, [reportType]: e.target.files[0] }));
    setReportStatus(prev => ({ ...prev, [reportType]: null }));
  };

  const isAllVerified = requiredReports.every(rep => reportStatus[rep] === 'success');

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    if (!isAllVerified) return setError('You must upload and verify all required clinical reports first!');
    
    setError(''); 
    setLoading(true);
    try {
      await api.post('/recipient/register', form);
      navigate('/recipient');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile.');
    } finally { setLoading(false); }
  };

  const urgencyLabel = (u) => {
    if (u >= 9) return { label: 'Critical', color: 'var(--deep-red)' };
    if (u >= 7) return { label: 'High', color: '#e65100' };
    if (u >= 5) return { label: 'Moderate', color: 'var(--brown)' };
    return { label: 'Low', color: 'var(--dark-green)' };
  };
  const urg = urgencyLabel(form.urgency);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <div>
            <h1 style={{ color: 'var(--primary)' }}>{existing ? 'Clinical Profile' : 'Transplant Application'}</h1>
            <p className="text-muted">Medical Background & Urgent Case Registration</p>
          </div>
        </div>

        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div className="card">
            <h4 className="mb-4">Recipient Information</h4>
            {error && <div className="alert alert-error mb-4" style={{ fontSize: '0.875rem' }}>{error}</div>}
            {existing && (
              <div className="alert alert-success mb-4" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' }}>
                ✅ Profile is registered and active in the national matching system.
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Full Legal Name</label>
                  <input className="form-control" required disabled={existing} value={form.full_name} 
                    onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="As per Govt. ID" />
                </div>
                <div className="form-group">
                  <label>Age (Years)</label>
                  <input type="number" className="form-control" required disabled={existing} min={1} max={100} 
                    value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Blood Group</label>
                  <select className="form-control" disabled={existing} value={form.blood_type} 
                    onChange={e => setForm({ ...form, blood_type: e.target.value })}>
                    {BLOOD_TYPES.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Organ Required</label>
                  <select className="form-control" disabled={existing} value={form.organ_needed} 
                    onChange={e => {
                      setForm({ ...form, organ_needed: e.target.value });
                      setReportStatus({});
                      setFiles({});
                    }}>
                    {ORGANS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Current Location</label>
                  <input className="form-control" required disabled={existing} value={form.location} 
                    onChange={e => setForm({ ...form, location: e.target.value })} placeholder="City, State" />
                </div>
                <div className="form-group">
                  <label>Treating Hospital</label>
                  <select className="form-control" disabled={existing} value={form.hospital_id} 
                    onChange={e => setForm({ ...form, hospital_id: e.target.value })}>
                    <option value="">Select Hospital (Optional)</option>
                    {hospitals.map(h => <option key={h.id} value={h.id}>{h.name} — {h.location}</option>)}
                  </select>
                </div>
                {/* Advanced IDs & Biometrics */}
                <div className="form-group">
                   <label>Aadhaar Card Number</label>
                   <input className="form-control" type="text" required disabled={existing} maxLength={12} minLength={12} pattern="[0-9]{12}" 
                      value={form.govt_id || ''} onChange={e => setForm({ ...form, govt_id: e.target.value })} placeholder="12-digit Aadhaar ID" />
                </div>
                <div className="form-group">
                   <label>Body Weight (Kg)</label>
                   <input type="number" className="form-control" required disabled={existing} value={form.weight || ''} 
                      onChange={e => setForm({ ...form, weight: e.target.value })} placeholder="e.g. 65" />
                </div>
              </div>

              {/* Biological Section */}
              <div style={{ background: 'var(--bg-main)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', margin: '1.5rem 0' }}>
                 <h6 className="mb-3" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>Biological Parameters (HLA Typing)</h6>
                 <div className="grid-3" style={{ gap: '1rem' }}>
                    <div className="form-group mb-0">
                       <label className="text-xs">HLA-A Marker</label>
                       <input className="form-control" required disabled={existing} value={form.hla_a || ''} 
                          onChange={e => setForm({ ...form, hla_a: e.target.value })} placeholder="e.g. A2" />
                    </div>
                    <div className="form-group mb-0">
                       <label className="text-xs">HLA-B Marker</label>
                       <input className="form-control" required disabled={existing} value={form.hla_b || ''} 
                          onChange={e => setForm({ ...form, hla_b: e.target.value })} placeholder="e.g. B8" />
                    </div>
                    <div className="form-group mb-0">
                       <label className="text-xs">HLA-DR Marker</label>
                       <input className="form-control" required disabled={existing} value={form.hla_dr || ''} 
                          onChange={e => setForm({ ...form, hla_dr: e.target.value })} placeholder="e.g. DR1" />
                    </div>
                 </div>
              </div>

              <div className="form-group">
                <label>Clinical Urgency: <strong style={{ color: urg.color, fontSize: '1.1rem' }}>{form.urgency}/10 — {urg.label}</strong></label>
                <input type="range" min={1} max={10} disabled={existing} value={form.urgency} 
                  onChange={e => setForm({ ...form, urgency: parseInt(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--danger)', marginTop: '0.75rem', height: '8px' }} />
                <div className="flex justify-between mt-1 text-xs text-muted">
                  <span>Stable</span>
                  <span>Critical</span>
                </div>
              </div>

              <div className="form-group">
                <label>Case Summary & Medical History</label>
                <textarea className="form-control" rows={4} required disabled={existing} value={form.medical_history} 
                  onChange={e => setForm({ ...form, medical_history: e.target.value })} 
                  placeholder="Describe diagnosis, current treatment, and severity..." />
              </div>

              <div className="form-group" style={{ margin: '1.5rem 0' }}>
                 <label className="flex items-center" style={{ display: 'flex', gap: '0.75rem', cursor: 'pointer', background: 'var(--bg-main)', padding: '1rem', borderRadius: '12px' }}>
                    <input type="checkbox" required disabled={existing} defaultChecked={existing} style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }} />
                    <span className="text-sm">I authorize the clinical committee to review my medical records for transplant compatibility assessment.</span>
                 </label>
              </div>

              {!existing && (
                <button type="submit" className="btn btn-primary w-full py-4 mt-2" disabled={loading || !isAllVerified}>
                  {loading ? 'Processing...' : 'Submit Application'}
                </button>
              )}
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className={`card ${isAllVerified ? 'bg-success-light' : ''}`} style={{ border: isAllVerified ? '1px solid var(--secondary)' : '1px dashed var(--border-color)' }}>
              <div className="flex justify-between items-center mb-4">
                 <h4 style={{ margin: 0 }}>Required Clinical Documents</h4>
                 {isAllVerified && <span className="badge badge-success">All Verified</span>}
              </div>
              
              <p className="text-sm text-muted mb-4">
                Required: Digital copy of latest clinical assessments (PDF). 
                We scan this to verify the required organ: <strong>{form.organ_needed}</strong>.
              </p>

              {!existing && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {requiredReports.map(reportType => (
                    <div key={reportType} style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <div className="font-semibold text-sm">{reportType}</div>
                        {reportStatus[reportType] === 'success' ? (
                            <span className="text-xs text-success font-bold">✓ Verified by AI</span>
                        ) : reportStatus[reportType] === 'failed' ? (
                            <span className="text-xs text-error font-bold">✗ Verification Failed</span>
                        ) : (
                            <span className="text-xs text-muted">Pending Upload</span>
                        )}
                      </div>
                      
                      {reportStatus[reportType] !== 'success' && (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input type="file" id={`report-${reportType.replace(/\s/g, '')}`} accept=".pdf" style={{ display: 'none' }} 
                                onChange={e => handleFileChange(reportType, e)} disabled={uploading[reportType]} />
                            
                            {!files[reportType] ? (
                                <label htmlFor={`report-${reportType.replace(/\s/g, '')}`} className="btn btn-outline btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                                    Select PDF
                                </label>
                            ) : (
                                <>
                                    <span className="text-xs truncate" style={{ maxWidth: '100px', display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={files[reportType].name}>{files[reportType].name}</span>
                                    <button type="button" className="btn btn-primary btn-sm" onClick={() => handleFileUpload(reportType)} disabled={uploading[reportType]}>
                                        {uploading[reportType] ? 'Analyzing...' : 'Verify Case'}
                                    </button>
                                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setFiles(prev => ({ ...prev, [reportType]: null }))} disabled={uploading[reportType]}>
                                        Remove
                                    </button>
                                </>
                            )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card" style={{ background: 'var(--secondary)', color: 'white' }}>
               <h5 style={{ color: 'white' }}>🤝 Match Process</h5>
               <p style={{ fontSize: '0.8rem', opacity: 0.9, lineHeight: 1.5 }}>
                 Once registered, your case will be analyzed by our AI against the national donor database. 
                 Highly compatible matches will be sent to your hospital for review.
               </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
