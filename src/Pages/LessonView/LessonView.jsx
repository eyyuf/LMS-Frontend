import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import './LessonView.css';

const LessonView = () => {
    const { courseId, lessonId } = useParams();
    const { markLessonComplete, isLessonCompleted, completedLessons } = useCourses();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [lesson, setLesson] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            // if (!user?._id) {
            //     navigate('/login');
            //     return;
            // }
            try {
                // Backend routes are GET - auth middleware sets req.body.userId from token cookie
                const courseRes = await api.get(`/lessons/getCourse/${courseId}`);
                if (courseRes.data.success) {
                    setCourse(courseRes.data.course);
                }

                // Fetch lesson
                const lessonRes = await api.get(`/lessons/getLessons/${lessonId}`);
                if (lessonRes.data.success) {
                    setLesson(lessonRes.data.lesson);
                }

                // Fetch all lessons for navigation
                const lessonsRes = await api.get(`/lessons/getLessonByCourse/${courseId}`);
                if (lessonsRes.data.success) {
                    const sortedLessons = (lessonsRes.data.lesson || []).sort((a, b) => a.order - b.order);
                    setLessons(sortedLessons);
                }
            } catch (error) {
                console.error("Failed to fetch lesson:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [courseId, lessonId, user, navigate]);

    const [completing, setCompleting] = useState(false);
    const isCompleted = isLessonCompleted(lessonId);

    // Force re-render when completedLessons changes
    useEffect(() => {
        // This ensures component updates when completion status changes
    }, [completedLessons, lessonId]);

    const handleComplete = async () => {
        if (!isCompleted && !completing) {
            setCompleting(true);
            const result = await markLessonComplete(lessonId);
            if (result.success) {
                // State will update automatically through context
            } else {
                alert(result.message || 'Failed to mark lesson as complete');
            }
            setCompleting(false);
        }
    };

    // Prev/Next Logic
    const currentIndex = lessons.findIndex(l => l._id === lessonId);
    const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

    if (loading) {
        return <div className="lesson-view-container"><div className="loading">Loading...</div></div>;
    }

    if (!course || !lesson) {
        return <div className="lesson-view-container"><h2>Lesson not found</h2></div>;
    }

    return (
        <div className="lesson-view-container">
            <div className="lesson-header">
                <div className="lesson-breadcrumbs">
                    <Link to="/courses">Courses</Link> /
                    <Link to={`/course/${courseId}`}> {course.title}</Link> /
                    <span> {lesson.title}</span>
                </div>
                <h1>{lesson.title}</h1>

                <div className="completion-stats">
                    {isCompleted ? (
                        <span className="badge-completed">✓ Completed</span>
                    ) : (
                        <span className="badge-incomplete">In Progress</span>
                    )}
                </div>
            </div>

            <div className="lesson-content">
                {lesson.file && (
                    <div className="lesson-media-wrapper">
                        {lesson.file.toLowerCase().endsWith('.pdf') ? (
                            <a href={lesson.file} download target="_blank" rel="noopener noreferrer" className="btn-download-pdf">
                                📄 Download PDF Lesson
                            </a>
                        ) : (lesson.file.match(/\.(mp4|webm|ogg)$/i) || lesson.file.includes('/video/')) ? (
                            <div className="video-container">
                                <video controls className="lesson-video">
                                    <source src={lesson.file} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        ) : (
                            <img src={lesson.file} alt="Lesson Visual" className="lesson-image" />
                        )}
                    </div>
                )}

                <div className="lesson-text">
                    {lesson.text ? (
                        <p>{lesson.text}</p>
                    ) : (
                        <p>
                            Reflection: As you meditate on this scripture, consider how it applies to your daily walk.
                            Faith is not just belief, but action. Take a moment to pray and ask God for wisdom in this area.
                        </p>
                    )}
                </div>

                <div className="lesson-action-area">
                    <button
                        className={`btn-mark-complete ${isCompleted ? 'completed' : ''}`}
                        onClick={handleComplete}
                        disabled={isCompleted || completing}
                    >
                        {completing ? 'Completing...' : isCompleted ? 'Lesson Completed ✓' : 'Mark as Completed'}
                    </button>
                </div>
            </div>

            <div className="lesson-navigation">
                {prevLesson ? (
                    <Link to={`/course/${courseId}/lesson/${prevLesson._id}`} className="nav-btn prev">
                        ← {prevLesson.title}
                    </Link>
                ) : (
                    <div></div>
                )}

                {nextLesson ? (
                    <Link to={`/course/${courseId}/lesson/${nextLesson._id}`} className="nav-btn next">
                        {nextLesson.title} →
                    </Link>
                ) : (
                    <Link to={`/course/${courseId}`} className="nav-btn finish">
                        Finish Course
                    </Link>
                )}
            </div>
        </div>
    );
};

export default LessonView;
