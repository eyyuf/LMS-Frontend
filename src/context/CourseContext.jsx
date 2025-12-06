import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/api';

const CourseContext = createContext();

export const useCourses = () => useContext(CourseContext);

export const CourseProvider = ({ children }) => {
    // Initial dummy data for Bible Courses
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch courses from API
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Determine endpoint based on what the backend offers, likely just /courses
                // Backend provided shows separate lesson fetching, so /courses might return course list
                const response = await api.get('/courses');
                if (response.data.success) {
                    setCourses(response.data.courses); // Adjust based on actual response structure
                } else {
                    // If backend response structure is different (e.g. array directly)
                    setCourses(Array.isArray(response.data) ? response.data : []);
                }
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch courses:", err);
                // Keep empty or load from cache if implemented
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    // State for completed lessons: { courseId: [lessonId1, lessonId2, ...] }
    const [completedLessons, setCompletedLessons] = useState(() => {
        const stored = localStorage.getItem('cozy_progress');
        return stored ? JSON.parse(stored) : {};
    });

    useEffect(() => {
        localStorage.setItem('cozy_courses', JSON.stringify(courses));
    }, [courses]);

    useEffect(() => {
        localStorage.setItem('cozy_progress', JSON.stringify(completedLessons));
    }, [completedLessons]);

    const addCourse = (newCourse) => {
        setCourses([...courses, { ...newCourse, id: Date.now(), lessons: [] }]);
    };

    const addLessonToCourse = (courseId, newLesson) => {
        setCourses(courses.map(course => {
            if (course.id === courseId) {
                return {
                    ...course,
                    lessons: [...course.lessons, { ...newLesson, id: Date.now() }]
                };
            }
            return course;
        }));
    };

    const deleteCourse = (courseId) => {
        setCourses(courses.filter(c => c.id !== courseId));
    };

    // State for user stats (streak)
    const [userStats, setUserStats] = useState(() => {
        const stored = localStorage.getItem('cozy_stats');
        return stored ? JSON.parse(stored) : { streak: 0, lastActiveDate: null };
    });

    useEffect(() => {
        localStorage.setItem('cozy_stats', JSON.stringify(userStats));
    }, [userStats]);

    // ... existing useEffects ...

    const markLessonComplete = (courseId, lessonId) => {
        setCompletedLessons(prev => {
            const courseProgress = prev[courseId] || [];
            if (courseProgress.includes(lessonId)) return prev; // Already completed

            // Update streak on new completion
            updateStreak();

            return {
                ...prev,
                [courseId]: [...courseProgress, lessonId]
            };
        });
    };

    // Fetch Streak from API on mount
    useEffect(() => {
        const fetchStreak = async () => {
            try {
                const res = await api.post('/users/getStreak');
                if (res.data.success) {
                    setUserStats(prev => ({ ...prev, streak: res.data.streak }));
                }
            } catch (e) {
                console.error("Failed to fetch streak", e);
            }
        };
        // Fetch only if user is logged in (check token existence roughly or useAuth)
        if (localStorage.getItem('token')) {
            fetchStreak();
        }
    }, []);

    const updateStreak = async () => {
        const today = new Date().toDateString();
        const lastActive = userStats.lastActiveDate;

        // Optimistic UI update logic locally first
        if (lastActive === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toDateString();

        let newStreak = 1;
        if (lastActive === yesterdayString) {
            newStreak = userStats.streak + 1;
        }

        setUserStats({ streak: newStreak, lastActiveDate: today });

        // Sync with Backend
        try {
            await api.post('/users/streak', { streak: newStreak });
        } catch (error) {
            console.error("Failed to sync streak:", error);
        }
    };

    const getCourseProgress = (courseId) => {
        const course = courses.find(c => c.id === courseId);
        if (!course || course.lessons.length === 0) return 0;

        const completed = completedLessons[courseId] || [];
        return Math.round((completed.length / course.lessons.length) * 100);
    };

    const isLessonCompleted = (courseId, lessonId) => {
        return (completedLessons[courseId] || []).includes(lessonId);
    };

    return (
        <CourseContext.Provider value={{
            courses,
            addCourse,
            addLessonToCourse,
            deleteCourse,
            markLessonComplete,
            getCourseProgress,
            isLessonCompleted,
            streak: userStats.streak
        }}>
            {children}
        </CourseContext.Provider>
    );
};
