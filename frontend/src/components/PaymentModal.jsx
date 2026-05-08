import { useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

export default function PaymentModal({ isOpen, onClose, onSuccess, amount = 5000, purpose = 'Hospital Registration Fee', match_id = null }) {
    const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '', name: '' });
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handlePay = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError('');

        try {
            // 1. Create order
            const orderRes = await api.post('/payment/create-order', { amount });
            const { order_id, key_id, amount: orderAmount, currency } = orderRes.data;

            // 2. Load Razorpay Script if not loaded
            const loadScript = () => new Promise((resolve) => {
                if (window.Razorpay) return resolve(true);
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => resolve(true);
                script.onerror = () => resolve(false);
                document.body.appendChild(script);
            });

            const scriptLoaded = await loadScript();
            if (!scriptLoaded) throw new Error("Failed to load Razorpay SDK. Check your connection.");

            // 3. Open Razorpay Checkout
            const options = {
                key: key_id,
                amount: orderAmount,
                currency: currency,
                name: "OrganMatch",
                description: purpose,
                order_id: order_id,
                handler: async function (response) {
                    try {
                        setProcessing(true);
                        // 4. Verify Payment on Backend
                        const verifyRes = await api.post('/payment/verify', {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            amount,
                            purpose,
                            match_id
                        });
                        
                        toast.success('🎉 Payment Successful! Transaction ID: ' + verifyRes.data.transaction_id);
                        onSuccess();
                        onClose();
                    } catch (err) {
                        toast.error(err.response?.data?.error || 'Payment verification failed.');
                        setProcessing(false);
                    }
                },
                theme: {
                    color: "#FF2B51"
                },
                modal: {
                    ondismiss: function() {
                        setProcessing(false);
                    }
                }
            };
            
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response){
                setError(response.error.description || 'Payment failed.');
                setProcessing(false);
            });
            rzp.open();

        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Error initializing payment.');
            setProcessing(false);
        }
    };

    return createPortal(
        <div className="payment-overlay">
            <div className="payment-modal-box">
                <button className="payment-close-btn" onClick={onClose}>&times;</button>

                <div className="payment-header-red">
                    <div className="header-top">
                        <div className="chip-gold"></div>
                        <span className="purpose-badge-white">{purpose}</span>
                    </div>
                    <div className="header-bottom">
                        <h2 className="payment-amt-white">₹{amount.toLocaleString()}</h2>
                        <p className="secure-tag-white">Secure Gateway Processing</p>
                    </div>
                </div>

                <div className="payment-body-compact">
                    <div>
                        {error && <div className="payment-error-red">{error}</div>}

                        <div style={{ marginBottom: '20px', textAlign: 'center', color: '#7f8c8d', fontSize: '0.9rem', fontWeight: '500' }}>
                            You will be redirected to the secure Razorpay payment gateway to complete your transaction via UPI, Cards, or NetBanking.
                        </div>

                        <button type="button" onClick={handlePay} className="pay-btn-red" disabled={processing}>
                            {processing ? (
                                <div className="loader-container">
                                    <div className="payment-white-spinner"></div>
                                    <span>Processing...</span>
                                </div>
                            ) : `Proceed to Pay ₹${amount.toLocaleString()}`}
                        </button>
                    </div>
                    <div className="payment-footer-mini">
                        <span>🛡️ Secured</span>
                        <span>💳 MasterCard/Visa</span>
                    </div>
                </div>
            </div>

            <style>{`
                .payment-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.5);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.4s ease;
                }
                .payment-modal-box {
                    background: #ffffff;
                    width: 100%;
                    max-width: 400px;
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 40px 60px -15px rgba(0, 0, 0, 0.3);
                    position: relative;
                    animation: popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes popIn { from { transform: scale(0.9) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }

                .payment-close-btn {
                    position: absolute;
                    top: 12px; right: 15px;
                    background: rgba(255,255,255,0.2);
                    border: none;
                    width: 28px; height: 28px;
                    border-radius: 50%;
                    cursor: pointer;
                    color: white; font-size: 18px;
                    display: flex; align-items: center; justify-content: center;
                    z-index: 10; transition: background 0.2s;
                }
                .payment-close-btn:hover { background: rgba(255,255,255,0.4); }

                .payment-header-red {
                    background: linear-gradient(135deg, #FF2B51 0%, #E61E42 100%);
                    color: white;
                    padding: 25px 25px 20px 25px;
                    position: relative;
                }
                .header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
                .chip-gold {
                    width: 35px; height: 26px;
                    background: linear-gradient(135deg, #f3d47a 0%, #cf9c34 100%);
                    border-radius: 4px;
                }
                .purpose-badge-white {
                    background: rgba(255,255,255,0.15);
                    padding: 3px 10px;
                    border-radius: 12px;
                    font-size: 0.65rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 700;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .payment-amt-white { 
                    font-size: 2.2rem; margin: 0; font-weight: 800; 
                    line-height: 1.1; color: #ffffff;
                    text-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .secure-tag-white { font-size: 0.7rem; opacity: 0.9; margin-top: 4px; font-weight: 500; }

                .payment-body-compact { padding: 20px 25px 15px 25px; }
                .payment-error-red {
                    background: #fee2e2; color: #dc2626;
                    padding: 8px 12px; border-radius: 8px;
                    margin-bottom: 15px; font-size: 0.8rem;
                    border-left: 3px solid #dc2626;
                    font-weight: 600;
                }

                .input-field-compact { margin-bottom: 12px; }
                .input-field-compact label { display: block; font-size: 0.6rem; font-weight: 800; color: #7f8c8d; margin-bottom: 4px; letter-spacing: 0.8px; }
                .input-field-compact input {
                    width: 100%; padding: 10px 14px;
                    border: 1.5px solid #ecf0f1; border-radius: 10px;
                    font-size: 0.95rem; transition: all 0.2s;
                    box-sizing: border-box; outline: none;
                    background: #fdfdfd;
                }
                .input-field-compact input:focus { border-color: #FF2B51; background: #ffffff; box-shadow: 0 0 0 3px rgba(255,43,81,0.05); }

                .input-row-compact { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

                .pay-btn-red {
                    width: 100%; padding: 12px;
                    background: #FF2B51; color: white;
                    border: none; border-radius: 12px;
                    font-size: 1rem; font-weight: 700;
                    margin-top: 5px; cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 8px 20px rgba(255, 43, 81, 0.25);
                }
                .pay-btn-red:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(255, 43, 81, 0.35); }
                .pay-btn-red:disabled { opacity: 0.7; cursor: not-allowed; }

                .loader-container { display: flex; align-items: center; justify-content: center; gap: 8px; }
                .payment-white-spinner {
                    width: 16px; height: 16px;
                    border: 2px solid rgba(255,255,255,0.4);
                    border-top-color: white; border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                .payment-footer-mini {
                    display: flex; justify-content: space-between;
                    margin-top: 15px; padding-top: 12px;
                    border-top: 1px solid #f1f4f5;
                    font-size: 0.65rem; color: #95a5a6; font-weight: 700;
                    text-transform: uppercase;
                }
            `}</style>
        </div>,
        document.body
    );
}
