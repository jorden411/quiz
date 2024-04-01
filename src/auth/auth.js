import './auth.css';
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDoc, getDocs, doc, addDoc, updateDoc, setDoc } from "@firebase/firestore"
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
            console.log(docSnap.data().usernames);
            setUsernames(docSnap.data().usernames);
        }
        getUsernames()
    }, [])


    const switchTabs = () => {
        isLogin ? setIsLogin(false) : setIsLogin(true);
    }

    const submitSignUp = async () => {
        console.log(usernames);
        const errMes = document.querySelector('.signupErrorMes');
        const passwordCheck = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[a-zA-Z!#$%&? "])[a-zA-Z0-9!#$%&?]{8,20}$/;
        const emailCheck = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        // Data validation
        if (username == '' || email == '' || password == '' || passwordConfirm == '') {
            errMes.textContent = "Please fill in all fields";
        } else if (!emailCheck.test(email)) {
            errMes.textContent = "Invalid email"
        } else if (usernames.includes(username)) {
            errMes.textContent = "Username in use";
        } else if (password != passwordConfirm) {
            errMes.textContent = "Passwords don't match"
        } else if (!passwordCheck.test(password)) {
            errMes.textContent = "Password must contain an uppercase letter, a symbol, a number and be between 8 and 20 characters"
        } else {
            // Add loading spinner

            // Create user account
            await createUserWithEmailAndPassword(auth, email, password)
                .then(async (userCredential) => {
                    // Signed in
                    const user = userCredential.user;
                    console.log(user);

                    // Add username to usernames array
                    const docRef = doc(db, 'usernames', 'usernames');
                    await updateDoc(docRef, {usernames: [...usernames, username]});

                    // Create user account reference in database
                    const userDocRef = doc(db, 'users', userCredential.user.uid)
                    await setDoc(userDocRef, {uid: userCredential.user.uid, username: username, email: email})

                    // ...
                    navigate("/home")
                    
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log(errorCode, errorMessage);
                    errMes.textContent = errorMessage;
                    // ..
                });
        }
    }

    const submitLogin = async () => {
        const errMes = document.querySelector('.loginErrorMes');
        await signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;


                navigate("/home");
                console.log(user);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode);
                if (errorCode == 'auth/invalid-password' || errorCode == 'auth/invalid-email') {
                    errMes.textContent = "Email and/or Password don't match. Please try again.";
                } else {
                    errMes.textContent = "Error please refresh and try again.";
                }
                
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

                    <input type='email' placeholder='Email Address' value={email} onChange={(e) => setEmail(e.target.value)} required/>
                    <input type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} required/>

                    <p className='loginErrorMes'></p>

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

                    <input type='email' placeholder='Email Address' value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type='text' placeholder='Username' value={username} onChange={(e) => setUsername(e.target.value)} required />
                    <input type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <input type='password' placeholder='Confirm Password' value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required />

                    <p className='signupErrorMes'></p>

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