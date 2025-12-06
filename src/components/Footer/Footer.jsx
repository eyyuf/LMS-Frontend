import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <h3>Fellowship<span>LMS</span></h3>
                    <p>Walking in wisdom, growing in faith.</p>
                </div>
                <div className="footer-links">
                    <Link to="/">Home</Link>
                    <Link to="/courses">Courses</Link>
                    <Link to="/login">Login</Link>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Christian Fellowship Platform. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
