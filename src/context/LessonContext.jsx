import React, { createContext, useState, useEffect, useContext } from 'react';

const LessonContext = createContext();

export const useLessons = () => useContext(LessonContext);

export const LessonProvider = ({ children }) => {
    // Initialize from localStorage or default data
    const [lessons, setLessons] = useState(() => {
        const savedLessons = localStorage.getItem('cozy_lessons');
        return savedLessons ? JSON.parse(savedLessons) : [
            { id: 1, title: 'React Basics', description: 'Learn the fundamentals of React, Components, and Props.', category: 'Frontend' },
            { id: 2, title: 'Advanced State Management', description: 'Deep dive into Context API, Redux, and Zustand.', category: 'Frontend' },
            { id: 3, title: 'Node.js Essentials', description: 'Build scalable backend APIs using Node and Express.', category: 'Backend' }
        ];
    });

    useEffect(() => {
        localStorage.setItem('cozy_lessons', JSON.stringify(lessons));
    }, [lessons]);

    const addLesson = (lesson) => {
        const newLesson = { ...lesson, id: Date.now() };
        setLessons([...lessons, newLesson]);
    };

    const deleteLesson = (id) => {
        setLessons(lessons.filter(lesson => lesson.id !== id));
    };

    return (
        <LessonContext.Provider value={{ lessons, addLesson, deleteLesson }}>
            {children}
        </LessonContext.Provider>
    );
};
