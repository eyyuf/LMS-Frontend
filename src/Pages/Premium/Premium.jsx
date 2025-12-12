import React from 'react';
import './Premium.css';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const Premium = () => {
    const { user } = useAuth();

    const plans = [
        {
            id: 1,
            name: "Monthly",
            price: 2.29,
            duration: "month",
            pkg: 30,
            features: ["All Premium Courses", "Certificate of Completion", "Priority Support"]
        },
        {
            id: 2,
            name: "6 Months",
            price: 10.99,
            duration: "6 months",
            pkg: 180,
            features: ["All Monthly Features", "Save $20", "Exclusive Webinars"]
        },
        {
            id: 3,
            name: "Yearly",
            price: 22.99,
            duration: "year",
            pkg: 365,
            features: ["All Monthly Features", "Save $200", "1-on-1 Mentorship"]
        }
    ];

    const handleSubscribe = async (pkg) => {
        if (!user) {
            alert("Please login to subscribe");
            return;
        }
        try {
            const response = await api.post('/premium/buy-premium', { userId: user._id, pkg });
            if (response.data.success && response.data.url) {
                window.location.href = response.data.url;
            } else {
                alert(response.data.message || "Failed to initiate payment");
            }
        } catch (error) {
            console.error("Payment Error:", error);
            alert("An error occurred while processing your request.");
        }
    };

    return (
        <div className="premium-container">
            <div className="premium-hero">
                <h1>Unlock <span className="highlight">Premium</span> Access</h1>
                <p>Take your learning journey to the next level with exclusive features.</p>
            </div>

            <div className="premium-content">
                <div className="features-section">
                    <h2>Why Go Premium?</h2>
                    <ul className="features-list">
                        <li>
                            <span className="feature-icon">🚀</span>
                            <div className="feature-text">
                                <h3>Unlimited Course Access</h3>
                                <p>Get access to all premium courses and workshops.</p>
                            </div>
                        </li>
                        <li>
                            <span className="feature-icon">💎</span>
                            <div className="feature-text">
                                <h3>Exclusive Content</h3>
                                <p>Deep dive into advanced topics with premium-only materials.</p>
                            </div>
                        </li>
                        <li>
                            <span className="feature-icon">🏆</span>
                            <div className="feature-text">
                                <h3>Priority Leaderboard</h3>
                                <p>Stand out with a premium badge on the leaderboard.</p>
                            </div>
                        </li>
                        <li>
                            <span className="feature-icon">⚡</span>
                            <div className="feature-text">
                                <h3>Ad-Free Experience</h3>
                                <p>Focus on learning without any distractions.</p>
                            </div>
                        </li>
                    </ul>
                </div>

                <div className="plans-container" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', flex: 2 }}>
                    {user?.premium ? (
                        <div className="already-premium pricing-card" style={{ width: '100%', maxWidth: '500px' }}>
                            <h2>You are a Premium Member!</h2>
                            <p>Enjoy all the benefits.</p>
                            <button className="premium-btn disabled" disabled>Active</button>
                        </div>
                    ) : (
                        plans.map((plan) => (
                            <div key={plan.id} className="pricing-card" style={{ minWidth: '300px' }}>
                                {plan.id === 2 && <div className="popular-tag">Best Value</div>}
                                <h3 className="plan-name">{plan.name}</h3>
                                <div className="price">
                                    <span className="currency">$</span>
                                    <span className="amount">{plan.price}</span>
                                    <span className="period">/{plan.duration}</span>
                                </div>
                                <ul className="plan-features">
                                    {plan.features.map((feature, index) => (
                                        <li key={index}>✓ {feature}</li>
                                    ))}
                                </ul>
                                <button className="premium-btn" onClick={() => handleSubscribe(plan.pkg)}>
                                    Choose Plan
                                </button>
                                <p className="guarantee">30-day money-back guarantee</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Premium;
