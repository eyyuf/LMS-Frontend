import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import './Leaderboard.css';

const Leaderboard = () => {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState([]);
    const [familyLeaderboard, setFamilyLeaderboard] = useState([]);
    const [activeTab, setActiveTab] = useState('individual');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            if (!user?._id) {
                setLoading(false);
                return;
            }
            try {
                // Backend route is GET - auth middleware sets req.body.userId from token cookie
                const response = await api.get('/leaderboard/getLeaderboard');
                if (response.data.success) {
                    setLeaderboard(response.data.leaderboard || []);
                } else {
                    console.error("Failed to fetch leaderboard:", response.data.message);
                    setLeaderboard([]);
                }
            } catch (error) {
                console.error("Failed to fetch leaderboard:", error);
                setLeaderboard([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [user]);

    useEffect(() => {
        const fetchFamilyLeaderboard = async () => {
            if (activeTab === 'family') {
                setLoading(true);
                try {
                    // Backend route is GET - auth middleware sets req.body.userId from token cookie
                    const response = await api.get('/family/famLeaderboard');
                    if (response.data.success) {
                        const sorted = (response.data.families || []).sort((a, b) => (b.xp || 0) - (a.xp || 0));
                        setFamilyLeaderboard(sorted);
                    } else {
                        console.error("Failed to fetch family leaderboard:", response.data.message);
                        setFamilyLeaderboard([]);
                    }
                } catch (error) {
                    console.error("Failed to fetch family leaderboard:", error);
                    setFamilyLeaderboard([]);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchFamilyLeaderboard();
    }, [activeTab]);

    const getLeagueIcon = (league) => {
        const icons = {
            BRONZE: '🥉',
            SILVER: '🥈',
            GOLD: '🥇',
            PLATINUM: '💎',
            DIAMOND: '💠'
        };
        return icons[league] || '🏅';
    };

    if (loading) {
        return <div className="leaderboard-container"><div className="loading">Loading...</div></div>;
    }

    return (
        <div className="leaderboard-container">
            <h1>Leaderboard</h1>
            <div className="leaderboard-tabs">
                <button
                    className={`tab ${activeTab === 'individual' ? 'active' : ''}`}
                    onClick={() => setActiveTab('individual')}
                >
                    Individual
                </button>
                <button
                    className={`tab ${activeTab === 'family' ? 'active' : ''}`}
                    onClick={() => setActiveTab('family')}
                >
                    Family
                </button>
            </div>

            {activeTab === 'individual' ? (
                <div className="leaderboard-list">
                    {leaderboard.length === 0 ? (
                        <p className="no-data">No leaderboard data available yet.</p>
                    ) : (
                        leaderboard.map((entry, index) => (
                            <div key={index} className={`leaderboard-item ${entry.name === user?.name ? 'current-user' : ''}`}>
                                <div className="rank">{index + 1}</div>
                                <div className="user-info">
                                    <span className="league-icon">{getLeagueIcon(entry.league)}</span>
                                    <span className="name">{entry.name}</span>
                                </div>
                                <div className="stats">
                                    <span className="xp">{entry.xp || 0} XP</span>
                                    <span className="league">{entry.league || 'BRONZE'}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="leaderboard-list">
                    {familyLeaderboard.length === 0 ? (
                        <p className="no-data">No family leaderboard data available yet.</p>
                    ) : (
                        familyLeaderboard.map((family, index) => (
                            <div key={family._id} className="leaderboard-item">
                                <div className="rank">{index + 1}</div>
                                <div className="user-info">
                                    <span className="name">{family.name}</span>
                                    <span className="member-count">{family.members?.length || 0} members</span>
                                </div>
                                <div className="stats">
                                    <span className="xp">{family.xp || 0} XP</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Leaderboard;

