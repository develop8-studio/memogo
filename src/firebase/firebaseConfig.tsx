// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyB9XUdyFTIrhtb1XgAmhXD-UNhHu1pNgg8",
    authDomain: "memogo-fb41e.firebaseapp.com",
    projectId: "memogo-fb41e",
    storageBucket: "memogo-fb41e.appspot.com",
    messagingSenderId: "1071063746596",
    appId: "1:1071063746596:web:1567a086247576d53cf0b1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth };