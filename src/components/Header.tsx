import { Avatar, Image } from "@chakra-ui/react";
import NextLink from "next/link";
import { useEffect, useState } from "react";
import { FaBookmark, FaCog, FaHashtag, FaPen, FaSearch, FaUserFriends } from "react-icons/fa";
import { auth, db } from '@/firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function Header() {
    const [user, setUser] = useState<{ displayName: string, photoURL: string, uid: string } | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = doc(db, 'users', user.uid);
                const userSnapshot = await getDoc(userDoc);
                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data();
                    setUser({
                        displayName: userData.displayName,
                        photoURL: userData.photoURL,
                        uid: user.uid
                    });
                }
            } else {
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <header className="bg-white shadow-md sticky top-0 w-full px-6 py-3 z-50 flex flex-col items-start">
            <NextLink href="/" passHref>
                <Image src="/logo.png" alt="MemoGo" className="w-28 cursor-pointer mb-4" />
            </NextLink>
            <nav className="flex flex-col space-y-4">
                <NextLink href="/feed" passHref>
                    <div className="flex items-center space-x-2 cursor-pointer hover:text-blue-600 transition-colors">
                        <FaHashtag className="text-2xl" />
                        <span className="text-lg font-semibold">Feed</span>
                    </div>
                </NextLink>
                <NextLink href="/search" passHref>
                    <div className="flex items-center space-x-2 cursor-pointer hover:text-blue-600 transition-colors">
                        <FaSearch className="text-2xl" />
                        <span className="text-lg font-semibold">Search</span>
                    </div>
                </NextLink>
                <NextLink href="/following" passHref>
                    <div className="flex items-center space-x-2 cursor-pointer hover:text-blue-600 transition-colors">
                        <FaUserFriends className="text-2xl" />
                        <span className="text-lg font-semibold">Following</span>
                    </div>
                </NextLink>
                <NextLink href="/bookmarks" passHref>
                    <div className="flex items-center space-x-2 cursor-pointer hover:text-blue-600 transition-colors">
                        <FaBookmark className="text-2xl" />
                        <span className="text-lg font-semibold">Bookmarks</span>
                    </div>
                </NextLink>
                <NextLink href="/editor" passHref>
                    <div className="flex items-center space-x-2 cursor-pointer hover:text-blue-600 transition-colors">
                        <FaPen className="text-2xl" />
                        <span className="text-lg font-semibold">Editor</span>
                    </div>
                </NextLink>
                <NextLink href="/settings" passHref>
                    <div className="flex items-center space-x-2 cursor-pointer hover:text-blue-600 transition-colors">
                        <FaCog className="text-2xl" />
                        <span className="text-lg font-semibold">Settings</span>
                    </div>
                </NextLink>
            </nav>
            <div className="mt-4">
                {user ? (
                    <NextLink href={`/user?id=${user.uid}`} passHref>
                        <Avatar src={user.photoURL} name={user.displayName} size="sm" className="cursor-pointer" />
                    </NextLink>
                ) : (
                    <NextLink href="/login" passHref>
                        <div className="text-lg font-semibold cursor-pointer hover:text-blue-600 transition-colors">Login</div>
                    </NextLink>
                )}
            </div>
        </header>
    );
}