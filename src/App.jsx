import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import Quiz from './Pages/Quiz/Quiz';
import Leaderboard from './Pages/Leaderboard/Leaderboard';
import Blog from './Pages/Blog/Blog';
import VerifyAccount from './Pages/VerifyAccount/VerifyAccount';
import Premium from './Pages/Premium/Premium';
import PaymentSuccess from './Pages/PaymentSuccess/PaymentSuccess';
import PaymentCancel from './Pages/PaymentCancel/PaymentCancel';
import Footer from './components/Footer/Footer';
import { CourseProvider } from './context/CourseContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FamilyProvider } from './context/FamilyContext';

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

const AppContent = () => {
    const { needsVerification } = useAuth();

    if (needsVerification) {
        return (
            <div className="app-container">
                <Routes>
                    <Route path="/verify-account" element={<VerifyAccount />} />
                    <Route path="*" element={<Navigate to="/verify-account" />} />
                </Routes>
            </div>
        )
    }

    return (
        <CourseProvider>
            <FamilyProvider>
                <div className="app-container">
                    <Navbar />
                    <div className="main-content">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/courses" element={<Courses />} />
                            <Route path="/admin" element={<Admin />} />
                            <Route path="/course/:courseId" element={<CourseDetail />} />
                            <Route path="/course/:courseId/lesson/:lessonId" element={<LessonView />} />
                            <Route path="/course/:courseId/quiz" element={<Quiz />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/leaderboard" element={<Leaderboard />} />
                            <Route path="/blog" element={<Blog />} />
                            <Route path="/premium" element={<Premium />} />
                            <Route path="/complete" element={<PaymentSuccess />} />
                            <Route path="/cancel" element={<PaymentCancel />} />
                            <Route path="/verify-account" element={<VerifyAccount />} />
                        </Routes>
                    </div>
                    <Footer />
                </div>
            </FamilyProvider>
        </CourseProvider>
    );
};
export default App;
