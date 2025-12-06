import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const { sendResetPasswordOTP, resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState('email'); // 'email', 'otp', 'success'
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const result = await sendResetPasswordOTP(email);
        if (result.success) {
            setStep('otp');
        } else {
            setError(result.message || 'Failed to send OTP');
        }
        setIsLoading(false);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!otp || !newPassword) {
            setError('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        const result = await resetPassword(email, otp, newPassword);
        if (result.success) {
            setStep('success');
        } else {
            setError(result.message || 'Password reset failed');
        }
        setIsLoading(false);
    };

    return (
        <div className="forgot-wrapper">
            <div className="forgot-container">
                <h2>Reset Password</h2>

                {error && <div className="error-message">{error}</div>}

                {step === 'email' && (
                    <>
                        <p className="forgot-subtitle">
                            Enter your email address and we'll send you an OTP to reset your password.
                        </p>
                        <form onSubmit={handleSendOTP}>
                            <div className="input-group">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-reset" disabled={isLoading}>
                                {isLoading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </form>
                    </>
                )}

                {step === 'otp' && (
                    <>
                        <p className="forgot-subtitle">
                            Enter the OTP sent to <strong>{email}</strong> and your new password.
                        </p>
                        <form onSubmit={handleResetPassword}>
                            <div className="input-group">
                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-reset" disabled={isLoading}>
                                {isLoading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    </>
                )}

                {step === 'success' && (
                    <div className="success-message">
                        <div className="check-icon">✓</div>
                        <h3>Password Reset Successful!</h3>
                        <p>Your password has been reset. You can now login with your new password.</p>
                        <Link to="/login" className="btn-reset">Go to Login</Link>
                    </div>
                )}

                <div className="back-to-login">
                    <Link to="/login">← Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
