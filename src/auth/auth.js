import './auth.css';
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDoc, getDocs, doc, addDoc } from "@firebase/firestore"
import { db, auth } from '../firebase-config'

function Auth() {

    const [isLogin, setIsLogin] = useState(true)

    const switchTabs = () => {
        isLogin ? setIsLogin(false) : setIsLogin(true);
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
                        <button className='btn' style={{alignSelf: 'end'}}>Submit</button>
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
                    <input type='email' placeholder='Email Address' />
                    <input type='text' placeholder='Username' />
                    <input type='password' placeholder='Password' />
                    <input type='password' placeholder='Confirm Password' />
                    <div className='buttons'>
                        <Link className="btn" to={"/home"}>Back</Link>
                        <button className='btn' style={{alignSelf: 'end'}}>Submit</button>
                    </div>
                </div>
            }

        </div>
    );
}

export default Auth;