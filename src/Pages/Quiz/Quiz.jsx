import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import './Quiz.css';

const Quiz = () => {
    const { courseId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuiz = async () => {
            if (!user?._id) {
                navigate('/login');
                return;
            }
            try {
                // Backend route is GET - auth middleware sets req.body.userId from token cookie
                const response = await api.get(`/quiz/${courseId}`);
                if (response.data.success) {
                    setQuiz(response.data.quiz);
                    setAnswers(new Array(response.data.quiz.questions.length).fill(''));
                }
            } catch (error) {
                console.error("Failed to fetch quiz:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [courseId, user, navigate]);

    const handleAnswerChange = (index, value) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user?._id || !quiz) return;

        try {
            // Backend auth middleware sets req.body.userId from token cookie
            const response = await api.post(`/quiz/submit/${quiz._id}`, {
                answers: answers.map(a => parseInt(a))
            });

            if (response.data.success) {
                setSubmitted(true);
                setScore(response.data.score);
                // Refresh user data to update XP
                const userDataRes = await api.post('/auth/get-user-data');
                if (userDataRes.data.success) {
                    // Update badge/league
                    await api.post('/user/updateBadge');
                }
            }
        } catch (error) {
            console.error("Failed to submit quiz:", error);
        }
    };

    if (loading) {
        return <div className="quiz-container"><div className="loading">Loading quiz...</div></div>;
    }

    if (!quiz) {
        return <div className="quiz-container"><h2>No quiz available for this course</h2></div>;
    }

    if (submitted) {
        return (
            <div className="quiz-container">
                <div className="quiz-result">
                    <h2>Quiz Results</h2>
                    <div className={`score-display ${score >= 80 ? 'passed' : 'failed'}`}>
                        <h3>{score}%</h3>
                        <p>{score >= 80 ? '🎉 Congratulations! You passed!' : '❌ You need 80% to pass. Try again!'}</p>
                    </div>
                    {score >= 80 && <p className="xp-reward">+150 XP earned!</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="quiz-container">
            <h2>Course Quiz</h2>
            <form onSubmit={handleSubmit}>
                {quiz.questions.map((question, index) => (
                    <div key={index} className="question-card">
                        <h3>Question {index + 1}: {question.question}</h3>
                        <div className="options-list">
                            {question.options.map((option, optIndex) => (
                                <label key={optIndex} className="option-label">
                                    <input
                                        type="radio"
                                        name={`question-${index}`}
                                        value={optIndex}
                                        checked={answers[index] === optIndex.toString()}
                                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                                        required
                                    />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
                <button type="submit" className="btn-submit-quiz">Submit Quiz</button>
            </form>
        </div>
    );
};

export default Quiz;

