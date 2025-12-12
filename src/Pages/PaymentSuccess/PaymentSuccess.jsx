import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
    const { refreshUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const syncUser = async () => {
            await refreshUser();
            setTimeout(() => {
                navigate('/premium');
            }, 3000);
        };
        syncUser();
    }, [refreshUser, navigate]);

    return (
        <div className="payment-success-container">
            <div className="success-card">
                <div className="success-icon">🎉</div>
                <h1>Payment Successful!</h1>
                <p>Welcome to Premium. Your account has been upgraded.</p>
                <p>Redirecting you back...</p>
            </div>
        </div>
    );
};

export default PaymentSuccess;
