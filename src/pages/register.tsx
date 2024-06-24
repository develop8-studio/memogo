import { useState } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '@/firebase/firebaseConfig';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Button, Heading, Input, Link, Text } from '@chakra-ui/react';
import Layout from '@/components/Layout';
import NextLink from "next/link"
import { FaGoogle } from "react-icons/fa"

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

    const handleGoogleSignIn = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            await setDoc(doc(db, 'users', user.uid), {
                displayName: user.displayName,
                email: user.email
            });
            router.push('/');
        } catch (error) {
            console.error('Error signing in with Google:', error);
        }
    };

    return (
        <div className="container mx-auto my-10">
            <Layout>
                <Heading size="lg" className="mb-5">Register</Heading>
                <Input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Display Name"
                    className="w-full mb-5"
                />
                <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full mb-5"
                />
                <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full mb-5"
                />
                <Button onClick={handleRegister} colorScheme='teal' className="mb-5">
                    Register
                </Button>
                <Button onClick={handleGoogleSignIn} colorScheme='gray' className="ml-3 mb-5">
                    <FaGoogle className="mr-1.5 text-gray-300" />Register with Google
                </Button>
                <Text>
                    Already have an account?{' '}
                    <Link color="blue.500">
                        <NextLink href="/login">
                            Go to Login
                        </NextLink>
                    </Link>
                </Text>
            </Layout>
        </div>
    );
};

export default Register;