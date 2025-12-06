import React, { useState } from 'react';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

const Admin = () => {
    const { courses, addCourse, addLessonToCourse, deleteCourse } = useCourses();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('course');
    const [notification, setNotification] = useState(null);

    // Course Form State
    const [courseData, setCourseData] = useState({ title: '' });

    // Lesson Form State
    const [lessonData, setLessonData] = useState({
        courseId: '', title: '', order: '', text: '', xp: '50', file: null
    });

    if (!user || user.role !== 'ADMIN') {
        return <div className="admin-wrapper"><h2>Access Denied. Admin only.</h2></div>;
    }

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleCourseSubmit = async (e) => {
        e.preventDefault();
        if (!courseData.title) return;

        const result = await addCourse(courseData.title);
        if (result.success) {
            setCourseData({ title: '' });
            showNotification('Course Created Successfully!');
        } else {
            showNotification(result.message || 'Failed to create course');
        }
    };

    const handleLessonSubmit = async (e) => {
        e.preventDefault();
        if (!lessonData.courseId || !lessonData.title || !lessonData.order || !lessonData.text) {
            showNotification('Please fill in all required fields');
            return;
        }

        const result = await addLessonToCourse(lessonData.courseId, {
            title: lessonData.title,
            order: parseInt(lessonData.order),
            text: lessonData.text,
            xp: parseInt(lessonData.xp) || 50,
            file: lessonData.file
        });

        if (result.success) {
            setLessonData({ courseId: '', title: '', order: '', text: '', xp: '50', file: null });
            showNotification('Lesson Added Successfully!');
        } else {
            showNotification(result.message || 'Failed to add lesson');
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            const result = await deleteCourse(courseId);
            if (result.success) {
                showNotification('Course Deleted Successfully!');
            } else {
                showNotification(result.message || 'Failed to delete course');
            }
        }
    };

    return (
        <div className="admin-wrapper">
            {notification && <div className="notification">{notification}</div>}

            <div className="admin-header">
                <h2>Admin Dashboard</h2>
                <div className="admin-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'course' ? 'active' : ''}`}
                        onClick={() => setActiveTab('course')}
                    >
                        Create Course
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'lesson' ? 'active' : ''}`}
                        onClick={() => setActiveTab('lesson')}
                    >
                        Add Lesson
                    </button>
                </div>
            </div>

            <div className="admin-content">
                {activeTab === 'course' ? (
                    <div className="form-card">
                        <h3>Create New Bible Study Course</h3>
                        <form onSubmit={handleCourseSubmit}>
                            <input
                                type="text"
                                placeholder="Course Title"
                                value={courseData.title}
                                onChange={e => setCourseData({ ...courseData, title: e.target.value })}
                                required
                            />
                            <button type="submit" className="btn-submit">Create Course</button>
                        </form>
                    </div>
                ) : (
                    <div className="form-card">
                        <h3>Add Lesson Content</h3>
                        <form onSubmit={handleLessonSubmit}>
                            <select
                                value={lessonData.courseId}
                                onChange={e => setLessonData({ ...lessonData, courseId: e.target.value })}
                                required
                            >
                                <option value="">Select a Course...</option>
                                {courses.map(c => (
                                    <option key={c._id} value={c._id}>{c.title}</option>
                                ))}
                            </select>

                            <input
                                type="text"
                                placeholder="Lesson Title"
                                value={lessonData.title}
                                onChange={e => setLessonData({ ...lessonData, title: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Order (1, 2, 3...)"
                                value={lessonData.order}
                                onChange={e => setLessonData({ ...lessonData, order: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                placeholder="XP Points (default: 50)"
                                value={lessonData.xp}
                                onChange={e => setLessonData({ ...lessonData, xp: e.target.value })}
                                required
                            />

                            <div className="file-input-group">
                                <label>Lesson Image/File:</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => {
                                        if (e.target.files[0]) {
                                            setLessonData(prev => ({ ...prev, file: e.target.files[0] }));
                                        }
                                    }}
                                />
                            </div>

                            <textarea
                                placeholder="Lesson Content / Text"
                                value={lessonData.text}
                                onChange={e => setLessonData({ ...lessonData, text: e.target.value })}
                                rows="5"
                                required
                            />
                            <button type="submit" className="btn-submit">Add Lesson</button>
                        </form>
                    </div>
                )}

                <div className="admin-list-section">
                    <h3>Manage Courses</h3>
                    <div className="admin-course-list">
                        {courses.length === 0 ? (
                            <p>No courses yet. Create one above!</p>
                        ) : (
                            courses.map(course => (
                                <div key={course._id} className="admin-course-item">
                                    <div className="course-info-summary">
                                        <strong>{course.title}</strong>
                                        <span>{course.lessons?.length || 0} Lessons</span>
                                    </div>
                                    <button className="btn-delete-sm" onClick={() => handleDeleteCourse(course._id)}>Delete</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
