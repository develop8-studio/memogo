import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import Layout from "@/components/Layout";
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Textarea,
    Text,
    VStack,
    useToast,
} from "@chakra-ui/react";

export default function Support() {
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const toast = useToast();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
        await addDoc(collection(db, "forms"), {
            name,
            email,
            message,
            timestamp: new Date(),
        });
        toast({
            title: "Form submitted.",
            description: "Your message has been sent.",
            status: "success",
            duration: 5000,
            isClosable: true,
        });
        setName("");
        setEmail("");
        setMessage("");
        } catch (error: unknown) {
        if (error instanceof Error) {
            toast({
            title: "Error submitting form.",
            description: error.message,
            status: "error",
            duration: 5000,
            isClosable: true,
            });
        }
        }
    };

    return (
        <div className="container mx-auto my-10">
        <Layout>
            <Heading as="h1" size="2xl" mb={6}>Support</Heading>
            
            <VStack spacing={10} align="stretch">
            <Box>
                <Heading as="h2" size="xl" mb={4}>Frequently Asked Questions</Heading>
                <Box mb={4}>
                <Heading as="h3" size="lg" mb={2}>How do I change my account settings?</Heading>
                <Text>
                    To change your account settings, navigate to the settings page after logging in. Here you can update your personal information, change your password, and adjust your notification preferences.
                </Text>
                </Box>
            </Box>

            <Box>
                <Heading as="h2" size="xl" mb={4}>Support Form</Heading>
                <form onSubmit={handleSubmit}>
                <VStack spacing={4} align="stretch">
                    <FormControl id="name" isRequired>
                    <FormLabel>Name</FormLabel>
                    <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                    </FormControl>
                    <FormControl id="email" isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </FormControl>
                    <FormControl id="message" isRequired>
                    <FormLabel>Message</FormLabel>
                    <Textarea rows={6} value={message} onChange={(e) => setMessage(e.target.value)} />
                    </FormControl>
                    <Button colorScheme="teal" type="submit">Submit</Button>
                </VStack>
                </form>
            </Box>
            </VStack>
        </Layout>
        </div>
    );
}