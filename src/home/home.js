import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import './home.css';
import { collection, getDoc, getDocs, doc, addDoc } from "@firebase/firestore"
import { db, auth } from '../firebase-config'
import { getAuth } from 'firebase/auth'



function Home() {
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState()

    const auth = getAuth()
    const fireUser = auth.currentUser

    console.log(fireUser)

    //  https://the-trivia-api.com/v2/questions?categories=
    // https://the-trivia-api.com/v2/categories
    const navigate = useNavigate();

    const [categories, setCategories] = useState(Object);

    const [displayHome, setDisplayHome] = useState(true);
    const [displayCategories, setDisplayCategories] = useState(false);
    const [displayLevels, setDisplayLevels] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const [chosenCat, setChosenCat] = useState(String);


    const url = 'https://the-trivia-api.com/v2';

    // Handle user state changes
    async function onAuthStateChanged(user) {
        if (user) {
            const userDocRefocRef = doc(db, 'users', user.uid)
            const userSnap = await getDoc(userDocRefocRef);
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

    if (initializing) return null;

    return (
        <div className="Home">
            {displayHome &&
                <div className="page">
                    <div className="side">
                        {user ?
                            <>
                                <a className="welcomeMes">Welcome, {user.username}</a>
                                <Link className="sideBtn" to={"/settings"}>Settings</Link>
                                <a className="sideBtn" onClick={() => auth.signOut()}>Log Out</a>
                            </>
                            :
                            <>
                                <Link className="sideBtn" to={"/settings"}>Settings</Link>
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
                    <h1>Category</h1>
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
                    <h1>Level</h1>
                    <ul className="categories">
                        <li onClick={() => selectedLevel('easy')}>Easy</li>
                        <li onClick={() => selectedLevel('medium')}>Medium</li>
                        <li onClick={() => selectedLevel('hard')}>Hard</li>
                        <li onClick={() => selectedLevel('')}>Random</li>
                    </ul>
                    <button className="backBtn" onClick={() => toggleLevels('')}>Back</button>
                </div>
            }
        </div>
    );
}

export default Home;