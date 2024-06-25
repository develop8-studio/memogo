import React, { useState, useEffect } from "react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import Link from "next/link";
import { auth } from '@/firebase/firebaseConfig';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/router';
import { Button, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay } from '@chakra-ui/react';
import { FaHome, FaUser, FaCog, FaSignOutAlt, FaBookmark, FaPen, FaUserFriends, FaFire } from 'react-icons/fa';

interface MenuItemProps {
    icon: React.ReactNode;
    text: string;
    href?: string; // href is optional
    onClick?: () => void; // Optional onClick handler
}

const Navbar: React.FC = () => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
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

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = async () => {
        setIsAlertOpen(false);
        await signOut(auth);
        router.push('/login');
    };

    const handleLogoutClick = () => {
        setIsAlertOpen(true);
    };

    const menuItems: MenuItemProps[] = [
        { icon: <FaHome className="text-lg" />, text: "ホーム", href: "/" },
        { icon: <FaFire className="text-lg" />, text: "フィード", href: "/feed" },
        { icon: <FaUser className="text-lg" />, text: "プロフィール", href: user ? `/user?id=${user.uid}` : undefined },
        { icon: <FaUserFriends className="text-lg" />, text: "フォロー中", href: "/following" },
        { icon: <FaBookmark className="text-lg" />, text: "ブックマーク", href: "/bookmarks" },
        { icon: <FaPen className="text-lg" />, text: "エディター", href: "/editor" },
        { icon: <FaCog className="text-lg" />, text: "設定", href: "/settings" },
        { icon: <FaSignOutAlt className="text-lg" />, text: "ログアウト", onClick: handleLogoutClick },
    ];

    return (
        <>
            <div className="fixed top-0 w-full bg-teal-500 text-white border-b border-teal-500 z-50 md:hidden">
                <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
                    <a href="/" className="font-bold">
                        ロゴ
                    </a>
                    <button
                        onClick={toggleMenu}
                        className="p-2 md:hidden"
                        aria-label="Toggle Navigation"
                    >
                        {isOpen ? <CloseIcon /> : <HamburgerIcon />}
                    </button>
                </div>
                {isOpen && (
                    <div className="md:hidden">
                        <div className="bg-teal-500 px-4 pt-2 pb-4">
                            {menuItems.map((item, index) => (
                                <MenuItem key={index} icon={item.icon} text={item.text} href={item.href} onClick={item.onClick} />
                            ))}
                        </div>
                    </div>
                )}
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
                            ログアウト
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            ログアウトしてもよろしいですか？
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                キャンセル
                            </Button>
                            <Button colorScheme="blue" onClick={handleLogout} ml={3}>
                                ログアウト
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
};

const MenuItem: React.FC<MenuItemProps> = ({ icon, text, href, onClick }) => {
    if (href) {
        return (
            <Link href={href} className="block py-2 flex items-center">
                {icon}
                <span className="ml-2">{text}</span>
            </Link>
        );
    } else {
        return (
            <button className="block py-2 flex items-center" onClick={onClick}>
                {icon}
                <span className="ml-2">{text}</span>
            </button>
        );
    }
};

export default Navbar;