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
    const [selectedLvl, setSelectedLvl] = useState(String);

    const [isTopTen, setIsTopTen] = useState(true);

    const [displayLeaderboard, setDisplayLeaderboard] = useState(false);

    const [retrievedTopTenDocs, setRetrievedTopTenDocs] = useState(Array);
    const [retrievedYourScoreDocs, setRetrievedYourScoreDocs] = useState(Array);

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
        setSelectedLvl(lvl);
        setDisplayLeaderboard(true);
        setIsLoading(true);
        topTen(lvl, cat)
        yourScore(lvl, cat);
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
            docs.push({ ...doc.data(), rank: rank, timeInMins: `${mins}:${secs}`, id: doc.id });

            rank++
        })
        console.log('top ten docs', docs)
        setRetrievedTopTenDocs(docs)

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
        let preDocs = [];
        let userDoc = [];
        let postDocs = [];
        let userDocFound = false;

        const querySnapshot = await getDocs(q).then((doc) => {
            console.log(doc)
            console.log(doc.docs)
            for (let i = 0; i < doc.docs.length; i++) {
                console.log(doc.docs[i].id);
                console.log(doc.docs[i].data());
                // Format Time
                const timeInt = parseInt(doc.docs[i].data().time)
                let mins = Math.floor(timeInt / 60).toString().length == 1 ? `0${Math.floor(timeInt / 60)}` : `${Math.floor(timeInt / 60)}`;
                let secs = (timeInt % 60).toString().length == 1 ? `0${timeInt % 60}` : `${timeInt % 60}`;
                //docs.push({ ...doc.data(), rank: rank, timeInMins: `${mins}:${secs}`, id: doc.id });

                // Check if its the users score
                if (doc.docs[i].id == user.uid) {
                    userDocFound = true;
                    userDoc.push({ ...doc.docs[i].data(), rank: rank, timeInMins: `${mins}:${secs}`, id: doc.docs[i].id })
                }
                // Skip adding to post or pre if it is the users doc
                if (!userDocFound) {
                    if (userDoc.length == 0) {
                        if (preDocs.length == 9) {
                            preDocs.shift()
                        }
                        preDocs.push({ ...doc.docs[i].data(), rank: rank, timeInMins: `${mins}:${secs}`, id: doc.docs[i].id })
                    } else {
                        if ((preDocs.length == 0 && postDocs.length == 9) || ((preDocs.length <= 4) && (postDocs.length + preDocs.length == 9)) || (preDocs.length > 4 && postDocs.length == 5)) {
                            break;
                        } else {
                            // Add document data to post linked list
                            postDocs.push({ ...doc.docs[i].data(), rank: rank, timeInMins: `${mins}:${secs}`, id: doc.docs[i].id });
                        }
                    }

                } else {
                    userDocFound = false;
                }
                rank++
                console.log(preDocs)
            }

            // Remove items from pre until sizes of pre + post == 9
            console.log(preDocs.length)
            console.log(postDocs.length)
            if ((postDocs.length + preDocs.length) > 9) {
                if (postDocs.length > 0) {
                    let len = ((postDocs.length + preDocs.length) - 9);
                    for (let i = 0; i < len; i++) {
                        preDocs.shift();
                        console.log('unshift')
                        console.log(preDocs.length)
                    }
                }
            }
            console.log(preDocs.length);
            // Populate docs with preDocs
            let docNo = 0;
            if (preDocs.length > 0) {
                for (let i = 0; i < preDocs.length; i++) {
                    docs[docNo] = preDocs[i];
                    docNo += 1;
                }
            }

            // Populate displayDocs with the users doc after all the pre docs
            if (userDoc.length == 1) {
                docs[docNo] = userDoc[0];
                docNo += 1;
            }


            // Populate displayDocs with post docs after all pre docs and user doc
            if (postDocs.length > 0) {
                for (let i = 0; i < postDocs.length; i++) {
                    docs[docNo] = postDocs[i];
                    docNo += 1;
                }
            }
            console.log('docs', docs)
            setRetrievedYourScoreDocs(docs);
        })


    }

    return (
        <div>
            <div className="leaderboardPage">
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
                        {!retrievedTopTenDocs.length == 0 ?
                            <>
                                <table className='leaderboardList'>
                                    <tr className='leaderboardHeaders'>
                                        <th>Rank</th>
                                        <th>Username</th>
                                        <th>Score</th>
                                        <th>Time</th>
                                    </tr>

                                    {
                                        retrievedTopTenDocs.map((doc, index) => {
                                            let usersDoc = false
                                            if (doc.id == user.uid) {
                                                usersDoc = true;
                                            }
                                            return (
                                                <tr className={usersDoc ? 'userLeaderboardEntry' : 'leaderboardEntry'}>
                                                    <td>{doc.rank}</td>
                                                    <td>{doc.username}</td>
                                                    <td>{doc.score}</td>
                                                    <td>{doc.timeInMins}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                </table>
                            </>
                            :
                            <>
                                <h1>There has been no score set for this category and level.</h1>
                            </>


                        }
                        <br />
                        <Link className="backBtn" to={'/home'}>Main Menu</Link>
                    </>
                }
                {displayLeaderboard && !isTopTen &&
                    <>
                        {user.uid ?
                            <>
                                {!retrievedYourScoreDocs.length == 0 ?
                                    <>
                                        <table className='leaderboardList'>
                                            <tr className='leaderboardHeaders'>
                                                <th>Rank</th>
                                                <th>Username</th>
                                                <th>Score</th>
                                                <th>Time</th>
                                            </tr>
                                            {
                                                retrievedYourScoreDocs.map((doc, index) => {
                                                    let usersDoc = false
                                                    if (doc.id == user.uid) {
                                                        usersDoc = true;
                                                    }
                                                    return (
                                                        <tr className={usersDoc ? 'userLeaderboardEntry' : 'leaderboardEntry'}>
                                                            <td>{doc.rank}</td>
                                                            <td>{doc.username}</td>
                                                            <td>{doc.score}</td>
                                                            <td>{doc.timeInMins}</td>
                                                        </tr>
                                                    )
                                                })

                                            }
                                        </table>
                                    </>
                                    :
                                    <>
                                        <h1>There has been no score set for this category and level.</h1>
                                    </>
                                }
                                <br />
                                <Link className="backBtn" to={'/home'}>Main Menu</Link>
                            </>
                            :
                            <>
                                <h1>Please log in to see your score on the leaderboard.</h1>
                                <Link className="btn" to={"/auth"}>Sign In</Link>
                                <br />
                                <Link className="backBtn" to={'/home'}>Main Menu</Link>
                            </>
                        }
                    </>
                }
            </div>
            <Link to="/home">Home</Link>
        </div>

    );
}

export default Leaderboard;