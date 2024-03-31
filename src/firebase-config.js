import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD0aCamiq9qTAci55leK8Y3oeH-XN9Vc6c",
  authDomain: "ci601-d58bf.firebaseapp.com",
  projectId: "ci601-d58bf",
  storageBucket: "ci601-d58bf.appspot.com",
  messagingSenderId: "682948132963",
  appId: "1:682948132963:web:a65f1116fb730d8f407856"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);
export const auth = getAuth(app);