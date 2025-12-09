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
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                    console.log('Quiz loaded:', response.data.quiz); // Debug: see quiz structure
                    console.log('Quiz questions structure:', response.data.quiz.questions);
                    if (response.data.quiz.questions && response.data.quiz.questions.length > 0) {
                        console.log('First question full structure:', JSON.stringify(response.data.quiz.questions[0], null, 2));
                        console.log('All question keys:', response.data.quiz.questions.map(q => Object.keys(q)));
                    }
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
        if (!user?._id || !quiz || isSubmitting) return;
        setIsSubmitting(true);

        // Validate that all questions are answered
        const unansweredQuestions = answers.some(a => a === '' || a === null || a === undefined);
        if (unansweredQuestions) {
            alert('Please answer all questions before submitting.');
            setIsSubmitting(false);
            return;
        }

        try {
            // Convert answers to integers, ensuring no NaN values
            const answerArray = answers.map(a => {
                const parsed = parseInt(a);
                if (isNaN(parsed)) {
                    throw new Error('Invalid answer format');
                }
                return parsed;
            });

            // Debug: Log what we're sending
            console.log('Submitting answers:', answerArray);
            console.log('Quiz questions:', quiz.questions);
            console.log('Full quiz object:', quiz);
            console.log('First question structure:', quiz.questions?.[0]);
            console.log('Quiz correct answers (if available):', quiz.questions?.map(q => q.correctAnswer));
            console.log('Checking for correctAnswerIndex:', quiz.questions?.map(q => q.correctAnswerIndex));
            console.log('Checking for answer:', quiz.questions?.map(q => q.answer));

            // Calculate score on frontend as fallback
            // Try multiple possible field names for correct answer
            let frontendScore = 0;
            if (quiz.questions && quiz.questions.length > 0) {
                const correctCount = quiz.questions.reduce((count, question, index) => {
                    const userAnswer = answerArray[index];
                    // Try different possible field names for the correct answer
                    const correctAnswer = question.correctAnswer !== undefined
                        ? question.correctAnswer
                        : (question.correctAnswerIndex !== undefined
                            ? question.correctAnswerIndex
                            : (question.answer !== undefined
                                ? question.answer
                                : (question.correct !== undefined
                                    ? question.correct
                                    : null)));

                    console.log(`Question ${index}: User answered ${userAnswer}, Correct answer is ${correctAnswer}`, question);

                    // Compare as numbers
                    const userAnswerNum = parseInt(userAnswer);
                    const correctAnswerNum = correctAnswer !== null ? parseInt(correctAnswer) : null;

                    if (correctAnswerNum !== null && userAnswerNum === correctAnswerNum) {
                        return count + 1;
                    }
                    return count;
                }, 0);
                frontendScore = Math.round((correctCount / quiz.questions.length) * 100);
                console.log('Frontend calculated score:', frontendScore, `(${correctCount}/${quiz.questions.length} correct)`);
            }

            // Backend auth middleware sets req.body.userId from token cookie
            // Try sending as numbers first (some backends expect strings, but we'll try numbers first)
            const response = await api.post(`/quiz/submit/${quiz._id}`, {
                answers: answerArray
            });

            // If backend returns 0 and we suspect format issue, log for debugging
            console.log('Answers sent as:', answerArray, 'Type:', answerArray.map(a => typeof a));

            console.log('Full backend response:', response); // Debug log
            console.log('Backend response data:', response.data); // Debug log
            console.log('Backend response data keys:', Object.keys(response.data || {})); // Debug log
            console.log('Backend response.data.score:', response.data.score); // Debug log
            console.log('Backend response.data.score type:', typeof response.data.score); // Debug log
            console.log('Backend response.data (stringified):', JSON.stringify(response.data, null, 2)); // Debug log

            if (response.data.success) {
                // Ensure score is a number, default to 0 if not provided
                // Check multiple possible response formats
                let calculatedScore = null;

                // Try to get score from various possible locations
                if (typeof response.data.score === 'number') {
                    calculatedScore = response.data.score;
                } else if (typeof response.data.scorePercentage === 'number') {
                    calculatedScore = response.data.scorePercentage;
                } else if (typeof response.data.percentage === 'number') {
                    calculatedScore = response.data.percentage;
                } else if (typeof response.data.result?.score === 'number') {
                    calculatedScore = response.data.result.score;
                } else if (typeof response.data.result?.percentage === 'number') {
                    calculatedScore = response.data.result.percentage;
                } else if (response.data.correctAnswers !== undefined && response.data.totalQuestions !== undefined) {
                    // Calculate from correctAnswers/totalQuestions if provided
                    calculatedScore = Math.round((response.data.correctAnswers / response.data.totalQuestions) * 100);
                } else if (response.data.correct !== undefined && response.data.total !== undefined) {
                    // Calculate from correct/total if provided
                    calculatedScore = Math.round((response.data.correct / response.data.total) * 100);
                }

                console.log('Extracted score from backend:', calculatedScore);

                // Check if backend response includes correct answers or breakdown
                if (response.data.correctAnswers !== undefined || response.data.results !== undefined) {
                    console.log('Backend provided answer breakdown:', response.data.correctAnswers || response.data.results);
                }

                // Check if backend response includes questions with correct answers (for review)
                if (response.data.questions && Array.isArray(response.data.questions)) {
                    console.log('Backend response includes questions with correct answers');
                    // Update quiz with correct answers from response if available
                    const updatedQuiz = { ...quiz, questions: response.data.questions };
                    setQuiz(updatedQuiz);

                    // Recalculate score using correct answers from response
                    const correctCount = response.data.questions.reduce((count, question, index) => {
                        const userAnswer = answerArray[index];
                        const correctAnswer = question.correctAnswer !== undefined
                            ? question.correctAnswer
                            : (question.correctAnswerIndex !== undefined ? question.correctAnswerIndex : null);

                        if (correctAnswer !== null && parseInt(userAnswer) === parseInt(correctAnswer)) {
                            return count + 1;
                        }
                        return count;
                    }, 0);

                    if (correctCount > 0) {
                        const scoreFromQuestions = Math.round((correctCount / response.data.questions.length) * 100);
                        console.log('Recalculated score from backend questions:', scoreFromQuestions);
                        if (calculatedScore === 0 || calculatedScore === null) {
                            calculatedScore = scoreFromQuestions;
                        }
                    }
                }

                // Try to calculate score from backend response if it includes question results
                if (response.data.results && Array.isArray(response.data.results)) {
                    const correctFromResults = response.data.results.filter(r => r.correct === true || r.isCorrect === true).length;
                    if (correctFromResults > 0) {
                        const scoreFromResults = Math.round((correctFromResults / response.data.results.length) * 100);
                        console.log('Calculated score from backend results:', scoreFromResults);
                        if (calculatedScore === 0 || calculatedScore === null) {
                            calculatedScore = scoreFromResults;
                        }
                    }
                }

                // If backend returned 0 or didn't return a score, and we have frontend calculation, use it
                if ((calculatedScore === null || calculatedScore === undefined || isNaN(calculatedScore)) && frontendScore > 0) {
                    console.warn('Backend did not return a valid score, using frontend calculation');
                    calculatedScore = frontendScore;
                } else if (calculatedScore === null || calculatedScore === undefined || isNaN(calculatedScore)) {
                    console.warn('No valid score found, defaulting to 0');
                    calculatedScore = 0;
                }

                // If backend returned 0 but frontend calculated a different score, use frontend
                // This handles the case where backend calculation is wrong
                if (calculatedScore === 0 && frontendScore > 0) {
                    console.warn(`Backend returned 0 but frontend calculated ${frontendScore}%. Using frontend score.`);
                    calculatedScore = frontendScore;
                }

                console.log('Final calculated score:', calculatedScore); // Debug log

                setSubmitted(true);
                setScore(calculatedScore);

                // Refresh user data to update XP
                const userDataRes = await api.post('/auth/get-user-data');
                if (userDataRes.data.success) {
                    // Update badge/league
                    await api.post('/user/updateBadge');
                }
            } else {
                console.error("Quiz submission failed:", response.data.message);
                // If backend failed but we have a frontend score, use it
                if (frontendScore > 0) {
                    console.warn('Backend submission failed, but using frontend calculated score');
                    setSubmitted(true);
                    setScore(frontendScore);
                } else {
                    alert(response.data.message || 'Failed to submit quiz. Please try again.');
                }
            }
        } catch (error) {
            console.error("Failed to submit quiz:", error);
            console.error("Error details:", error.response?.data);

            // Calculate frontend score even on error
            if (quiz.questions && quiz.questions.length > 0) {
                const answerArray = answers.map(a => parseInt(a)).filter(a => !isNaN(a));
                const correctCount = quiz.questions.reduce((count, question, index) => {
                    const userAnswer = answerArray[index];
                    const correctAnswer = question.correctAnswer;
                    return count + (userAnswer === correctAnswer ? 1 : 0);
                }, 0);
                const frontendScore = Math.round((correctCount / quiz.questions.length) * 100);
                console.log('Using frontend score due to error:', frontendScore);
                setSubmitted(true);
                setScore(frontendScore);
            } else {
                const errorMessage = error.response?.data?.message || error.message || 'Failed to submit quiz. Please try again.';
                alert(errorMessage);
                setIsSubmitting(false);
            }
        }
    };

    if (loading) {
        return <div className="quiz-container"><div className="loading"><div className="loading-spinner"></div></div></div>;
    }

    if (!quiz) {
        return <div className="quiz-container"><h2>No quiz available for this course</h2></div>;
    }

    if (submitted) {
        // Ensure score is a valid number, default to 0 if not
        const displayScore = typeof score === 'number' ? score : 0;

        return (
            <div className="quiz-container">
                <div className="quiz-result">
                    <h2>Quiz Results</h2>
                    <div className={`score-display ${displayScore >= 80 ? 'passed' : 'failed'}`}>
                        <h3>{displayScore}%</h3>
                        <p>{displayScore >= 80 ? '🎉 Congratulations! You passed!' : '❌ You need 80% to pass. Try again!'}</p>
                    </div>
                    {displayScore >= 80 && <p className="xp-reward">+150 XP earned!</p>}
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
                <button type="submit" className="btn-submit-quiz" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting Quiz...' : 'Submit Quiz'}
                </button>
            </form>
        </div>
    );
};

export default Quiz;

