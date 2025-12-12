import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, refreshUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = (path) => location.pathname === path ? 'active' : '';

    // Refresh user data when route changes to keep streak updated
    useEffect(() => {
        if (user && !['/login', '/signup'].includes(location.pathname)) {
            refreshUser();
        }
    }, [location.pathname]);

    const handleLogout = () => {
        // Redundant clear to guarantee UI update
        localStorage.removeItem('cozy_user');

        // Fire API request but don't wait for it
        logout();

        // Hard redirect
        window.location.href = '/login';
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
                    <Link to="/premium" className={`nav-item ${isActive('/premium')}`} onClick={() => setIsOpen(false)}>Premium</Link>
                    <Link to="/blog" className={`nav-item ${isActive('/blog')}`} onClick={() => setIsOpen(false)}>Blog</Link>

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

                {/* Streak Display (Right side) */}
                {user && (
                    <div className="user-streak">
                        <span className="streak-icon">🔥</span>
                        <span className="streak-value">{user.streak || 0}</span>
                    </div>
                )}

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
