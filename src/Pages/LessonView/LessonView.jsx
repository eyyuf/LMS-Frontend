import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCourses } from '../../context/CourseContext';
import './LessonView.css';

const LessonView = () => {
    const { courseId, lessonId } = useParams();
    const { courses, markLessonComplete, isLessonCompleted } = useCourses();

    const course = courses.find(c => c.id === parseInt(courseId));
    const lesson = course?.lessons.find(l => l.id === parseInt(lessonId));

    if (!course || !lesson) {
        return <div className="lesson-view-container"><h2>Lesson not found</h2></div>;
    }

    const isCompleted = isLessonCompleted(parseInt(courseId), parseInt(lessonId));

    const handleComplete = () => {
        markLessonComplete(parseInt(courseId), parseInt(lessonId));
    };

    // Prev/Next Logic
    const currentIndex = course.lessons.findIndex(l => l.id === parseInt(lessonId));
    const prevLesson = currentIndex > 0 ? course.lessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < course.lessons.length - 1 ? course.lessons[currentIndex + 1] : null;

    return (
        <div className="lesson-view-container">
            <div className="lesson-header">
                <div className="lesson-breadcrumbs">
                    <Link to="/courses">Courses</Link> /
                    <Link to={`/course/${course.id}`}> {course.title}</Link> /
                    <span> {lesson.title}</span>
                </div>
                <h1>{lesson.title}</h1>
                <div className="scripture-ref">
                    📚 Scripture: <strong>{lesson.scripture}</strong>
                </div>

                <div className="completion-stats">
                    {isCompleted ? (
                        <span className="badge-completed">✓ Completed</span>
                    ) : (
                        <span className="badge-incomplete">In Progress</span>
                    )}
                </div>
            </div>

            <div className="lesson-content">
                {lesson.image && (
                    <div className="lesson-media-wrapper">
                        <img src={lesson.image} alt="Lesson Visual" className="lesson-image" />
                    </div>
                )}

                {lesson.audio && (
                    <div className="audio-player-wrapper">
                        <span>🎧 Listen to Lesson:</span>
                        <audio controls src={lesson.audio} className="lesson-audio">
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                )}

                <p>{lesson.content}</p>

                {lesson.pdf && (
                    <div className="pdf-resource">
                        <a href={lesson.pdf} download={`Lesson-${lesson.id}-Resource.pdf`} className="btn-download">
                            📄 Download Lesson PDF
                        </a>
                    </div>
                )}

                {/* Placeholder text if no custom content */}
                {!lesson.content && (
                    <p>
                        Reflection: As you meditate on this scripture, consider how it applies to your daily walk.
                        Faith is not just belief, but action. Take a moment to pray and ask God for wisdom in this area.
                    </p>
                )}

                <div className="lesson-action-area">
                    <button
                        className={`btn-mark-complete ${isCompleted ? 'completed' : ''}`}
                        onClick={handleComplete}
                        disabled={isCompleted}
                    >
                        {isCompleted ? 'Lesson Completed' : 'Mark as Completed'}
                    </button>
                </div>
            </div>

            <div className="lesson-navigation">
                {prevLesson ? (
                    <Link to={`/course/${course.id}/lesson/${prevLesson.id}`} className="nav-btn prev">
                        ← {prevLesson.title}
                    </Link>
                ) : (
                    <div></div>
                )}

                {nextLesson ? (
                    <Link to={`/course/${course.id}/lesson/${nextLesson.id}`} className="nav-btn next">
                        {nextLesson.title} →
                    </Link>
                ) : (
                    <Link to={`/course/${course.id}`} className="nav-btn finish">
                        Finish Course
                    </Link>
                )}
            </div>
        </div>
    );
};

export default LessonView;
