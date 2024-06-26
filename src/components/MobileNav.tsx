import React, { FC, useState, useEffect } from 'react';
import Link from 'next/link';
import { Box, Divider, Flex, IconButton, Stack, useDisclosure, Button, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay } from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { FiHome, FiUser, FiSettings, FiPenTool, FiUsers, FiBookmark, FiTruck, FiLogOut, FiHash } from 'react-icons/fi';
import { IconType } from 'react-icons';
import { FaSignOutAlt } from 'react-icons/fa';
import { auth } from '@/firebase/firebaseConfig';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/router';

interface MobileNavItemProps {
  icon: IconType;
  label: string;
  href: string;
}

const MobileNavItem: FC<MobileNavItemProps> = ({ icon, label, href }) => {
  return (
    <Link href={href}>
      <Flex className="transition-colors hover:bg-teal-500 hover:text-white cursor-pointer rounded-md mx-2.5 p-2.5 role-group text-center items-center">
        {icon && (
          <Box className="mr-3 text-base">
            {React.createElement(icon)}
          </Box>
        )}
        {label}
      </Flex>
    </Link>
  );
};

const MobileNav: FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
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
    router.push('/login');
  };

  const handleLogoutClick = () => {
    setIsAlertOpen(true);
  };

  return (
    <>
      <Box className="fixed top-0 w-full z-50 md:hidden">
        <Flex
          as="nav"
          className="transition-all min-h-[60px] py-1.5 px-3 text-gray-600 bg-white justify-between items-center"
        >
          <IconButton
            size="md"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label="Open Menu"
            onClick={isOpen ? onClose : onOpen}
            className="bg-transparent ml-auto"
          />
        </Flex>

        {isOpen ? (
          <Box className="bg-white shadow-sm pb-3 h-screen">
            <Stack as="nav" spacing={3}>
              <MobileNavItem icon={FiHome} label="Home" href="/" />
              <MobileNavItem icon={FiHash} label="Feed" href="/feed" />
              {user && <MobileNavItem icon={FiUser} label="Profile" href={`/user?id=${user.uid}`} />}
              <MobileNavItem icon={FiUsers} label="Following" href="/following" />
              <MobileNavItem icon={FiBookmark} label="Bookmarks" href="/bookmarks" />
              <MobileNavItem icon={FiPenTool} label="Editor" href="/editor" />
              <MobileNavItem icon={FiSettings} label="Settings" href="/settings" />
            </Stack>
            <Divider className='my-3' />
            <Stack as="nav" spacing={3}>
              <button onClick={handleLogoutClick} className="transition-colors hover:bg-teal-500 hover:text-white cursor-pointer rounded-md mx-2.5 p-2.5 role-group text-center items-center flex">
                <Box className="mr-3 text-base">
                  <FiLogOut />
                </Box>
                Logout
              </button>
            </Stack>
          </Box>
        ) : null}
      </Box>

      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsAlertOpen(false)}
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
              <Button ref={cancelRef} onClick={() => setIsAlertOpen(false)}>
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

export default MobileNav;