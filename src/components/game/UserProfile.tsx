import { Box, Avatar, Text } from '@chakra-ui/react';

interface UserProfileProps {
    displayName: string;
    photoURL: string;
    bio: string;
}

const UserProfile = ({ displayName, photoURL, bio }: UserProfileProps) => {
    return (
        <Box className="border rounded-md p-3 flex items-center space-x-5 mb-10">
            <div className="w-fit h-fit  rounded-full">
                <Avatar src={photoURL} name={displayName} size="lg" />
            </div>
            <Box>
                <Text className="font-bold text-xl">{displayName}</Text>
                <Text className="text-slate-500 text-xs sm:text-sm md:whitespace-pre-line">{bio}</Text>
            </Box>
        </Box>
    );
};

export default UserProfile;