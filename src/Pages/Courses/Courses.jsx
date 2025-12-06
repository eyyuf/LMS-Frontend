import React from 'react';
import { Link } from 'react-router-dom';
import { useCourses } from '../../context/CourseContext';
import './Courses.css';

const Courses = () => {
    const { courses } = useCourses();

    return (
        <div className="courses-page">
            <header className="courses-header">
                <h1>Bible Courses</h1>
                <p>Explore our collection of spiritual studies designed to help you grow.</p>
            </header>

            <div className="courses-grid">
                {courses.map(course => (
                    <div className="course-card" key={course.id}>
                        <div className="course-card-content">
                            <span className="course-cat">{course.category}</span>
                            <h3>{course.title}</h3>
                            <p>{course.description}</p>
                            <div className="course-meta">
                                <span>📖 {course.lessons.length} Lessons</span>
                            </div>
                        </div>
                        <div className="course-card-footer">
                            <Link to={`/course/${course.id}`} className="btn-explore">Start Study</Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Courses;
