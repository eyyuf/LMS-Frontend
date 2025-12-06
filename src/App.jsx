import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './Pages/Home/Home';
import Admin from './Pages/Admin/Admin';
import Courses from './Pages/Courses/Courses';
import CourseDetail from './Pages/CourseDetail/CourseDetail';
import Profile from './Pages/Profile/Profile';
import LessonView from './Pages/LessonView/LessonView';
import Login from './Pages/Login/Login';
import Signup from './Pages/Signup/Signup';
import ForgotPassword from './Pages/ForgotPassword/ForgotPassword';
import Footer from './components/Footer/Footer';
import { CourseProvider } from './context/CourseContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

function App() {
    return (
        <LanguageProvider>
            <AuthProvider>
                <CourseProvider>
                    <div className="app-container">
                        <Navbar />
                        <div className="main-content">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/courses" element={<Courses />} />
                                <Route path="/admin" element={<Admin />} />
                                <Route path="/course/:courseId" element={<CourseDetail />} />
                                <Route path="/course/:courseId/lesson/:lessonId" element={<LessonView />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/profile" element={<Profile />} />
                            </Routes>
                        </div>
                        <Footer />
                    </div>
                </CourseProvider>
            </AuthProvider>
        </LanguageProvider>
    );
}

export default App;
