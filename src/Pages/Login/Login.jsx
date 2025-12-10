import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
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

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                try {
                                    setIsLoading(true);
                                    // Pass tokens as 'token' expecting backend logic `req.body`
                                    const result = await login({ googleToken: credentialResponse.credential });
                                    if (result.success) {
                                        navigate('/profile');
                                    } else {
                                        setError(result.message || 'Google Sign-In failed.');
                                    }
                                } catch (err) {
                                    console.error("Google Login Error:", err);
                                    setError('Google Sign-In error.');
                                } finally {
                                    setIsLoading(false);
                                }
                            }}
                            onError={() => {
                                setError('Google Sign-In failed.');
                            }}
                            useOneTap
                            theme="filled_blue"
                            shape="pill"
                            text="signin_with"
                        />
                    </div>

                    <div className="divider" style={{ textAlign: 'center', margin: '0 0 1.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                        <span>OR</span>
                    </div>
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
