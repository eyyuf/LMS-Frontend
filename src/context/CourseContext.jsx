import React, { createContext, useState, useContext, useEffect } from 'react';

const CourseContext = createContext();

export const useCourses = () => useContext(CourseContext);

export const CourseProvider = ({ children }) => {
    // Initial dummy data for Bible Courses
    const [courses, setCourses] = useState(() => {
        const savedCourses = localStorage.getItem('cozy_courses');
        return savedCourses ? JSON.parse(savedCourses) : [
            {
                id: 1,
                title: 'Gospel of John',
                description: 'Explore the life and deity of Christ through the eyes of the beloved disciple.',
                category: 'New Testament',
                lessons: [
                    { id: 101, title: 'In the Beginning', scripture: 'John 1:1-18', content: 'The Word was with God, and the Word was God. This introduction sets the stage for the rest of the Gospel...' },
                    { id: 102, title: 'The Wedding at Cana', scripture: 'John 2:1-11', content: 'Jesus transforms water into wine, signifying the new covenant joy...' }
                ]
            },
            {
                id: 2,
                title: 'Walking in Wisdom',
                description: 'A study of Proverbs for daily living and spiritual maturity.',
                category: 'Old Testament',
                lessons: [
                    { id: 201, title: 'The Fear of the Lord', scripture: 'Proverbs 1:7', content: 'The beginning of knowledge starts with reverence for God...' },
                    { id: 202, title: 'Trust in the Lord', scripture: 'Proverbs 3:5-6', content: 'Lean not on your own understanding, but in all your ways acknowledge Him...' }
                ]
            },
            {
                id: 3,
                title: 'Ephesians: United in Christ',
                description: 'Discover your identity and spiritual blessings in Christ Jesus.',
                category: 'Epistles',
                lessons: []
            }
        ];
    });

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

    const markLessonComplete = (courseId, lessonId) => {
        setCompletedLessons(prev => {
            const courseProgress = prev[courseId] || [];
            if (courseProgress.includes(lessonId)) return prev; // Already completed
            return {
                ...prev,
                [courseId]: [...courseProgress, lessonId]
            };
        });
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
            isLessonCompleted
        }}>
            {children}
        </CourseContext.Provider>
    );
};
