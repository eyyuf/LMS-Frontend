import React, { useState, useEffect } from 'react';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import axios from 'axios';
import './Admin.css';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

const Admin = () => {
    const { courses, addCourse, addLessonToCourse, deleteCourse } = useCourses();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard'); // Default to dashboard
    const [notification, setNotification] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dashboard Data
    const [dashboardData, setDashboardData] = useState(null);
    const [loadingDashboard, setLoadingDashboard] = useState(false);

    // Course Form State
    const [courseData, setCourseData] = useState({ title: '' });

    // Lesson Form State
    const [lessonData, setLessonData] = useState({
        courseId: '', title: '', order: '', text: '', xp: '50', file: null
    });

    // Blog Form State
    const [blogData, setBlogData] = useState({
        title: '',
        content: '',
        author: '',
        media: []
    });

    // Blogs List for Management
    const [blogs, setBlogs] = useState([]);
    const [editingBlog, setEditingBlog] = useState(null);

    // Quiz Form State
    const [quizData, setQuizData] = useState({
        courseId: '',
        questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]
    });

    // Fetch blogs for management
    useEffect(() => {
        if (activeTab === 'manageBlogs') {
            fetchBlogs();
        } else if (activeTab === 'dashboard' && user) {
            fetchDashboardData();
        }
    }, [activeTab, user]);

    const fetchDashboardData = async () => {
        setLoadingDashboard(true);
        try {
            const response = await api.get('/admin');
            if (response.data) {
                setDashboardData(response.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            showNotification('Failed to load dashboard data');
        } finally {
            setLoadingDashboard(false);
        }
    };

    const fetchBlogs = async () => {
        try {
            const response = await api.get('/blog');
            if (response.data) {
                const blogData = response.data.blogs || response.data.data || response.data || [];
                setBlogs(Array.isArray(blogData) ? blogData : []);
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
        }
    };

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

    const handleBlogSubmit = async (e) => {
        e.preventDefault();
        if (!blogData.title || !blogData.content || !blogData.author) {
            showNotification('Please fill in all fields (title, author, content)');
            return;
        }
        if (!blogData.media || blogData.media.length === 0) {
            showNotification('Please upload at least one image/video');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', blogData.title.trim());
            formData.append('content', blogData.content.trim());
            formData.append('author', blogData.author.trim());

            // Append multiple media files
            for (let i = 0; i < blogData.media.length; i++) {
                formData.append('media', blogData.media[i]);
            }

            // IMPORTANT: Use raw axios instead of api instance to avoid default 'application/json' header
            // This allows proper multipart/form-data with boundary
            const response = await axios.post('https://fm-bls.onrender.com/api/blog/create', formData, {
                withCredentials: true
            });

            if (response.data && response.data.success !== false) {
                setBlogData({ title: '', content: '', author: '', media: [] });
                // Clear file input
                const fileInput = document.querySelector('input[type="file"][multiple]');
                if (fileInput) fileInput.value = '';
                showNotification('Blog Created Successfully!');

                // Optionally refresh the page or redirect to blog page
                setTimeout(() => {
                    setActiveTab('manageBlogs');
                    fetchBlogs();
                }, 1500);
            } else {
                showNotification(response.data?.message || 'Blog creation failed');
            }
        } catch (error) {
            console.error('Error creating blog:', error);
            showNotification(error.response?.data?.message || 'Failed to create blog');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Update Blog Handler
    const handleUpdateBlog = async (e) => {
        e.preventDefault();
        if (!editingBlog) return;

        setIsSubmitting(true);
        try {
            const response = await api.put(`/blog/${editingBlog._id}`, {
                title: editingBlog.title,
                content: editingBlog.content,
                author: editingBlog.author
            });

            if (response.data?.success !== false) {
                showNotification('Blog Updated Successfully!');
                setEditingBlog(null);
                fetchBlogs();
            } else {
                showNotification(response.data?.message || 'Update failed');
            }
        } catch (error) {
            showNotification(error.response?.data?.message || 'Failed to update blog');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete Blog Handler
    const handleDeleteBlog = async (blogId) => {
        if (!window.confirm('Are you sure you want to delete this blog?')) return;

        try {
            const response = await api.delete(`/blog/${blogId}`);
            if (response.data?.success !== false) {
                showNotification('Blog Deleted Successfully!');
                fetchBlogs();
            } else {
                showNotification(response.data?.message || 'Delete failed');
            }
        } catch (error) {
            showNotification(error.response?.data?.message || 'Failed to delete blog');
        }
    };

    // Quiz Handlers
    const addQuestion = () => {
        setQuizData(prev => ({
            ...prev,
            questions: [...prev.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]
        }));
    };

    const removeQuestion = (index) => {
        if (quizData.questions.length <= 1) return;
        setQuizData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const updateQuestion = (index, field, value) => {
        setQuizData(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) =>
                i === index ? { ...q, [field]: value } : q
            )
        }));
    };

    const updateOption = (qIndex, oIndex, value) => {
        setQuizData(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) =>
                i === qIndex ? {
                    ...q,
                    options: q.options.map((opt, j) => j === oIndex ? value : opt)
                } : q
            )
        }));
    };

    const handleQuizSubmit = async (e) => {
        e.preventDefault();
        if (!quizData.courseId) {
            showNotification('Please select a course');
            return;
        }

        // Validate questions
        for (let i = 0; i < quizData.questions.length; i++) {
            const q = quizData.questions[i];
            if (!q.question.trim()) {
                showNotification(`Question ${i + 1} is empty`);
                return;
            }
            for (let j = 0; j < q.options.length; j++) {
                if (!q.options[j].trim()) {
                    showNotification(`Option ${j + 1} in Question ${i + 1} is empty`);
                    return;
                }
            }
        }

        setIsSubmitting(true);
        try {
            const response = await api.post(`/quiz/create/${quizData.courseId}`, {
                questions: quizData.questions
            });

            if (response.data?.success) {
                showNotification('Quiz Created Successfully!');
                setQuizData({
                    courseId: '',
                    questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]
                });
            } else {
                showNotification(response.data?.message || 'Failed to create quiz');
            }
        } catch (error) {
            showNotification(error.response?.data?.message || 'Failed to create quiz');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Dashboard Visualization Helpers ---
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    const renderDashboard = () => {
        if (loadingDashboard) return <div className="loading-spinner">Loading stats...</div>;
        if (!dashboardData) return <div>No data available</div>;

        const { users, courses, lessons, quizzes, families, blogs } = dashboardData;

        // Prepare Data for League Distribution
        const leagueCounts = {};
        users?.forEach(u => {
            const l = u.league || 'BRONZE';
            leagueCounts[l] = (leagueCounts[l] || 0) + 1;
        });
        const leagueData = Object.keys(leagueCounts).map(key => ({ name: key, value: leagueCounts[key] }));

        // Prepare Data for Content Distribution
        const contentData = [
            { name: 'Courses', value: courses?.length || 0 },
            { name: 'Lessons', value: lessons?.length || 0 },
            { name: 'Quizzes', value: quizzes?.length || 0 },
            { name: 'Blogs', value: blogs?.length || 0 },
        ];

        return (
            <div className="dashboard-container">
                {/* Stats Cards Row */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{users?.length || 0}</div>
                        <div className="stat-label">Total Users</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{families?.length || 0}</div>
                        <div className="stat-label">Families</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{courses?.length || 0}</div>
                        <div className="stat-label">Active Courses</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{dashboardData.users?.reduce((acc, u) => acc + (u.xp || 0), 0) || 0}</div>
                        <div className="stat-label">Total Platform XP</div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="charts-grid flow-row">
                    <div className="chart-card">
                        <h3>User League Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={leagueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" name="Users" fill="#8884d8">
                                    {leagueData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-card">
                        <h3>Platform Content</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={contentData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {contentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="admin-wrapper">
            {notification && <div className="notification">{notification}</div>}

            <div className="admin-header">
                <h2>Admin Dashboard</h2>
                <div className="admin-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        Dashboard
                    </button>
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
                    <button
                        className={`tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
                        onClick={() => setActiveTab('quiz')}
                    >
                        Create Quiz
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'blog' ? 'active' : ''}`}
                        onClick={() => setActiveTab('blog')}
                    >
                        Create Blog
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'manageBlogs' ? 'active' : ''}`}
                        onClick={() => setActiveTab('manageBlogs')}
                    >
                        Manage Blogs
                    </button>
                </div>
            </div>

            <div className="admin-content-area">
                {activeTab === 'dashboard' ? renderDashboard() :
                    activeTab === 'course' ? (
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
                            {/* Course List moved here for context */}
                            <div className="admin-list-section" style={{ marginTop: '2rem', padding: '0', boxShadow: 'none' }}>
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
                    ) : activeTab === 'lesson' ? (
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
                    ) : activeTab === 'quiz' ? (
                        <div className="form-card">
                            <h3>Create Quiz for Course</h3>
                            <form onSubmit={handleQuizSubmit}>
                                <select
                                    value={quizData.courseId}
                                    onChange={e => setQuizData({ ...quizData, courseId: e.target.value })}
                                    required
                                >
                                    <option value="">Select a Course...</option>
                                    {courses.map(c => (
                                        <option key={c._id} value={c._id}>{c.title}</option>
                                    ))}
                                </select>

                                <div className="quiz-questions">
                                    {quizData.questions.map((q, qIndex) => (
                                        <div key={qIndex} className="question-block" style={{
                                            padding: '1rem',
                                            marginBottom: '1rem',
                                            background: '#f9f9f9',
                                            borderRadius: '8px',
                                            border: '1px solid #eee'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                <strong>Question {qIndex + 1}</strong>
                                                {quizData.questions.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeQuestion(qIndex)}
                                                        style={{ background: '#ffcdd2', color: '#c62828', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Enter question"
                                                value={q.question}
                                                onChange={e => updateQuestion(qIndex, 'question', e.target.value)}
                                                style={{ marginBottom: '0.5rem' }}
                                                required
                                            />
                                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                                {q.options.map((opt, oIndex) => (
                                                    <div key={oIndex} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                        <input
                                                            type="radio"
                                                            name={`correct-${qIndex}`}
                                                            checked={q.correctAnswer === oIndex}
                                                            onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder={`Option ${oIndex + 1}`}
                                                            value={opt}
                                                            onChange={e => updateOption(qIndex, oIndex, e.target.value)}
                                                            style={{ flex: 1 }}
                                                            required
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <small style={{ color: '#666', marginTop: '0.5rem', display: 'block' }}>
                                                Select the correct answer using the radio button
                                            </small>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    style={{ background: '#e3f2fd', color: '#1976d2', border: 'none', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', marginBottom: '1rem', width: '100%' }}
                                >
                                    + Add Another Question
                                </button>

                                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Creating Quiz...' : 'Create Quiz'}
                                </button>
                            </form>
                        </div>
                    ) : activeTab === 'blog' ? (
                        <div className="form-card">
                            <h3>Create New Blog Post</h3>
                            <form onSubmit={handleBlogSubmit}>
                                <input
                                    type="text"
                                    placeholder="Blog Title"
                                    value={blogData.title}
                                    onChange={e => setBlogData({ ...blogData, title: e.target.value })}
                                    required
                                />

                                <input
                                    type="text"
                                    placeholder="Author Name"
                                    value={blogData.author}
                                    onChange={e => setBlogData({ ...blogData, author: e.target.value })}
                                    required
                                />

                                <textarea
                                    placeholder="Blog Content"
                                    value={blogData.content}
                                    onChange={e => setBlogData({ ...blogData, content: e.target.value })}
                                    rows="8"
                                    required
                                />

                                <div className="file-input-group">
                                    <label>Blog Media (up to 3 images/videos):</label>
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        multiple
                                        onChange={e => {
                                            const files = Array.from(e.target.files).slice(0, 3);
                                            setBlogData(prev => ({ ...prev, media: files }));
                                        }}
                                    />
                                    {blogData.media.length > 0 && (
                                        <small style={{ color: '#666', marginTop: '0.5rem' }}>
                                            {blogData.media.length} file(s) selected
                                        </small>
                                    )}
                                </div>

                                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Creating...' : 'Create Blog Post'}
                                </button>
                            </form>
                        </div>
                    ) : activeTab === 'manageBlogs' ? (
                        <div className="form-card" style={{ maxWidth: '100%' }}>
                            <h3>Manage Blogs</h3>

                            {editingBlog ? (
                                <form onSubmit={handleUpdateBlog}>
                                    {/* Edit form maintained */}
                                    <h4>Editing: {editingBlog.title}</h4>
                                    <input
                                        type="text"
                                        placeholder="Blog Title"
                                        value={editingBlog.title}
                                        onChange={e => setEditingBlog({ ...editingBlog, title: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Author"
                                        value={editingBlog.author || ''}
                                        onChange={e => setEditingBlog({ ...editingBlog, author: e.target.value })}
                                        required
                                    />
                                    <textarea
                                        placeholder="Content"
                                        value={editingBlog.content}
                                        onChange={e => setEditingBlog({ ...editingBlog, content: e.target.value })}
                                        rows="6"
                                        required
                                    />
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button type="submit" className="btn-submit" disabled={isSubmitting}>
                                            {isSubmitting ? 'Updating...' : 'Update Blog'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingBlog(null)}
                                            style={{ background: '#eee', border: 'none', padding: '1rem', borderRadius: '8px', cursor: 'pointer' }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="admin-course-list">
                                    {blogs.length === 0 ? (
                                        <p>No blogs yet.</p>
                                    ) : (
                                        blogs.map(blog => (
                                            <div key={blog._id} className="admin-course-item">
                                                <div className="course-info-summary">
                                                    <strong>{blog.title}</strong>
                                                    <span>{blog.author || 'Unknown'} • {new Date(blog.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        className="btn-delete-sm"
                                                        style={{ background: '#e3f2fd', color: '#1976d2' }}
                                                        onClick={() => setEditingBlog(blog)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn-delete-sm"
                                                        onClick={() => handleDeleteBlog(blog._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    ) : null}
            </div>
        </div>
    );
};

export default Admin;
