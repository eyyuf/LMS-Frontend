import React, { useState } from 'react';
import { useCourses } from '../../context/CourseContext';
import './Profile.css';

const Profile = () => {
    const { courses } = useCourses();
    const [isEditing, setIsEditing] = useState(false);

    // Mock User Data
    const [user, setUser] = useState({
        name: "Faith Walker",
        email: "faith.walker@example.com",
        joined: "January 2024",
        bio: "Seeking to grow daily in the Word and walk in His wisdom.",
        avatar: "https://i.pravatar.cc/150?u=faith" // Placeholder avatar
    });

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
                    <h3>3</h3>
                    <p>Courses Enrolled</p>
                </div>
                <div className="stat-card">
                    <h3>12</h3>
                    <p>Lessons Completed</p>
                </div>
                <div className="stat-card">
                    <h3>5 Day</h3>
                    <p>Reading Streak 🔥</p>
                </div>
            </div>

            <div className="my-courses-section">
                <h2>My Active Studies</h2>
                <div className="my-courses-grid">
                    {/* Simulating enrolled courses by taking the first 2 from context */}
                    {courses.slice(0, 2).map(course => (
                        <div key={course.id} className="my-course-card">
                            <div className="my-course-info">
                                <h3>{course.title}</h3>
                                <span className="progress-label">60% Complete</span>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: '60%' }}></div>
                                </div>
                            </div>
                            <button className="btn-continue">Continue</button>
                        </div>
                    ))}
                    {courses.length === 0 && <p>No active courses. Go to Courses to enroll!</p>}
                </div>
            </div>
        </div>
    );
};

export default Profile;
