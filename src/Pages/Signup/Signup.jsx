import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../Login/Login.css'; // Reusing Login styles for consistency

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            console.log("Registered:", formData);
            setIsLoading(false);
            // Redirect to Login after 'successful' signup
            navigate('/login');
        }, 1200);
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <h2>Create Account</h2>
                <p className="login-subtitle">Join CozyLMS to start learning today.</p>

                <form onSubmit={handleSignup}>
                    <div className="input-group">
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
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
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" disabled={isLoading} className={isLoading ? 'loading' : ''}>
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="footer-text">
                    Already have an account? <Link to="/login" className="link">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
