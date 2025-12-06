import React, { useState } from 'react';
import { useCourses } from '../../context/CourseContext';
import './Admin.css';

const Admin = () => {
    const { courses, addCourse, addLessonToCourse, deleteCourse } = useCourses();
    const [activeTab, setActiveTab] = useState('course'); // 'course' or 'lesson'
    const [notification, setNotification] = useState(null);

    // Course Form State
    const [courseData, setCourseData] = useState({ title: '', description: '', category: '' });

    // Lesson Form State
    const [lessonData, setLessonData] = useState({
        courseId: '', title: '', scripture: '', content: '',
        image: '', audio: '', pdf: ''
    });

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleCourseSubmit = (e) => {
        e.preventDefault();
        if (!courseData.title || !courseData.description) return;

        addCourse(courseData);
        setCourseData({ title: '', description: '', category: '' });
        showNotification('New Study Course Added!');
    };

    const handleLessonSubmit = (e) => {
        e.preventDefault();
        if (!lessonData.courseId || !lessonData.title) return;

        addLessonToCourse(parseInt(lessonData.courseId), {
            title: lessonData.title,
            scripture: lessonData.scripture,
            content: lessonData.content,
            image: lessonData.image,
            audio: lessonData.audio,
            pdf: lessonData.pdf
        });

        setLessonData(prev => ({
            ...prev, title: '', scripture: '', content: '', image: '', audio: '', pdf: ''
        }));

        showNotification('Lesson Added Successfully!');
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
                        <h3>Create New Bible Study</h3>
                        <form onSubmit={handleCourseSubmit}>
                            <input
                                type="text"
                                placeholder="Study Title (e.g. Book of Romans)"
                                value={courseData.title}
                                onChange={e => setCourseData({ ...courseData, title: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Category (e.g. New Testament)"
                                value={courseData.category}
                                onChange={e => setCourseData({ ...courseData, category: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Description"
                                value={courseData.description}
                                onChange={e => setCourseData({ ...courseData, description: e.target.value })}
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
                                    <option key={c.id} value={c.id}>{c.title}</option>
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
                                type="text"
                                placeholder="Scripture Reference (e.g. John 3:16)"
                                value={lessonData.scripture}
                                onChange={e => setLessonData({ ...lessonData, scripture: e.target.value })}
                                required
                            />

                            <div className="file-input-group">
                                <label>Lesson Image:</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => {
                                        if (e.target.files[0]) {
                                            const url = URL.createObjectURL(e.target.files[0]);
                                            setLessonData(prev => ({ ...prev, image: url }));
                                        }
                                    }}
                                />
                            </div>

                            <div className="file-input-group">
                                <label>Audio Recording:</label>
                                <input
                                    type="file"
                                    accept="audio/*"
                                    onChange={e => {
                                        if (e.target.files[0]) {
                                            const url = URL.createObjectURL(e.target.files[0]);
                                            setLessonData(prev => ({ ...prev, audio: url }));
                                        }
                                    }}
                                />
                            </div>

                            <div className="file-input-group">
                                <label>PDF Resource:</label>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={e => {
                                        if (e.target.files[0]) {
                                            const url = URL.createObjectURL(e.target.files[0]);
                                            setLessonData(prev => ({ ...prev, pdf: url }));
                                        }
                                    }}
                                />
                            </div>

                            <textarea
                                placeholder="Lesson Content / Devotional Text"
                                value={lessonData.content}
                                onChange={e => setLessonData({ ...lessonData, content: e.target.value })}
                                rows="5"
                                required
                            />
                            <button type="submit" className="btn-submit">Add Lesson</button>
                            <p className="note-text">* Note: Uploaded files will reset on page reload (Demo Mode)</p>
                        </form>
                    </div>
                )}

                <div className="admin-list-section">
                    <h3>Manage Courses</h3>
                    <div className="admin-course-list">
                        {courses.map(course => (
                            <div key={course.id} className="admin-course-item">
                                <div className="course-info-summary">
                                    <strong>{course.title}</strong>
                                    <span>{course.lessons.length} Lessons</span>
                                </div>
                                <button className="btn-delete-sm" onClick={() => deleteCourse(course.id)}>Delete</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
