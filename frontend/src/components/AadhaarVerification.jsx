import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const AadhaarVerification = () => {
  const { user } = useAuth(); 
  const [aadhaar, setAadhaar] = useState('');
  const [loading, setLoading] = useState(false);

  // If user is already verified, show success badge
  if (user?.isAadhaarVerified) {
    return (
      <div className="card shadow-sm mb-4 border-success">
        <div className="card-body d-flex align-items-center">
          <i className="bi bi-shield-fill-check text-success fs-1 me-3"></i>
          <div>
            <h5 className="card-title text-success mb-1">Government ID Verified</h5>
            <p className="card-text mb-0 text-muted">Your Aadhaar KYC is complete.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    if (aadhaar.length !== 12) {
      toast.error('Aadhaar number must be exactly 12 digits');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:8000/api/auth/verify-aadhaar',
        { aadhaarNumber: aadhaar },
        { headers: { Authorization: `Bearer ${localStorage.getItem('organmatch_token')}` } }
      );
      toast.success(response.data.message);
      
      // Update local storage with the new user data so the UI reflects the verified status
      if (response.data.user) {
        localStorage.setItem('organmatch_user', JSON.stringify(response.data.user));
      }
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      toast.error(error.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm mb-4 border-primary">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">Verify Government ID (Aadhaar)</h5>
      </div>
      <div className="card-body">
        <p className="text-muted small mb-3">
          Verifying your Aadhaar adds a trust badge to your profile and helps prevent fraudulent requests.
        </p>
        <form onSubmit={handleVerify} className="d-flex align-items-center gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Enter 12-digit Aadhaar Number"
            value={aadhaar}
            onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
            maxLength="12"
            required
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary px-4" disabled={loading || aadhaar.length !== 12}>
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AadhaarVerification;
