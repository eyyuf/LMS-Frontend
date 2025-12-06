import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const { courses, getCourseProgress, streak } = useCourses();
    const { user: authUser } = useAuth(); // Get auth user
    const [isEditing, setIsEditing] = useState(false);

    // Integrated user state
    const [user, setUser] = useState({
        name: authUser?.name || "Member",
        email: authUser?.email || "",
        joined: "2024",
        bio: "Seeking to grow daily in the Word.",
        avatar: authUser?.avatar || "https://i.pravatar.cc/150",
        league: "BRONZE",
        xp: 0,
        streak: 0
    });

    // Fetch latest user data including stats
    useEffect(() => {
        const fetchUserData = async () => {
            if (authUser?._id) {
                try {
                    // Fetch fresh data from backend
                    const res = await api.post('/users/get-user-data', { userId: authUser._id });

                    if (res.data.success) {
                        const backendUser = res.data.User;
                        setUser(prev => ({
                            ...prev,
                            name: backendUser.name,
                            email: backendUser.email,
                            // Map backend 'avater' (typo in model) to frontend 'avatar'
                            avatar: backendUser.avater || backendUser.avatar || prev.avatar,
                            league: backendUser.league || "BRONZE",
                            xp: backendUser.xp || 0,
                            streak: backendUser.streak || 0
                        }));
                    }
                } catch (e) {
                    console.error("Failed to fetch fresh user data:", e);
                    // Fallback: Try fetching specific stats if the monolithic endpoint isn't ready
                    try {
                        const [streakRes, xpRes] = await Promise.all([
                            api.post('/users/getStreak', { userId: authUser._id }),
                            api.post('/users/xp', { userId: authUser._id })
                        ]);

                        setUser(prev => ({
                            ...prev,
                            streak: streakRes.data.success ? streakRes.data.streak : prev.streak,
                            xp: xpRes.data.success ? xpRes.data.xp : prev.xp,
                            // Assumes league logic handles defaults or is included in streakRes if lucky, 
                            // otherwise keeps default "BRONZE"
                        }));
                    } catch (fallbackErr) {
                        console.warn("Could not fetch individual stats either.", fallbackErr);
                    }
                }
            }
        };
        fetchUserData();
    }, [authUser]);

    const [editForm, setEditForm] = useState(user);

    const handleEditClick = () => {
        setEditForm(user);
        setIsEditing(true);
    };

    const handleSave = () => {
        setUser(editForm);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    // Calculate total lessons completed
    const totalLessonsCompleted = courses.reduce((acc, course) => {
        const progress = getCourseProgress(course.id);
        const completedCount = Math.round((progress / 100) * course.lessons.length);
        return acc + completedCount;
    }, 0);

    return (
        <div className="profile-wrapper">
            <div className="profile-header-card">
                <div className="profile-avatar">
                    <img src={user.avatar} alt="Profile" />
                </div>

                <div className="profile-info">
                    {isEditing ? (
                        <div className="edit-profile-form">
                            <input
                                type="text"
                                name="name"
                                value={editForm.name}
                                onChange={handleChange}
                                placeholder="Display Name"
                                className="edit-input"
                            />
                            <textarea
                                name="bio"
                                value={editForm.bio}
                                onChange={handleChange}
                                placeholder="Share your testimony or bio..."
                                className="edit-textarea"
                            />
                            <div className="edit-actions">
                                <button className="btn-save" onClick={handleSave}>Save Changes</button>
                                <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h1>{user.name}</h1>
                            <p className="profile-email">{user.email}</p>
                            <p className="profile-joined">Member since {user.joined}</p>
                            <p className="profile-bio">{user.bio}</p>
                            <button className="btn-edit" onClick={handleEditClick}>Edit Profile</button>
                        </>
                    )}
                </div>
            </div>

            <div className="profile-stats">
                <div className="stat-card">
                    <h3>{user.league || "BRONZE"}</h3>
                    <p>Current League 🏆</p>
                </div>
                <div className="stat-card">
                    <h3>{user.streak || 0} Day{user.streak !== 1 ? 's' : ''}</h3>
                    <p>Reading Streak 🔥</p>
                </div>
                <div className="stat-card">
                    <h3>{user.xp || 0}</h3>
                    <p>Total XP ✨</p>
                </div>
            </div>

            <div className="my-courses-section">
                <h2>My Active Studies</h2>
                <div className="my-courses-grid">

                    {courses.map(course => {
                        const progress = getCourseProgress(course.id);
                        return (
                            <div key={course.id} className="my-course-card">
                                <div className="my-course-info">
                                    <h3>{course.title}</h3>
                                    <span className="progress-label">{progress}% Complete</span>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                                <button
                                    className="btn-continue"
                                    onClick={() => navigate(`/course/${course.id}`)}
                                >
                                    {progress === 100 ? 'Review' : 'Continue'}
                                </button>
                            </div>
                        )
                    })}
                    {courses.length === 0 && <p>No active courses. Go to Courses to enroll!</p>}
                </div>
            </div>
        </div>
    );
};

export default Profile;
