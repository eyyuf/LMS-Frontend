import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        // Try to get from cookie
        const match = document.cookie.match(new RegExp('(^| )language=([^;]+)'));
        return match ? match[2] : 'en';
    });

    useEffect(() => {
        // Save to cookie on change (expires in 1 year)
        const date = new Date();
        date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
        document.cookie = `language=${language}; expires=${date.toUTCString()}; path=/`;
    }, [language]);

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'am' : 'en');
    };

    // Dictionary for translations
    const translations = {
        en: {
            home: "Home",
            courses: "Courses",
            profile: "Profile",
            admin: "Admin",
            login: "Login",
            logout: "Logout",
            heroTitle: "Walking in Wisdom",
            heroSubtitle: "Grow your faith with our curated Bible courses.",
            footerMotto: "Walking in wisdom, growing in faith.",
            rights: "All rights reserved."
        },
        am: {
            home: "መነሻ",
            courses: "ትምህርቶች",
            profile: "መገለጫ",
            admin: "አስተዳደር",
            login: "ግባ",
            logout: "ውጣ",
            heroTitle: "በጥበብ መመላለስ",
            heroSubtitle: "በተመረጡ የመጽሐፍ ቅዱስ ትምህርቶቻችን እምነትዎን ያሳድጉ።",
            footerMotto: "በጥበብ መመላለስ ፣ በእምነት ማደግ።",
            rights: "መብቱ በህግ የተጠበቀ ነው።"
        }
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t: translations[language] }}>
            {children}
        </LanguageContext.Provider>
    );
};
