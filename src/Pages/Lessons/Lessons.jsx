import React from 'react';
import { useLessons } from '../../context/LessonContext';
import './Lessons.css';

const Lessons = () => {
    const { lessons } = useLessons();

    return (
        <div className="lessons-container">
            {lessons.length === 0 ? (
                <div className="empty-state">
                    <h3>No lessons yet!</h3>
                    <p>Check back later or ask an admin to upload content.</p>
                </div>
            ) : (
                lessons.map(lesson => (
                    <div className="lesson-card" key={lesson.id}>
                        <div className="card-header">
                            <span className="category-tag">{lesson.category || 'General'}</span>
                        </div>
                        <h3>{lesson.title}</h3>
                        <p>{lesson.description}</p>
                        <button className="btn-start">Start Lesson</button>
                    </div>
                ))
            )}
        </div>
    );
};

export default Lessons;
