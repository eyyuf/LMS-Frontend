import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // clear error on type
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            if (formData.username && formData.password) {
                // Here you would normally validate against a backend
                console.log("Logged in:", formData.username);
                // Integrate AuthContext login
                login({ email: formData.username + '@example.com' });

                setIsLoading(false);
                // Simple role check simulation
                if (formData.username.toLowerCase().includes('admin')) {
                    navigate('/admin');
                } else {
                    navigate('/profile');
                }
            } else {
                setError('Please fill in all fields.');
                setIsLoading(false);
            }
        }, 1000);
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <h2>Welcome Back</h2>
                <p className="login-subtitle">Please sign in to continue your learning journey.</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
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

                    <button type="submit" disabled={isLoading} className={isLoading ? 'loading' : ''}>
                        {isLoading ? 'Signing in...' : 'Login'}
                    </button>
                </form>

                <p className="footer-text">
                    Don't have an account? <Link to="/signup" className="link">Sign Up</Link>
                </p>
                <p className="hint-text">Try 'admin' as username for Admin Panel access.</p>
            </div>
        </div>
    );
};

export default Login;
