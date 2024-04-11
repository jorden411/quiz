import { Link, parsePath, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import './leaderboard.css';
import { db, auth } from '../firebase-config'
import { collection, getDoc, getDocs, doc, addDoc, query, orderBy, limit, where } from "@firebase/firestore"
import { getAuth } from 'firebase/auth'



function Leaderboard() {
    const [user, setUser] = useState([])
    const auth = getAuth()
    const fireUser = auth.currentUser

    const loc = useLocation()
    console.log(loc)

    const [isLoading, setIsLoading] = useState(false);

    const [categories, setCategories] = useState(Array);
    const [displayCategories, setDisplayCategories] = useState(true);
    const [displayLevels, setDisplayLevels] = useState(false);

    const [selectedCat, setSelectedCat] = useState(String);

    const [isTopTen, setIsTopTen] = useState(true);

    const [displayLeaderboard, setDisplayLeaderboard] = useState(false);

    const [retrievedDocs, setRetrievedDocs] = useState(Array);

     // Handle user state changes
     async function onAuthStateChanged(user) {
        if (user) {
            const userDocRefocRef = doc(db, 'users', user.uid)
            const userSnap = await getDoc(userDocRefocRef);
            setUser(userSnap.data());
            console.log(userSnap.data().uid)
        }
    }

    useEffect(() => {
        const subscriber = auth.onAuthStateChanged(onAuthStateChanged);

        return subscriber; // unsubscribe on unmount
    }, []);

    useEffect(() => {
        if (loc.state.from == 'quiz') {
            setDisplayCategories(false);
            let newCat = loc.state.cat.replaceAll('_', ' ')
            newCat = newCat.replaceAll('and', '&');
            let words = newCat.split(' ')
            for (let i = 0; i < words.length; i++) {
                words[i] = words[i][0].toUpperCase() + words[i].substr(1);
            }

            setSelectedCat(words.join(' '))
            selectedLevel(loc.state.level, words.join(' '));

        } else {
            setCategories(loc.state)
        }

    }, [])

    const toggleLevel = (cat) => {

        if (displayCategories) {
            setSelectedCat(cat);
            setDisplayCategories(false);
            setDisplayLevels(true);
        } else {
            setDisplayCategories(true);
            setDisplayLevels(false);
        }
    }
    const setTitle = (lvl, cat) => {
        const title = document.querySelector('.title');
        title.textContent = `${cat} - ${lvl}`;
    }

    const selectedLevel = (lvl, cat) => {
        const scoreTabs = document.querySelector('.scoreTabs')
        scoreTabs.style.display = 'block'
        setDisplayLeaderboard(true);
        setIsLoading(true);
        topTen(lvl, cat)

    }

    const switchTabs = () => {
        isTopTen ? setIsTopTen(false) : setIsTopTen(true);
    }

    const topTen = async (lvl, cat) => {

        let queryCat = cat.replaceAll(' ', '_')
        queryCat = queryCat.replaceAll('&', 'and');
        queryCat = queryCat.toLowerCase();


        const q = query(collection(db, `leaderboards/${queryCat}/${lvl}`), orderBy('score', 'desc'), orderBy('time', 'asc'), limit(10));

        const querySnapshot = await getDocs(q);
        let rank = 1;
        let docs = [];

        querySnapshot.forEach((doc) => {
            console.log(doc.id, '=>', doc.data())
            const timeInt = parseInt(doc.data().time)
            let mins = Math.floor(timeInt / 60).toString().length == 1 ? `0${Math.floor(timeInt / 60)}` : `${Math.floor(timeInt / 60)}`;

            let secs = (timeInt % 60).toString().length == 1 ? `0${timeInt % 60}` : `${timeInt % 60}`;

            //secs = secs.

            docs.push({ ...doc.data(), rank: rank, timeInMins: `${mins}:${secs}`, id: doc.id });

            rank++
        })
        setRetrievedDocs(docs)

        setIsLoading(false);
        setDisplayLevels(false);

        setTitle(lvl, cat);
    }

    const yourScore = async (lvl, cat) => {
        let queryCat = cat.replaceAll(' ', '_')
        queryCat = queryCat.replaceAll('&', 'and');
        queryCat = queryCat.toLowerCase();


        const q = query(collection(db, `leaderboards/${queryCat}/${lvl}`), orderBy('score', 'desc'), orderBy('time', 'asc'));
        let rank = 1;
        let docs = [];
        const querySnapshot = await getDocs(q).then((doc) => {
            console.log(doc)
            console.log(doc.docs)
            console.log(doc.id)
        })


    }

    return (
        <div>
            <div className="page">
                <h1 className='title'>Leaderboards</h1>
                <div className='scoreTabs'>
                    {displayLeaderboard && isTopTen &&
                        <>
                            <a className='activeScoreTab'>Top Ten</a>
                            <a className='inactiveScoreTab' onClick={() => switchTabs()}>Your Score</a>
                        </>
                    }
                    {displayLeaderboard && !isTopTen &&
                        <>
                            <a className='inactiveScoreTab' onClick={() => switchTabs()}>Top Ten</a>
                            <a className='activeScoreTab'>Your Score</a>
                        </>
                    }
                </div>
                {isLoading &&
                    <>
                        <h1>Loading leaderboard...</h1>
                    </>
                }
                {displayCategories &&
                    <>
                        <ul className="categories">
                            {
                                categories.map((cat, index) => {
                                    return <li key={index} onClick={() => toggleLevel(cat)}>{cat}</li>
                                })}
                        </ul>
                        <Link className="backBtn" to={'/home'}>Back</Link>
                    </>
                }
                {displayLevels &&
                    <>
                        <ul className="levels">
                            <li onClick={() => selectedLevel('easy', selectedCat)}>Easy</li>
                            <li onClick={() => selectedLevel('medium', selectedCat)}>Medium</li>
                            <li onClick={() => selectedLevel('hard', selectedCat)}>Hard</li>
                        </ul>
                        <button className="backBtn" onClick={() => toggleLevel()}>Back</button>
                    </>
                }
                {displayLeaderboard && isTopTen &&
                    <>
                        <table className='leaderboardList'>
                            <tr className='leaderboardHeaders'>
                                <th>Rank</th>
                                <th>Username</th>
                                <th>Score</th>
                                <th>Time</th>
                            </tr>
                            {

                                retrievedDocs.map((doc, index) => {
                                    console.log(doc.id)
                                    console.log(user.uid)
                                    if (doc.id == user.uid) {
                                        const userEntry = document.querySelector('.leaderboardEntry')
                                        userEntry.style.backgroundColor = 'rgb(34, 31, 54)';
                                        userEntry.style.color = 'white';
                                        
                                    }
                                    return (
                                        <tr className='leaderboardEntry'>
                                            <td>{doc.rank}</td>
                                            <td>{doc.username}</td>
                                            <td>{doc.score}</td>
                                            <td>{doc.timeInMins}</td>
                                        </tr>
                                    )
                                })

                            }
                        </table>
                        <br />
                        <Link className="backBtn" to={'/home'}>Main Menu</Link>
                    </>
                }
                {displayLeaderboard && !isTopTen &&
                    <>
                        <table className='leaderboardList'>
                            <tr className='leaderboardHeaders'>
                                <th>Rank</th>
                                <th>Username</th>
                                <th>Score</th>
                                <th>Time</th>
                            </tr>
                            {

                                retrievedDocs.map((doc, index) => {
                                    return (
                                        <tr className='leaderboardEntry'>
                                            <td>{doc.rank}</td>
                                            <td>{doc.username}</td>
                                            <td>{doc.score}</td>
                                            <td>{doc.timeInMins}</td>
                                        </tr>
                                    )
                                })

                            }
                        </table>
                        <br />
                        <Link className="backBtn" to={'/home'}>Main Menu</Link>
                    </>
                }
            </div>
            <Link to="/home">Home</Link>
        </div>

    );
}

export default Leaderboard;