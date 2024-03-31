import './auth.css';
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDoc, getDocs, doc, addDoc } from "@firebase/firestore"
import { db, auth } from '../firebase-config'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, getAuth } from 'firebase/auth'

function Auth() {
    const [user, setUser] = useState([]);
    const [usernames, setUsernames] = useState([]);

    const auth = getAuth()
    const fireUser = auth.currentUser

    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true)

    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    useEffect(() => {
        const getUsernames = async () => {
            const docRef = doc(db, 'usernames', 'usernames');
            console.log(docRef)
            const docSnap = await getDoc(docRef);
            console.log(docSnap)
            setUsernames(docSnap.data().usernames);
        }
        getUsernames()
    }, [])


    console.log(usernames);

    const switchTabs = () => {
        isLogin ? setIsLogin(false) : setIsLogin(true);
    }

    const submitSignUp = async () => {

        if (usernames.includes(username)) {

        } else if (password != passwordConfirm) {

        } else if (!email.includes('@')) {
            console.log(email)
        } else {

        }
        console.log(username)
        console.log(password);
        console.log(passwordConfirm);
        console.log(email)

        setEmail()
        setPassword()



        // await createUserWithEmailAndPassword(auth, email, password)
        //     .then((userCredential) => {
        //         // Signed in
        //         const user = userCredential.user;
        //         console.log(user);
        //         navigate("/home")
        //         // ...
        //     })
        //     .catch((error) => {
        //         const errorCode = error.code;
        //         const errorMessage = error.message;
        //         console.log(errorCode, errorMessage);
        //         // ..
        //     });
    }

    const submitLogin = (e) => {

        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                navigate("/home")
                console.log(user);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode, errorMessage)
            });

    }


    return (
        <div className="Auth">
            {isLogin &&
                <div className='page'>
                    <div className='tabs'>
                        <a className='activeTab'>Log In</a>
                        <a className='inactiveTab' onClick={() => switchTabs()}>Sign Up</a>
                    </div>

                    <h1>Log In</h1>

                    <input type='email' placeholder='Email Address' />
                    <input type='password' placeholder='Password' />

                    <div className='buttons'>
                        <Link className="btn" to={"/home"}>Back</Link>
                        <button className='btn' onClick={() => submitLogin()}>Submit</button>
                    </div>
                </div>
            }
            {!isLogin &&
                <div className='page'>
                    <div className='tabs'>
                        <a className='inactiveTab' onClick={() => switchTabs()}>Log In</a>
                        <a className='activeTab'>Sign Up</a>
                    </div>

                    <h1>Sign Up</h1>

                    <input type='email' placeholder='Email Address' value={email} onChange={(e) => setEmail(e.target.value)}
                        required />
                    <input type='text' placeholder='Username' value={username} onChange={(e) => setUsername(e.target.value)}
                        required />
                    <input type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)}
                        required />
                    <input type='password' placeholder='Confirm Password' value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)}
                        required />

                    <div className='buttons'>
                        <Link className="btn" to={"/home"}>Back</Link>
                        <button className='btn' onClick={() => submitSignUp()}>Submit</button>
                    </div>
                </div>
            }

        </div>
    );
}

export default Auth;