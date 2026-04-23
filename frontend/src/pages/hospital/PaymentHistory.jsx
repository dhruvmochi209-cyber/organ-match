import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';

export default function PaymentHistory() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/payment/history')
            .then(res => setPayments(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <div className="topbar">
                    <h1 style={{ color: 'var(--primary)' }}>Payment History</h1>
                    <p className="text-muted">View all your transactions and registration fees.</p>
                </div>

                <div className="card">
                    {loading ? (
                        <div className="loading-spinner"><div className="spinner"></div></div>
                    ) : payments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧾</div>
                            <h3>No transactions found</h3>
                            <p className="text-muted">You haven't made any payments yet.</p>
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Transaction ID</th>
                                    <th>Purpose</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map(p => (
                                    <tr key={p.id}>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.transaction_id}</td>
                                        <td><strong>{p.purpose}</strong></td>
                                        <td>₹{p.amount.toLocaleString()}</td>
                                        <td><span className="badge badge-success">{p.status}</span></td>
                                        <td>{new Date(p.created_at).toLocaleDateString()} {new Date(p.created_at).toLocaleTimeString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
}
