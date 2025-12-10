import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!formData.email || !formData.password) {
            setError('Please fill in all fields.');
            setIsLoading(false);
            return;
        }

        const credentials = {
            email: formData.email,
            password: formData.password
        };

        const result = await login(credentials);

        if (result.success) {
            navigate('/profile');
        } else {
            setError(result.message || 'Login failed.');
        }

        setIsLoading(false);
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <h2>Welcome Back</h2>
                <p className="login-subtitle">Please sign in to continue your learning journey.</p>

                {error && (
                    <div className="error-message">
                        {error}
                        {(error === 'Please verify your account' || error.includes('verify')) && (
                            <button
                                type="button"
                                className="btn-verify-redirect"
                                onClick={() => navigate('/verify-account', { state: { email: formData.email } })}
                            >
                                Verify Account
                            </button>
                        )}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <span
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? "Hide" : "Show"}
                        </span>
                    </div>

                    <div className="forgot-password-link">
                        <Link to="/forgot-password">Forgot Password?</Link>
                    </div>

                    <button type="submit" disabled={isLoading} className={isLoading ? 'btn-loading' : ''}>
                        {isLoading ? 'Signing in...' : 'Login'}
                    </button>
                </form>

                <p className="footer-text">
                    Don't have an account? <Link to="/signup" className="link">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
