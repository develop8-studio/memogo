import React, { useState, useEffect } from 'react';
import { FaHome, FaUser, FaCog, FaSignOutAlt, FaBookmark, FaPen, FaUserFriends, FaFile, FaFire } from 'react-icons/fa';
import Link from 'next/link';
import { auth } from '@/firebase/firebaseConfig';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/router';

interface MenuItemProps {
    icon: React.ReactNode;
    href?: string; // href is optional
    onClick?: () => void; // Optional onClick handler
}

const SideBar: React.FC = () => {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/login');
    };

    return (
        <div className="hidden md:flex sticky top-0 h-screen w-16 flex-col bg-gray-800 text-white shadow-sm">
            <div className="flex-grow">
                <MenuItem icon={<FaHome className="text-lg" />} href="/" />
                <MenuItem icon={<FaFire className="text-lg" />} href="/feed" />
                {user && <MenuItem icon={<FaUser className="text-lg" />} href={`/user?id=${user.uid}`} />}
                <MenuItem icon={<FaUserFriends className="text-lg" />} href="/following" />
                <MenuItem icon={<FaBookmark className="text-lg" />} href="/bookmarks" />
                <MenuItem icon={<FaPen className="text-lg" />} href="/editor" />
                <MenuItem icon={<FaCog className="text-lg" />} href="/settings" />
            </div>
            <div>
                <MenuItem icon={<FaSignOutAlt className="text-lg" />} onClick={handleLogout} />
            </div>
        </div>
    );
};

const MenuItem: React.FC<MenuItemProps> = ({ icon, href, onClick }) => {
    if (href) {
        return (
            <Link href={href} className="h-16 flex items-center justify-center transition-colors hover:bg-gray-500 rounded-tl-md rounded-bl-md">
                {icon}
            </Link>
        );
    } else {
        return (
            <button className="h-16 w-full flex items-center justify-center transition-colors hover:bg-gray-500 rounded-tl-md rounded-bl-md" onClick={onClick}>
                {icon}
            </button>
        );
    }
};

export default SideBar;