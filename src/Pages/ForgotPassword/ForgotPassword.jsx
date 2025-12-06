import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email) {
            // Simulate API call
            setTimeout(() => {
                setSubmitted(true);
            }, 1000);
        }
    };

    return (
        <div className="forgot-wrapper">
            <div className="forgot-container">
                <h2>Reset Password</h2>

                {!submitted ? (
                    <>
                        <p className="forgot-subtitle">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-reset">Send Reset Link</button>
                        </form>
                    </>
                ) : (
                    <div className="success-message">
                        <div className="check-icon">✓</div>
                        <h3>Email Sent!</h3>
                        <p>Please check your inbox at <strong>{email}</strong> for instructions to reset your password.</p>
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
