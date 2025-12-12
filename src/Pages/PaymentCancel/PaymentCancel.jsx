import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentCancel.css';

const PaymentCancel = () => {
    const navigate = useNavigate();

    return (
        <div className="payment-cancel-container">
            <div className="cancel-card">
                <div className="cancel-icon">❌</div>
                <h1>Payment Cancelled</h1>
                <p>Your payment process was cancelled. No charges were made.</p>
                <button className="back-btn" onClick={() => navigate('/premium')}>Try Again</button>
            </div>
        </div>
    );
};

export default PaymentCancel;
