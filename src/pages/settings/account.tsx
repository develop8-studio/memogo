import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db, auth, storage } from '@/firebase/firebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const AccountSettings = () => {
    const [user, setUser] = useState<any>(null);
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const currentUser = auth.currentUser;
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            if (currentUser) {
                const docRef = doc(db, 'users', currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setUser(userData);
                    setDisplayName(userData.displayName);
                    setBio(userData.bio);
                }
            }
        };

        fetchUser();
    }, [currentUser]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const updateProfile = async () => {
        if (currentUser) {
            const docRef = doc(db, 'users', currentUser.uid);
            const updatedData: { [key: string]: any } = {
                displayName,
                bio,
            };

            if (file) {
                setUploading(true);
                const fileRef = ref(storage, `profilePictures/${currentUser.uid}/${file.name}`);
                await uploadBytes(fileRef, file);
                const photoURL = await getDownloadURL(fileRef);
                updatedData.photoURL = photoURL;
                setUploading(false);
            }

            await updateDoc(docRef, updatedData);
            alert('Profile updated!');
        }
    };

    const deleteAccount = async () => {
        if (currentUser) {
            await deleteDoc(doc(db, 'users', currentUser.uid));
            await deleteUser(currentUser);
            alert('Account deleted!');
            router.push('/register');
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-xl font-bold">Account Settings</h1>
            <div className="mt-4">
                <label className="block">Display Name</label>
                <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full p-2 border rounded mb-4"
                />
                <label className="block">Bio</label>
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-2 border rounded mb-4"
                />
                <label className="block">Profile Picture</label>
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full p-2 border rounded mb-4"
                />
                <button onClick={updateProfile} className="bg-blue-500 text-white px-4 py-2 rounded" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Update Profile'}
                </button>
                <button onClick={deleteAccount} className="bg-red-500 text-white px-4 py-2 rounded mt-4">
                    Delete Account
                </button>
            </div>
        </div>
    );
};

export default AccountSettings;