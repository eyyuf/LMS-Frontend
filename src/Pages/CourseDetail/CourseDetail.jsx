import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import './CourseDetail.css';

const CourseDetail = () => {
    const { courseId } = useParams();
    const { enrollCourse, isLessonCompleted } = useCourses();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            if (!user?._id) {
                setLoading(false);
                return;
            }
            try {
                // Backend routes are GET - auth middleware sets req.body.userId from token cookie
                const courseRes = await api.get(`/lessons/getCourse/${courseId}`);
                if (courseRes.data.success) {
                    setCourse(courseRes.data.course);

                    // Check if enrolled
                    const enrolledRes = await api.get('/lessons/getEnrolledCourses');
                    if (enrolledRes.data.success) {
                        const enrolled = enrolledRes.data.courses.some(c => c._id === courseId);
                        setIsEnrolled(enrolled);
                    }

                    // Fetch lessons
                    const lessonsRes = await api.get(`/lessons/getLessonByCourse/${courseId}`);
                    if (lessonsRes.data.success) {
                        const sortedLessons = (lessonsRes.data.lesson || []).sort((a, b) => a.order - b.order);
                        setLessons(sortedLessons);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch course:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId, user]);

    const handleEnroll = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        const result = await enrollCourse(courseId);
        if (result.success) {
            setIsEnrolled(true);
        }
    };

    if (loading) {
        return <div className="detail-container"><div className="loading"><div className="loading-spinner"></div></div></div>;
    }

    if (!course) {
        return <div className="detail-container"><h2>Course not found</h2></div>;
    }

    return (
        <div className="detail-container">
            <div className="course-hero">
                <h1>{course.title}</h1>

            </div>

            <div className="lessons-list">
                <h2>Lessons ({lessons.length})</h2>
                {lessons.length === 0 ? (
                    <p className="no-lessons">No lessons available yet. Check back soon!</p>
                ) : (
                    lessons.map((lesson, index) => {
                        const completed = isLessonCompleted(lesson._id);
                        return (
                            <div className="lesson-row" key={lesson._id}>
                                <div className="lesson-index">{index + 1}</div>
                                <div className="lesson-info">
                                    <h3>{lesson.title}</h3>
                                    {completed && <span className="badge-completed">✓ Completed</span>}
                                </div>
                                <Link to={`/course/${courseId}/lesson/${lesson._id}`} className="btn-read">
                                    Read Lesson
                                </Link>
                            </div>
                        );
                    })
                )}
            </div>

            {isEnrolled && lessons.length > 0 && (
                <div className="quiz-section">
                    <Link to={`/course/${courseId}/quiz`} className="btn-quiz">
                        Take Quiz
                    </Link>
                </div>
            )}

            <div className="back-link">
                <Link to="/courses">← Back to Courses</Link>
            </div>
        </div>
    );
};

export default CourseDetail;
