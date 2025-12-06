import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import astuLogo from '../../assets/astulogo.png';
import dsLogo from '../../assets/dslogo.png';
import './Footer.css';

const Footer = () => {
    const { user } = useAuth();

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <h3>FMB<span>LS</span></h3>
                    <p>Walking in wisdom, growing in faith. A community dedicated to spiritual growth and fellowship.</p>
                </div>

                <div className="footer-links">
                    <h4>Quick Links</h4>
                    <Link to="/">Home</Link>
                    <Link to="/courses">Bible Studies</Link>
                    {user ? (
                        <Link to="/profile">My Profile</Link>
                    ) : (
                        <Link to="/login">Login</Link>
                    )}
                </div>

                <div className="footer-partners-section">
                    <h4>Our Partners</h4>
                    <div className="footer-partners">
                        <img src={astuLogo} alt="ASTU Logo" className="partner-logo" />
                        <img src={dsLogo} alt="DS Logo" className="partner-logo" />
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Christian Fellowship Platform. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
