import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import './Courses.css';

const Courses = () => {
    const { courses, loading, enrollCourse } = useCourses();
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleStartStudy = async (courseId) => {
        if (!user) {
            navigate('/login');
            return;
        }
        await enrollCourse(courseId);
        navigate(`/course/${courseId}`);
    };

    if (loading) {
        return <div className="courses-page"><div className="loading"><div className="loading-spinner"></div></div></div>;
    }

    return (
        <div className="courses-page">
            <header className="courses-header">
                <h1>Bible Courses</h1>
                <p>Explore our collection of spiritual studies designed to help you grow.</p>
            </header>

            <div className="courses-grid">
                {courses.length === 0 ? (
                    <p className="no-courses">No courses available yet. Check back soon!</p>
                ) : (
                    courses.map(course => (
                        <div className="course-card" key={course._id}>
                            <div className="course-card-header">
                                <h3>{course.title}</h3>
                            </div>
                            <div className="course-card-content">
                                <div className="course-meta">
                                    <span>📖 {course.lessons?.length || 0} Lessons</span>
                                </div>
                            </div>
                            <div className="course-card-footer">
                                <button
                                    onClick={() => handleStartStudy(course._id)}
                                    className="btn-explore"
                                    style={{ border: 'none', cursor: 'pointer', fontSize: '1rem', fontFamily: 'inherit' }}
                                >
                                    Start Study
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div >
    );
};

export default Courses;
