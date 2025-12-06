import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import { useFamily } from '../../context/FamilyContext';
import api from '../../api/api';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const { enrolledCourses, getCourseProgress } = useCourses();
    const { user: authUser, getUserData, updateProfile } = useAuth();
    const { family, createFamily, leaveFamily, addMember } = useFamily();
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreateFamily, setShowCreateFamily] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);
    const [familyName, setFamilyName] = useState('');
    const [memberEmails, setMemberEmails] = useState('');
    const [newMemberEmail, setNewMemberEmail] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            if (authUser?._id) {
                const result = await getUserData(authUser._id);
                if (result.success && result.user) {
                    setUser(result.user);
                }
            }
            setLoading(false);
        };
        if (authUser) {
            fetchUserData();
        } else {
            setLoading(false);
        }
    }, [authUser, getUserData]);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (authUser?._id) {
            await updateProfile(authUser._id, user.name, user.avater);
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleCreateFamily = async () => {
        const emails = memberEmails.split(',').map(e => e.trim()).filter(e => e);
        const result = await createFamily(familyName, emails);
        if (result.success) {
            setShowCreateFamily(false);
            setFamilyName('');
            setMemberEmails('');
        }
    };

    const handleLeaveFamily = async () => {
        if (family?._id) {
            if (window.confirm('Are you sure you want to leave this family?')) {
                const result = await leaveFamily(family._id);
                if (result.success) {
                    // Refresh user data
                    if (authUser?._id) {
                        const userResult = await getUserData(authUser._id);
                        if (userResult.success && userResult.user) {
                            setUser(userResult.user);
                        }
                    }
                } else {
                    alert(result.message || 'Failed to leave family');
                }
            }
        }
    };

    const handleAddMember = async () => {
        if (family?._id && newMemberEmail.trim()) {
            const result = await addMember(family._id, newMemberEmail.trim());
            if (result.success) {
                setNewMemberEmail('');
                setShowAddMember(false);
                alert('Member added successfully!');
            } else {
                alert(result.message || 'Failed to add member');
            }
        } else if (!newMemberEmail.trim()) {
            alert('Please enter an email address');
        }
    };

    if (loading || !user) {
        return <div className="profile-wrapper"><div className="loading-spinner"></div></div>;
    }

    return (
        <div className="profile-wrapper">
            <div className="profile-header-card">
                <div className="profile-avatar">
                    <img src="https://ui-avatars.com/api/?name=User&background=6B8F71&color=fff&size=150" alt="Profile" />
                </div>

                <div className="profile-info">
                    {isEditing ? (
                        <div className="edit-profile-form">
                            <input
                                type="text"
                                name="name"
                                value={user.name}
                                onChange={handleChange}
                                placeholder="Display Name"
                                className="edit-input"
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
                            <button className="btn-edit" onClick={handleEditClick}>Edit Profile</button>
                        </>
                    )}
                </div>
            </div>

            <div className="profile-stats">
                <div className="stat-card">
                    <div className="stat-icon-large">🏆</div>
                    <p className="stat-label-bottom">{user.league || "BRONZE"}</p>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-large">🔥</div>
                    <p className="stat-label-bottom">{user.streak || 0} Streak</p>
                </div>
                <div className="stat-card">
                    <h3>{user.xp || 0}</h3>
                    <p>Total XP ✨</p>
                </div>
            </div>

            {/* Family Section */}
            <div className="family-section">
                <h2>My Family</h2>
                {family ? (
                    <div className="family-card">
                        <div className="family-header">
                            <div>
                                <h3>{family.name}</h3>
                                <p className="family-xp">✨ {family.xp || 0} Total XP</p>
                            </div>
                            <div className="family-header-actions">
                                <button className="btn-add-member" onClick={() => setShowAddMember(true)}>
                                    Add Member
                                </button>
                                <button className="btn-leave-family" onClick={handleLeaveFamily}>
                                    Leave Family
                                </button>
                            </div>
                        </div>
                        {showAddMember && (
                            <div className="add-member-form">
                                <input
                                    type="email"
                                    placeholder="Enter member email"
                                    value={newMemberEmail}
                                    onChange={(e) => setNewMemberEmail(e.target.value)}
                                />
                                <div className="form-actions">
                                    <button onClick={handleAddMember}>Add</button>
                                    <button onClick={() => { setShowAddMember(false); setNewMemberEmail(''); }}>Cancel</button>
                                </div>
                            </div>
                        )}
                        <div className="family-members">
                            {family.members?.map((member, idx) => (
                                <div key={idx} className="family-member">
                                    <span>{typeof member === 'object' ? member.name : 'Member'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="no-family-card">
                        <p>Join a family to grow together!</p>
                        <button className="btn-create-family" onClick={() => setShowCreateFamily(true)}>
                            Create Family
                        </button>
                        {showCreateFamily && (
                            <div className="create-family-form">
                                <input
                                    type="text"
                                    placeholder="Family Name"
                                    value={familyName}
                                    onChange={(e) => setFamilyName(e.target.value)}
                                />
                                <textarea
                                    placeholder="Member emails (comma separated)"
                                    value={memberEmails}
                                    onChange={(e) => setMemberEmails(e.target.value)}
                                />
                                <div className="form-actions">
                                    <button onClick={handleCreateFamily}>Create</button>
                                    <button onClick={() => setShowCreateFamily(false)}>Cancel</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="my-courses-section">
                <h2>My Enrolled Courses</h2>
                <div className="my-courses-grid">
                    {enrolledCourses.length === 0 ? (
                        <p>No enrolled courses. Go to Courses to enroll!</p>
                    ) : (
                        enrolledCourses.map(course => {
                            const progress = getCourseProgress(course._id);
                            return (
                                <div key={course._id} className="my-course-card">
                                    <div className="my-course-info">
                                        <h3>{course.title}</h3>
                                        <span className="progress-label">{progress}% Complete</span>
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                    <button
                                        className="btn-continue"
                                        onClick={() => navigate(`/course/${course._id}`)}
                                    >
                                        {progress === 100 ? 'Review' : 'Continue'}
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
