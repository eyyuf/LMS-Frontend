import React, { createContext, useState, useContext, useEffect } from 'react';

const LessonContext = createContext();

export const useLesson = () => useContext(LessonContext);

export const LessonProvider = ({ children }) => {
    // We can migrate lesson-specific logic here if needed
    // Currently properly handled in CourseContext, but setting up structure for future expansion

    // Example: tracking reading time, notes per lesson, etc.
    const [lessonNotes, setLessonNotes] = useState(() => {
        const stored = localStorage.getItem('cozy_lesson_notes');
        return stored ? JSON.parse(stored) : {};
    });

    useEffect(() => {
        localStorage.setItem('cozy_lesson_notes', JSON.stringify(lessonNotes));
    }, [lessonNotes]);

    const saveNote = (lessonId, note) => {
        setLessonNotes(prev => ({
            ...prev,
            [lessonId]: note
        }));
    };

    const getNote = (lessonId) => {
        return lessonNotes[lessonId] || '';
    };

    return (
        <LessonContext.Provider value={{
            lessonNotes,
            saveNote,
            getNote
        }}>
            {children}
        </LessonContext.Provider>
    );
};
