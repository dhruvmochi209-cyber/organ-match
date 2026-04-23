import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const ORGANS = ['Kidney', 'Liver', 'Heart', 'Lung', 'Pancreas', 'Cornea', 'Bone Marrow'];

export default function DonorForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [form, setForm] = useState({ full_name: '', blood_type: 'O+', age: '', organ_to_donate: 'Kidney', medical_history: '', location: '', hospital_id: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existing, setExisting] = useState(false);
  
  // New States for Mandatory Upload
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [reportStatus, setReportStatus] = useState(null); // 'pending', 'success', 'failed'

  useEffect(() => {
    api.get('/hospital/all').then(r => setHospitals(r.data)).catch(() => {});
    api.get('/donor/profile').then(r => {
      if (r.data) { 
        setForm(r.data); 
        setExisting(true); 
        setReportStatus('success'); // Already verified if profile exists
      }
    }).catch(() => {});
  }, []);

  const handleFileUpload = async () => {
    if (!file) return setError('Please select a file first.');
    setUploading(true);
    setError('');
    
    const fd = new FormData();
    fd.append('file', file);
    fd.append('organ', form.organ_to_donate); // Pass selected organ for validation

    try {
      const res = await api.post('/donor/upload-report', fd, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      setReportStatus('success');
      setFile(null);
    } catch (err) {
      setReportStatus('failed');
      setError(err.response?.data?.error || 'Verification failed. Please check the PDF content.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    if (reportStatus !== 'success') return setError('You must upload and verify your medical report first!');
    
    setError(''); 
    setLoading(true);
    try {
      await api.post('/donor/register', form);
      navigate('/donor');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile.');
    } finally { setLoading(false); }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <div>
            <h1 style={{ color: 'var(--primary)' }}>{existing ? 'Clinical Profile' : 'Donor Registration'}</h1>
            <p className="text-muted">Step 1: Bio-medical Information & Profile Creation</p>
          </div>
        </div>

        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div className="card">
            <h4 className="mb-4">Patient Information</h4>
            {error && <div className="alert alert-error mb-4" style={{ fontSize: '0.875rem' }}>{error}</div>}
            {existing && (
              <div className="alert alert-warning mb-4" style={{ background: '#fffbeb', border: '1px solid #fcd34d', color: '#92400e' }}>
                🛡️ Profile locked for medical integrity. Contact clinical support for updates.
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
                  <input type="number" className="form-control" required disabled={existing} min={18} max={70} 
                    value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} placeholder="18–70" />
                </div>
                <div className="form-group">
                  <label>Blood Group</label>
                  <select className="form-control" disabled={existing} value={form.blood_type} 
                    onChange={e => setForm({ ...form, blood_type: e.target.value })}>
                    {BLOOD_TYPES.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Organ for Donation</label>
                  <select className="form-control" disabled={existing} value={form.organ_to_donate} 
                    onChange={e => {
                      setForm({ ...form, organ_to_donate: e.target.value });
                      setReportStatus(null);
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
                  <label>Preferred Hospital Node</label>
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
                      onChange={e => setForm({ ...form, weight: e.target.value })} placeholder="e.g. 70" />
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
                <label>Summary of Medical History</label>
                <textarea className="form-control" rows={4} required disabled={existing} value={form.medical_history} 
                  onChange={e => setForm({ ...form, medical_history: e.target.value })} 
                  placeholder="Include chronic conditions, previous surgeries, or regular medications..." />
              </div>

              <div className="form-group" style={{ margin: '1.5rem 0' }}>
                 <label className="flex items-center" style={{ display: 'flex', gap: '0.75rem', cursor: 'pointer', background: 'var(--bg-main)', padding: '1rem', borderRadius: '12px' }}>
                    <input type="checkbox" required disabled={existing} defaultChecked={existing} style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }} />
                    <span className="text-sm">I certify that all medical and biological information is accurate, and I provide my legal consent for organ donation clinical review.</span>
                 </label>
              </div>

              {!existing && (
                <button type="submit" className="btn btn-primary w-full py-4 mt-2" disabled={loading || reportStatus !== 'success'}>
                  {loading ? 'Processing...' : 'Complete Registration'}
                </button>
              )}
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className={`card ${reportStatus === 'success' ? 'bg-success-light' : ''}`} style={{ border: reportStatus === 'success' ? '1px solid var(--secondary)' : '1px dashed var(--border-color)' }}>
              <div className="flex justify-between items-center mb-4">
                 <h4 style={{ margin: 0 }}>Laboratory Report</h4>
                 {reportStatus === 'success' && <span className="badge badge-success">Verified</span>}
              </div>
              
              <p className="text-sm text-muted mb-4">
                Clinical requirement: Upload a digital copy of your latest medical screening (PDF). 
                The system will automatically verify the report matches your selected organ: <strong>{form.organ_to_donate}</strong>.
              </p>

              {!existing && (
                <div style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📄</div>
                  <input type="file" id="report-upload" accept=".pdf" style={{ display: 'none' }} 
                    onChange={e => setFile(e.target.files[0])} disabled={uploading || reportStatus === 'success'} />
                  
                  {!file && reportStatus !== 'success' && (
                    <label htmlFor="report-upload" className="btn btn-outline" style={{ cursor: 'pointer' }}>
                       Select Medical PDF
                    </label>
                  )}

                  {file && reportStatus !== 'success' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                      <span className="text-xs font-semibold">{file.name}</span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="button" className="btn btn-primary btn-sm" onClick={handleFileUpload} disabled={uploading}>
                          {uploading ? 'Analyzing Report...' : 'Verify Document'}
                        </button>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setFile(null)} disabled={uploading}>
                          Remove
                        </button>
                      </div>
                    </div>
                  )}

                  {reportStatus === 'success' && (
                    <div className="text-success font-bold">
                       Medical Verification Complete
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="card" style={{ background: 'var(--primary)', color: 'white' }}>
               <h5 style={{ color: 'white' }}>📋 Compliance Note</h5>
               <p style={{ fontSize: '0.8rem', opacity: 0.9, lineHeight: 1.5 }}>
                 All information is protected under national medical data guidelines. 
                 By registering, you agree to hospital staff reviewing your medical background.
               </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
