import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import './home.css';
import { collection, getDoc, getDocs, doc, addDoc, setDoc } from "@firebase/firestore"
import { db, auth } from '../firebase-config'
import { getAuth } from 'firebase/auth'
import { PollyClient, SynthesizeSpeechCommand, StartSpeechSynthesisTaskCommand, GetSpeechSynthesisTaskCommand, GetSpeechSynthesisTaskCommandOutput } from "@aws-sdk/client-polly";



function Home() {
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState()

    const auth = getAuth()
    const fireUser = auth.currentUser

    //  https://the-trivia-api.com/v2/questions?categories=
    // https://the-trivia-api.com/v2/categories
    const navigate = useNavigate();

    const [categories, setCategories] = useState(Object);

    const [displayHome, setDisplayHome] = useState(true);
    const [displayCategories, setDisplayCategories] = useState(false);
    const [displayLevels, setDisplayLevels] = useState(false);
    const [displaySettings, setDisplaySettings] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const [chosenCat, setChosenCat] = useState(String);

    const [textResponse, setTextResponse] = useState();
    const [taskId, setTaskId] = useState(String);

    const url = 'https://the-trivia-api.com/v2';

    // Handle user state changes
    async function onAuthStateChanged(user) {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid)
            const userSnap = await getDoc(userDocRef);
            setUser(userSnap.data());

            console.log(userSnap.data())
        }

        if (initializing) setInitializing(false);
    }

    useEffect(() => {
        const subscriber = auth.onAuthStateChanged(onAuthStateChanged);

        return subscriber; // unsubscribe on unmount
    }, []);

    useEffect(() => {
        const fetchCats = async () => {
            setIsLoading(true);

            await fetch(`${url}/categories`)
                .then((res) => { return res.json(); })
                .then((data) => {
                    setCategories(data);
                })
                .catch((err) => {
                    console.log(err.message);
                });
            setIsLoading(false);
        }

        fetchCats();
    }, []);

    const toggleSettings = () => {
        if (displaySettings) {
            setDisplayHome(true)
            setDisplaySettings(false)
        } else {
            setDisplayHome(false);
            setDisplaySettings(true);
        }
    }

    const toggleCats = () => {
        if (displayCategories) {
            setDisplayCategories(false)
            setDisplayHome(true)
        } else {
            setDisplayCategories(true)
            setDisplayHome(false)
        }
    };
    const toggleLevels = (cat) => {
        if (displayLevels) {
            setDisplayCategories(true)
            setDisplayLevels(false)
            setChosenCat(cat)
        } else {
            setDisplayLevels(true)
            setDisplayCategories(false)
            setChosenCat(cat)
        }
    };

    const selectedLevel = (lvl) => {
        console.log(chosenCat)
        let cat = chosenCat.replaceAll(' ', '_')
        cat = cat.replaceAll('&', 'and');
        cat = cat.toLowerCase();
        console.log(cat);
        navigate('/quiz', { state: { cat: cat, level: lvl } })
    }

    const goToLeaderboard = () => {
        navigate('/leaderboard', { state: Object.keys(categories) })
    }

    const signOut = () => {
        auth.signOut();
        window.location.reload()
    }

    const save = async () => {
        const checked = document.querySelector('input[name="tts"]:checked');

        const newTTSVal = checked.value == 'on' ? true : false;
        console.log(checked);
        console.log(checked.value);
        console.log(newTTSVal)
        const userDocRef = doc(db, 'users', user.uid)
        const updateDoc = await setDoc(userDocRef, { ...user, tts: newTTSVal })
        setUser({ ...user, tts: newTTSVal })
        toggleSettings()
    }



    if (initializing) return null;

    return (
        <div className="Home">
            {/* <audio className="TTS" src=""></audio> */}
            {displayHome &&
                <div className="page">
                    <div className="side">
                        {user ?
                            <>
                                <a className="welcomeMes">Welcome, {user.username}</a>
                                <a className="sideBtn" onClick={() => toggleSettings()}>Settings</a>
                                <a className="sideBtn" onClick={() => signOut()}>Log Out</a>
                            </>
                            :
                            <>
                                <Link className="sideBtn" to={"/auth"}>Sign In</Link>
                            </>
                        }


                    </div>

                    <h1>CI601 Quiz</h1>

                    <button onClick={toggleCats}>Start a Quiz!</button>

                    <button className="btn" onClick={goToLeaderboard}>Leaderboard</button>
                </div>
            }
            {displayCategories &&
                <div className="page">
                    <h1>Categories</h1>

                    <ul className="categories">
                        {
                            Object.keys(categories).map((cat, index) => {
                                return <li key={index} onClick={() => toggleLevels(cat)}>{cat}</li>
                            })}
                    </ul>
                    <button className="backBtn" onClick={toggleCats}>Back</button>
                </div>
            }
            {displayLevels &&
                <div className="page">
                    <h1>Categories</h1>
                    <ul className="levels">
                        <li onClick={() => selectedLevel('easy')}>Easy</li>
                        <li onClick={() => selectedLevel('medium')}>Medium</li>
                        <li onClick={() => selectedLevel('hard')}>Hard</li>
                    </ul>
                    <button className="backBtn" onClick={() => toggleLevels('')}>Back</button>
                </div>
            }
            {displaySettings &&
                <div className="page">
                    <h1>Settings</h1>
                    <div className="settings">
                        <h3>Text-to-Speech:</h3>
                        {user.tts ?
                            <>
                                <label htmlFor="on">On
                                    <input type="radio" id="on" name="tts" value="on" defaultChecked /></label>
                                <label htmlFor="off">Off
                                    <input type="radio" id="off" name="tts" value="off" /></label>
                            </>
                            :
                            <>
                                <label htmlFor="on">On
                                    <input type="radio" id="on" name="tts" value="on" /></label>
                                <label htmlFor="off">Off
                                    <input type="radio" id="off" name="tts" value="off" defaultChecked /></label>
                            </>
                        }


                    </div>


                    <button className="backBtn" onClick={() => save()}>Save</button>
                    <button className="backBtn" onClick={() => toggleSettings('')}>Back</button>
                </div>
            }
        </div>
    );
}

export default Home;