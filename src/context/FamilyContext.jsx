import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from './AuthContext';

const FamilyContext = createContext(undefined);

export const useFamily = () => {
    const context = useContext(FamilyContext);
    if (context === undefined) {
        throw new Error('useFamily must be used within a FamilyProvider');
    }
    return context;
};

export const FamilyProvider = ({ children }) => {
    let user = null;
    try {
        const authContext = useAuth();
        user = authContext?.user || null;
    } catch (error) {
        console.error("Error accessing auth context in FamilyProvider:", error);
        // Continue with user as null
    }
    const [family, setFamily] = useState(null);
    const [families, setFamilies] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch user's family
    useEffect(() => {
        const fetchUserFamily = async () => {
            if (!user?._id) {
                setFamily(null);
                setLoading(false);
                return;
            }

            try {
                // Backend route is GET - auth middleware sets req.body.userId from token cookie
                const res = await api.get('/family/getFamilies');
                if (res.data.success) {
                    const userFamily = res.data.families.find(f => 
                        f.members.some(m => m._id?.toString() === user._id || m.toString() === user._id)
                    );
                    if (userFamily) {
                        setFamily(userFamily);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch family:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserFamily();
    }, [user]);

    // Fetch all families for leaderboard
    useEffect(() => {
        const fetchFamilies = async () => {
            try {
                // Backend route is GET - auth middleware sets req.body.userId from token cookie
                const res = await api.get('/family/famLeaderboard');
                if (res.data.success) {
                    setFamilies(res.data.families || []);
                }
            } catch (error) {
                console.error("Failed to fetch families:", error);
            }
        };

        fetchFamilies();
    }, []);

    const createFamily = async (name, memberEmails) => {
        if (!user?._id) return { success: false, message: 'Not authenticated' };
        try {
            // Create the family
            const response = await api.post('/family/createFamily', { 
            name,
                memebrEmail: memberEmails || [] 
            });
            if (response.data.success) {
                const createdFamily = response.data.family;
                
                // After creating family, add the current user as a member using addMember
                // This ensures the creator is properly added with their XP
                try {
                    const addMemberResponse = await api.post(`/family/addMember/${createdFamily._id}`);
                    if (addMemberResponse.data.success) {
                        // Refresh family data to get updated info
                        const familyRes = await api.get(`/family/getFamily/${createdFamily._id}`);
                        if (familyRes.data.success) {
                            setFamily(familyRes.data.family);
                            return { success: true, family: familyRes.data.family };
                        }
                    }
                } catch (addMemberError) {
                    // If addMember fails (e.g., user already in family), continue with created family
                    console.log("Note: Could not add member after creation:", addMemberError);
                }
                
                // Set family even if addMember had issues
                setFamily(createdFamily);
                return { success: true, family: createdFamily };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to create family' };
        }
    };

    const getFamily = async (familyId) => {
        try {
            const response = await api.get(`/family/getFamily/${familyId}`);
            if (response.data.success) {
                return { success: true, family: response.data.family };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to fetch family' };
        }
    };

    const leaveFamily = async (familyId) => {
        if (!user?._id) return { success: false, message: 'Not authenticated' };
        try {
            // Backend auth middleware sets req.body.userId from token cookie
            const response = await api.delete(`/family/leaveFamily/${familyId}`);
            if (response.data.success) {
                setFamily(null);
        return { success: true };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to leave family' };
        }
    };

    const addMember = async (familyId, email) => {
        if (!user?._id) return { success: false, message: 'Not authenticated' };
        if (!email) return { success: false, message: 'Email is required' };
        try {
            // Backend expects email in req.body
            const response = await api.post(`/family/addMember/${familyId}`, { email });
            if (response.data.success) {
                // Refresh family data
                const familyRes = await api.get(`/family/getFamily/${familyId}`);
                if (familyRes.data.success) {
                    setFamily(familyRes.data.family);
                }
                return { success: true, message: response.data.message };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to add member to family' };
        }
    };

    return (
        <FamilyContext.Provider value={{ 
            family, 
            families,
            loading, 
            createFamily, 
            getFamily,
            leaveFamily,
            addMember 
        }}>
            {children}
        </FamilyContext.Provider>
    );
};
