import React from 'react';
import { Link } from 'react-router-dom';
import { useCourses } from '../../context/CourseContext';
import './Home.css';
import heroImg from '../../assets/hero_illustration_v2.png';

const Home = () => {
    const { courses, loading } = useCourses();

    return (
        <div className="home-container">
            {/* Faith-based Hero Section */}
            <section className="hero-wrapper">
                <div className="hero-content">
                    <div className="hero-badge">
                        <span>🕊️ Spiritual Growth</span>
                    </div>
                    <h1 className="hero-title">
                        Deepen Your Walk with <span className="brand-highlight">God</span>
                    </h1>
                    <p className="hero-description">
                        A peaceful space to study the Bible, reflect on scripture,
                        and grow in faith alongside your fellowship community.
                    </p>

                    <div className="hero-buttons">
                        <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
                    </div>

                    <div className="hero-stats">
                        <div className="stat-item">
                            <span className="stat-number">{courses.length}</span>
                            <span className="stat-label">Bible Studies</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-number">100+</span>
                            <span className="stat-label">Fellowship Members</span>
                        </div>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="visual-circle"></div>
                    <img src={heroImg} alt="Bible Study Illustration" className="hero-img" />
                </div>
            </section>

            {/* Courses Section */}
            <section className="features-wrapper">
                <div className="section-header">
                    <h2>Recent Bible Studies</h2>
                    <p>Start a new journey through the scriptures today.</p>
                </div>

                {loading ? (
                    <div className="loading">Loading courses...</div>
                ) : (
                    <div className="features-grid">
                        {courses.slice(0, 3).map(course => (
                            <div className="feature-card" key={course._id}>
                                <div className="feature-icon icon-1">✝️</div>
                                <h3>{course.title}</h3>
                                <Link to={`/course/${course._id}`} className="btn-link">Explore Course →</Link>
                            </div>
                        ))}
                        {courses.length === 0 && <p>No courses available yet.</p>}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;
