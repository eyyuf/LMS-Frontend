import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from './AuthContext';

const CourseContext = createContext();

export const useCourses = () => useContext(CourseContext);

export const CourseProvider = ({ children }) => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [completedLessons, setCompletedLessons] = useState([]);

    // Fetch all courses
    useEffect(() => {
        const fetchCourses = async () => {
            if (!user?._id) {
                setLoading(false);
                return;
            }
            try {
                // Backend route is GET - auth middleware sets req.body.userId from token cookie
                const response = await api.get('/lessons/getallcourses');
                if (response.data.success) {
                    setCourses(response.data.courses || []);
                } else {
                    console.error("Failed to fetch courses:", response.data.message);
                    setCourses([]);
                }
            } catch (err) {
                console.error("Failed to fetch courses:", err);
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [user]);

    // Fetch enrolled courses
    useEffect(() => {
        const fetchEnrolledCourses = async () => {
            if (!user?._id) {
                setEnrolledCourses([]);
                return;
            }
            try {
                // Backend route is GET - auth middleware sets req.body.userId from token cookie
                const response = await api.get('/lessons/getEnrolledCourses');
                if (response.data.success) {
                    setEnrolledCourses(response.data.courses || []);
                } else {
                    console.error("Failed to fetch enrolled courses:", response.data.message);
                    setEnrolledCourses([]);
                }
            } catch (err) {
                console.error("Failed to fetch enrolled courses:", err);
                setEnrolledCourses([]);
            }
        };

        fetchEnrolledCourses();
    }, [user]);

    // Fetch user's completed lessons
    useEffect(() => {
        const fetchUserData = async () => {
            if (!user?._id) return;
            try {
                // Backend auth middleware sets req.body.userId from token cookie
                const response = await api.post('/auth/get-user-data');
                if (response.data.success && response.data.User.completedLessons) {
                    setCompletedLessons(response.data.User.completedLessons.map(id => id.toString()));
                }
            } catch (err) {
                console.error("Failed to fetch completed lessons:", err);
            }
        };

        fetchUserData();
    }, [user]);

    const addCourse = async (title) => {
        if (!user?._id) return { success: false, message: 'Not authenticated' };
        try {
            // Backend auth middleware sets req.body.userId from token cookie
            const response = await api.post('/lessons/createCourse', { title });
            if (response.data.success) {
                setCourses(prev => [...prev, response.data.course]);
                return { success: true, course: response.data.course };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to create course' };
        }
    };

    const addLessonToCourse = async (courseId, lessonData) => {
        if (!user?._id) return { success: false, message: 'Not authenticated' };
        try {
            const formData = new FormData();
            formData.append('title', lessonData.title);
            formData.append('order', lessonData.order);
            formData.append('text', lessonData.text);
            formData.append('xp', lessonData.xp || 50);
            // Backend auth middleware sets req.body.userId from token cookie
            if (lessonData.file) {
                formData.append('file', lessonData.file);
            }

            const response = await api.post(`/lessons/createLesson/${courseId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                // Refresh courses
                const coursesRes = await api.get('/lessons/getallcourses');
                if (coursesRes.data.success) {
                    setCourses(coursesRes.data.courses || []);
                }
                return { success: true, lesson: response.data.lesson };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to create lesson' };
        }
    };

    const deleteCourse = async (courseId) => {
        if (!user?._id) return { success: false, message: 'Not authenticated' };
        try {
            const response = await api.delete(`/lessons/deleteCourse/${courseId}`);
            if (response.data.success) {
                setCourses(prev => prev.filter(c => c._id !== courseId));
                return { success: true };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to delete course' };
        }
    };

    const enrollCourse = async (courseId) => {
        if (!user?._id) return { success: false, message: 'Not authenticated' };
        try {
            // Backend auth middleware sets req.body.userId from token cookie
            const response = await api.post(`/lessons/enrollCourse/${courseId}`);
            if (response.data.success) {
                setEnrolledCourses(prev => [...prev, response.data.course]);
                return { success: true };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to enroll' };
        }
    };

    const unenrollCourse = async (courseId) => {
        if (!user?._id) return { success: false, message: 'Not authenticated' };
        try {
            // Backend auth middleware sets req.body.userId from token cookie
            const response = await api.post(`/lessons/unenrollCourse/${courseId}`);
            if (response.data.success) {
                setEnrolledCourses(prev => prev.filter(c => c._id !== courseId));
                return { success: true };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to unenroll' };
        }
    };

    const markLessonComplete = async (lessonId) => {
        if (!user?._id) return { success: false, message: 'Not authenticated' };
        try {
            // Backend auth middleware sets req.body.userId from token cookie
            const response = await api.post(`/lessons/completeLesson/${lessonId}`);
            if (response.data.success) {
                setCompletedLessons(prev => [...prev, lessonId.toString()]);
                // Update user data to refresh XP and streak
                const userDataRes = await api.post('/auth/get-user-data');
                if (userDataRes.data.success) {
                    // Update badge/league
                    await api.post('/user/updateBadge');
                }
                return { success: true };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to complete lesson' };
        }
    };

    const getCourseProgress = (courseId) => {
        const course = courses.find(c => c._id === courseId);
        if (!course || !course.lessons || course.lessons.length === 0) return 0;

        const completed = completedLessons.filter(id => 
            course.lessons.some(lesson => lesson._id?.toString() === id || lesson.toString() === id)
        );
        return Math.round((completed.length / course.lessons.length) * 100);
    };

    const isLessonCompleted = (lessonId) => {
        return completedLessons.includes(lessonId.toString());
    };

    return (
        <CourseContext.Provider value={{
            courses,
            enrolledCourses,
            loading,
            addCourse,
            addLessonToCourse,
            deleteCourse,
            enrollCourse,
            unenrollCourse,
            markLessonComplete,
            getCourseProgress,
            isLessonCompleted,
            completedLessons
        }}>
            {children}
        </CourseContext.Provider>
    );
};
