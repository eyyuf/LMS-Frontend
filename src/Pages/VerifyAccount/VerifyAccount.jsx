import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './VerifyAccount.css';

const VerifyAccount = () => {
    const navigate = useNavigate();
    const { verifyOTP, sendVerificationOTP, logout, user } = useAuth();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    const inputRefs = useRef([]);

    // Initial check
    useEffect(() => {
        if (user && user.IsAccVerified) {
            navigate('/profile');
        }
    }, [user, navigate]);

    // Cleanup refs array size
    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, 6);
    }, []);

    // Timer logic for resend button
    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    // Inactivity Timeout: Logout after 10 minutes if not verified
    useEffect(() => {
        const timeout = setTimeout(async () => {
            alert("Verification session expired. Please log in again.");
            await logout();
        }, 3 * 60 * 1000); // 3 minutes

        return () => clearTimeout(timeout);
    }, [logout]);

    const handleChange = (index, value) => {
        // Allow only numbers
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1); // Take last char
        setOtp(newOtp);

        // Move to next input
        if (value && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Move to previous input on backspace if empty
        if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').slice(0, 6).split('');
        if (data.length > 0) {
            const newOtp = [...otp];
            data.forEach((char, index) => {
                if (index < 6 && !isNaN(char)) newOtp[index] = char;
            });
            setOtp(newOtp);
            // Focus last filled
            const focusIndex = Math.min(data.length, 5); // 0-5
            if (inputRefs.current[focusIndex]) {
                inputRefs.current[focusIndex].focus();
            }
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        const otpString = otp.join('').trim();
        if (otpString.length !== 6) {
            setError('Please enter the complete 6-digit code.');
            setIsLoading(false);
            return;
        }

        const userId = user?._id;
        const result = await verifyOTP(userId, otpString);

        if (result.success) {
            navigate('/profile');
        } else {
            setError(result.message || 'Verification failed. Please try again.');
        }

        setIsLoading(false);
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;

        setIsLoading(true);
        setError('');
        setMessage('');

        const result = await sendVerificationOTP();

        if (result.success) {
            setMessage('Verification code sent successfully!');
            setResendTimer(60);
        } else {
            setError(result.message || 'Failed to send new code.');
        }
        setIsLoading(false);
    };

    return (
        <div className="verify-container">
            <div className="verify-box">
                <h2>Verify Your Account</h2>
                <p className="verify-subtitle">
                    We've sent a verification code to your email.
                    Please enter it below to verify your account.
                </p>

                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message" style={{ color: 'var(--success-color)', marginBottom: '1rem' }}>{message}</div>}

                <form onSubmit={handleVerify}>
                    <div className="otp-input-container">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                className="otp-box"
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                maxLength={1}
                                required={index === 0 && otp.join('').length === 0}
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`verify-btn ${isLoading ? 'loading' : ''}`}
                    >
                        {isLoading ? 'Verifying...' : 'Verify Account'}
                    </button>
                </form>

                <div className="resend-text">
                    Didn't receive the code?{' '}
                    <button
                        onClick={handleResend}
                        className="resend-link"
                        disabled={resendTimer > 0 || isLoading}
                    >
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                    </button>
                </div>

                <div className="verify-footer" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                    {user?.email && (
                        <p style={{ fontSize: '13px', color: '#777', marginBottom: '10px' }}>
                            Verifying email: <strong>{user.email}</strong>
                        </p>
                    )}
                    <button
                        onClick={() => logout()}
                        className="btn-logout-verify"
                        style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}
                    >
                        Logout / Switch Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyAccount;
