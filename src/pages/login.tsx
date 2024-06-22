import { useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from "@/firebase/firebaseConfig"
import { signInWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async () => {
        try {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/');
        } catch (error) {
        console.error('Error logging in:', error);
        }
    };

    return (
        <div className="container mx-auto p-4">
        <h1 className="text-xl font-bold mb-4">Login</h1>
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
        <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded">
            Login
        </button>
        </div>
    );
};

export default Login;