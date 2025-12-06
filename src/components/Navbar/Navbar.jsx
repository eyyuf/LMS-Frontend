import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = (path) => location.pathname === path ? 'active' : '';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    Fellowship<span className="logo-highlight">LMS</span>
                </Link>

                <div className={`nav-menu ${isOpen ? 'active' : ''}`}>
                    <Link to="/" className={`nav-item ${isActive('/')}`}>Home</Link>
                    <Link to="/courses" className={`nav-item ${isActive('/courses')}`}>Courses</Link>

                    {user ? (
                        <>
                            <Link to="/profile" className={`nav-item ${isActive('/profile')}`}>Profile</Link>
                            <Link to="/admin" className={`nav-item ${isActive('/admin')}`}>Admin</Link>
                            <button onClick={handleLogout} className="nav-btn logout-btn">Logout</button>
                        </>
                    ) : (
                        <Link to="/login" className="nav-btn">Login</Link>
                    )}
                </div>

                <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
