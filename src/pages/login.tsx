import { useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from "@/firebase/firebaseConfig";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import Layout from '@/components/Layout';
import { Button, Heading, Input, Text, Link } from '@chakra-ui/react';
import NextLink from "next/link"
import { FaGoogle } from "react-icons/fa"

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

    const handleGoogleSignIn = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            router.push('/');
        } catch (error) {
            console.error('Error signing in with Google:', error);
        }
    };

    return (
        <div className="container mx-auto my-10">
            <Layout>
                <Heading size="lg" className="mb-5">Login</Heading>
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
                <Button onClick={handleLogin} colorScheme='blue' className="mb-5">
                    Login
                </Button>
                <Button onClick={handleGoogleSignIn} colorScheme='gray' className="ml-3 mb-5">
                    <FaGoogle className="mr-1.5 text-gray-300" />Login with Google
                </Button>
                <Text>
                    Don&apos;t have an account?{' '}
                    <Link color="blue.500">
                        <NextLink href="/register">
                            Go to Register
                        </NextLink>
                    </Link>
                </Text>
            </Layout>
        </div>
    );
};

export default Login;