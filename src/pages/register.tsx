import { useState } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '@/firebase/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const router = useRouter();

    const handleRegister = async () => {
        try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(db, 'users', user.uid), {
            displayName,
            email
        });
        router.push('/');
        } catch (error) {
        console.error('Error registering:', error);
        }
    };

    return (
        <div className="container mx-auto p-4">
        <h1 className="text-xl font-bold mb-4">Register</h1>
        <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display Name"
            className="w-full p-2 border rounded mb-4"
        />
        <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-2 border rounded mb-4"
        />
        <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 border rounded mb-4"
        />
        <button onClick={handleRegister} className="bg-blue-500 text-white px-4 py-2 rounded">
            Register
        </button>
        </div>
    );
};

export default Register;