import React, { useState, useEffect } from 'react';
import { FaHome, FaUser, FaCog, FaSignOutAlt, FaBookmark, FaPen, FaUserFriends, FaHashtag, FaSearch, FaSignInAlt } from 'react-icons/fa';
import Link from 'next/link';
import { auth } from '@/firebase/firebaseConfig';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/router';
import { Button, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Image } from '@chakra-ui/react';
import { FiBook, FiBookmark, FiFeather, FiHash, FiLogIn, FiLogOut, FiMeh, FiPenTool, FiSearch, FiSettings, FiUser, FiUserPlus } from 'react-icons/fi';

interface MenuItemProps {
    icon: React.ReactNode;
    href?: string;
    onClick?: () => void;
}

const SideBar: React.FC = () => {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const onClose = () => setIsAlertOpen(false);
    const cancelRef = React.useRef<HTMLButtonElement>(null);

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
        setIsAlertOpen(false);
        await signOut(auth);
        // router.push('/login');
    };

    const handleLogoutClick = () => {
        setIsAlertOpen(true);
    };

    return (
        <>
            <div className="hidden md:flex sticky top-0 h-screen w-16 flex-col bg-white text-black shadow-sm border-r">
                <Link href="/" className='p-3'>
                    <Image src="/memogo.png" className="rounded-md" />
                </Link>
                <div className="flex-grow">
                    {/* <MenuItem icon={<FaHome className="text-lg" />} href="/" /> */}
                    <MenuItem icon={<FiHash className="text-lg" />} href="/feed" />
                    <MenuItem icon={<FiSearch className="text-lg" />} href="/search" />
                    {user && <MenuItem icon={<FiUser className="text-lg" />} href={`/user?id=${user.uid}`} />}
                    {user && <MenuItem icon={<FiUserPlus className="text-lg" />} href='/following' />}
                    {user && <MenuItem icon={<FiBookmark className="text-lg" />} href='/bookmarks' />}
                    {user && <MenuItem icon={<FiFeather className="text-lg" />} href='/editor' />}
                    {/* {user && <MenuItem icon={<FiSettings className="text-lg" />} href='/settings' />} */}
                </div>
                <div>
                    {!user && <MenuItem icon={<FiLogIn className="text-lg" />} href='/login' />}
                    {user && <MenuItem icon={<FiLogOut className="text-lg" />} onClick={handleLogoutClick} />}
                </div>
            </div>

            <AlertDialog
                isOpen={isAlertOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Logout
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure you want to log out?
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="blue" onClick={handleLogout} ml={3}>
                                Logout
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
};

const MenuItem: React.FC<MenuItemProps> = ({ icon, href, onClick }) => {
    if (href) {
        return (
            <Link href={href} className="h-16 flex items-center justify-center">
                {icon}
            </Link>
        );
    } else {
        return (
            <button className="h-16 w-full flex items-center justify-center" onClick={onClick}>
                {icon}
            </button>
        );
    }
};

export default SideBar;