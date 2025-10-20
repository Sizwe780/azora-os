import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/config.js';

const useProfile = () => {
    const [profile, setProfile] = useState({
        name: 'Loading...',
        role: 'Driver',
        avatarUrl: 'https://placehold.co/100x100/1e293b/a7f3d0?text=A',
        status: 'online',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setProfile({
                    name: `Driver-${user.uid.substring(0, 6)}`,
                    role: 'Lead Driver',
                    avatarUrl: `https://placehold.co/100x100/1e293b/a7f3d0?text=${user.uid.charAt(0).toUpperCase()}`,
                    status: 'online',
                });
            } else {
                setProfile({
                    name: 'Anonymous',
                    role: 'Observer',
                    avatarUrl: 'https://placehold.co/100x100/1e293b/f8fafc?text=?',
                    status: 'offline',
                });
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    return { profile, loading };
};
export default useProfile;