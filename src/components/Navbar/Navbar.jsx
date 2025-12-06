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
                    FM<span className="logo-highlight">BLS</span>
                </Link>

                <div className={`nav-menu ${isOpen ? 'active' : ''}`}>
                    <Link to="/" className={`nav-item ${isActive('/')}`} onClick={() => setIsOpen(false)}>Home</Link>
                    <Link to="/courses" className={`nav-item ${isActive('/courses')}`} onClick={() => setIsOpen(false)}>Courses</Link>

                    {user ? (
                        <>
                            <Link to="/leaderboard" className={`nav-item ${isActive('/leaderboard')}`} onClick={() => setIsOpen(false)}>Leaderboard</Link>
                            <Link to="/profile" className={`nav-item ${isActive('/profile')}`} onClick={() => setIsOpen(false)}>Profile</Link>
                            {user.role === 'ADMIN' && (
                                <Link to="/admin" className={`nav-item ${isActive('/admin')}`} onClick={() => setIsOpen(false)}>Admin</Link>
                            )}
                            <button onClick={() => { handleLogout(); setIsOpen(false); }} className="nav-btn logout-btn">Logout</button>
                        </>
                    ) : (
                        <Link to="/login" className="nav-btn" onClick={() => setIsOpen(false)}>Login</Link>
                    )}
                </div>

                <div className={`hamburger ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
