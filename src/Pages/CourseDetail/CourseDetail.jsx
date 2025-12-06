import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCourses } from '../../context/CourseContext';
import './CourseDetail.css';

const CourseDetail = () => {
    const { courseId } = useParams();
    const { courses } = useCourses();
    const course = courses.find(c => c.id === parseInt(courseId));

    if (!course) {
        return <div className="detail-container"><h2>Course not found</h2></div>;
    }

    return (
        <div className="detail-container">
            <div className="course-hero">
                <span className="detail-cat">{course.category}</span>
                <h1>{course.title}</h1>
                <p>{course.description}</p>
            </div>

            <div className="lessons-list">
                <h2>Lessons ({course.lessons.length})</h2>
                {course.lessons.length === 0 ? (
                    <p className="no-lessons">No lessons available yet. Check back soon!</p>
                ) : (
                    course.lessons.map((lesson, index) => (
                        <div className="lesson-row" key={lesson.id}>
                            <div className="lesson-index">{index + 1}</div>
                            <div className="lesson-info">
                                <h3>{lesson.title}</h3>
                                <span className="scripture-badge">{lesson.scripture}</span>
                            </div>
                            <Link to={`/course/${course.id}/lesson/${lesson.id}`} className="btn-read">
                                Read Lesson
                            </Link>
                        </div>
                    ))
                )}
            </div>

            <div className="back-link">
                <Link to="/courses">← Back to Courses</Link>
            </div>
        </div>
    );
};

export default CourseDetail;
