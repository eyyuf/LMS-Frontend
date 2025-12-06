import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import './Navbar.css';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { language, toggleLanguage, t } = useLanguage();
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
                    <Link to="/" className={`nav-item ${isActive('/')}`}>{t.home}</Link>
                    <Link to="/courses" className={`nav-item ${isActive('/courses')}`}>{t.courses}</Link>

                    {user ? (
                        <>
                            <Link to="/profile" className={`nav-item ${isActive('/profile')}`}>{t.profile}</Link>
                            <Link to="/admin" className={`nav-item ${isActive('/admin')}`}>{t.admin}</Link>
                            {/* Greeting removed as per previous user edit */}
                            <button onClick={handleLogout} className="nav-btn logout-btn">{t.logout}</button>
                        </>
                    ) : (
                        <Link to="/login" className="nav-btn">{t.login}</Link>
                    )}

                    <button className="lang-switch-btn" onClick={toggleLanguage}>
                        {language === 'en' ? '🇺🇸 EN' : '🇪🇹 AM'}
                    </button>
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
