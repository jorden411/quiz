import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import './quiz.css';
import { db, auth } from '../firebase-config'
import { collection, getDoc, getDocs, doc, addDoc, updateDoc, setDoc } from "@firebase/firestore"
import { getAuth } from 'firebase/auth'


function Quiz() {
    const [user, setUser] = useState([])
    const auth = getAuth();
    const navigate = useNavigate();

    const loc = useLocation();
    const url = 'https://the-trivia-api.com/v2';

    const [questionData, setQuestionData] = useState([]);
    const [questionNo, setQuestionNo] = useState(0);
    const [chosenAnswers, setChosenAnswers] = useState([]);
    const [finished, setFinished] = useState(false);
    const [score, setScore] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

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
        const unloadCallback = (event) => {
            event.preventDefault();
            event.returnValue = "";
            window.location.reload();
            return "";
        };

        window.addEventListener("beforeunload", unloadCallback);
        return () => window.removeEventListener("beforeunload", unloadCallback);
    }, []);

    useEffect(() => {
        const fetchQuestions = async () => {
            await fetch(`${url}/questions?categories=${loc.state.cat}&difficulty=${loc.state.level}`)
                .then((res) => { return res.json(); })
                .then((data) => {
                    console.log(data);
                    data.forEach(e => {
                        const rand = Math.floor(Math.random() * (4) + 1);
                        const answers = [];

                        for (let i = 1; i <= 4; i++) {
                            if (i === rand) {
                                answers.push(e.correctAnswer)
                            } else {
                                answers.push(e.incorrectAnswers.pop())
                            }
                        }
                        e.answers = answers;
                    });
                    setQuestionData(data);
                })
                .catch((err) => {
                    console.log(err.message);
                });
        }
        fetchQuestions();
        setUser(auth.currentUser);
        textToSpeech()

    }, []);

    const textToSpeech = async () => {
        console.log(questionData);
        const url = 'https://voicerss-text-to-speech.p.rapidapi.com/?key=%3CREQUIRED%3E';
        const options = {
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'X-RapidAPI-Key': '650b228226msheca9745575e163fp150ff4jsn89f5474c7c52',
                'X-RapidAPI-Host': 'voicerss-text-to-speech.p.rapidapi.com'
            },
            body: new URLSearchParams({
                src: 'Hello, world!',
                hl: 'en-us',
                r: '0',
                c: 'mp3',
                f: '8khz_8bit_mono'
            })
        };

        try {
            const response = await fetch(url, options);
            const result = await response.text();
            console.log(result);
        } catch (error) {
            console.error(error);
        }
    }
    console.log(questionData);

    const doneLoading = () => {
        setIsLoading(false);
        const min = document.querySelector('.minutes');
        const colon = document.querySelector('.colon');
        const sec = document.querySelector('.seconds');

        min.style.display = 'inline-block';
        colon.style.display = 'inline-block';
        sec.style.display = 'inline-block';

        timer();
    }

    const updateQuestion = (ans) => {
        if (ans == questionData[questionNo].correctAnswer) {
            setScore(score + 1);
        }

        if (questionNo < 9) {
            setChosenAnswers([...chosenAnswers, ans]);

            setQuestionNo(questionNo + 1);
        } else {
            setChosenAnswers([...chosenAnswers, ans]);
            // for (let i = 0; i < chosenAnswers.length; i++) {
            //     chosenAnswers[i] = questionData
            // }
            setFinished(true);

        }

    }
    useEffect(() => {
        console.log(score);
        console.log(chosenAnswers);
        console.log(chosenAnswers.length)
        if (chosenAnswers.length == 10) {
            finishQuiz()
        }
    }, [chosenAnswers])

    const finishQuiz = async () => {
        const finalScore = document.querySelector('.finalScore');
        const finalTime = document.querySelector('.finalTime');
        finalScore.style.display = 'block';
        finalTime.style.display = 'block';

        const min = document.querySelector('.minutes');
        const colon = document.querySelector('.colon');
        const sec = document.querySelector('.seconds');

        min.style.display = 'none';
        colon.style.display = 'none';
        sec.style.display = 'none';

        const time = document.querySelector('.finalTime');

        const finalMin = min.textContent;
        const finalSec = sec.textContent;

        time.textContent = `${finalMin}:${finalSec}`
        if (user) {
            const minInt = parseInt(min.textContent);
            const secInt = parseInt(sec.textContent);
            const timeTaken = ((minInt * 60) + secInt);

            console.log(`leaderboards/${loc.state.cat}/${loc.state.level}`)
            const colRef = collection(db, `leaderboards/${loc.state.cat}/${loc.state.level}`)

            const docRef = doc(db, `leaderboards/${loc.state.cat}/${loc.state.level}/${user.uid}`)
            console.log(docRef)
            await getDoc(docRef).then(async (doc) => {

                if (doc.data()) {
                    let preScore = doc.data().score;
                    let preTime = doc.data().time;

                    console.log(preScore);
                    console.log(score);
                    console.log(preTime);
                    console.log(timeTaken);

                    if (preScore < score || (preScore == score && timeTaken < preTime)) {
                        await setDoc(docRef, { username: user.username, uid: user.uid, score: score, time: timeTaken })
                    }
                } else {
                    await setDoc(docRef, { username: user.username, uid: user.uid, score: score, time: timeTaken })
                }
            })


        }
    }

    const timer = () => {

        const min = document.querySelector('.minutes');
        const sec = document.querySelector('.seconds');
        let totalSeconds = 0;

        setInterval(setTime, 1000);

        function setTime() {
            ++totalSeconds;

            sec.textContent = pad(totalSeconds % 60);
            min.textContent = pad(parseInt(totalSeconds / 60));
        }

        function pad(val) {
            var valString = val + "";
            if (valString.length < 2) {
                return "0" + valString;
            }
            else {
                return valString;
            }
        }
    }

    const goToLeaderboardFromQuiz = () => {
        navigate('/leaderboard', { state: { from: 'quiz', cat: loc.state.cat, level: loc.state.level } })
    }

    return (
        <div className="Quiz">

            <div className='page'>
                <div className="timer">
                    <h2 className="minutes">00</h2>
                    <h2 className="colon">:</h2>
                    <h2 className="seconds">00</h2>
                </div>


                {isLoading &&
                    <>
                        <h2>You will get only one chance to answer each question</h2>
                        <h2>If you refresh at any point you will restart the quiz with new questions</h2>
                        {!user &&
                            <h2>You're not logged in, so you score won't be saved to the leaderboards.</h2>
                        }
                        <button onClick={doneLoading}>Start</button>
                        <Link className="backBtn" to={"/home"}>Back</Link>
                    </>

                }

                {!isLoading && questionData && !finished &&
                    <>
                        <p className="minutes">00</p>
                        <p className="colon">:</p>
                        <p className="seconds">00</p>
                        <h1 className='questionNo'>Question No.{questionNo + 1}</h1>

                        <h3 className='question'>{questionData[questionNo]?.question.text}</h3>

                        <ul className='answers'>
                            <li className='ansBtn' onClick={() => updateQuestion(questionData[questionNo]?.answers[0])}>A. {questionData[questionNo]?.answers[0]}</li>
                            <li className='ansBtn' onClick={() => updateQuestion(questionData[questionNo]?.answers[1])}>B. {questionData[questionNo]?.answers[1]}</li>
                            <li className='ansBtn' onClick={() => updateQuestion(questionData[questionNo]?.answers[2])}>C. {questionData[questionNo]?.answers[2]}</li>
                            <li className='ansBtn' onClick={() => updateQuestion(questionData[questionNo]?.answers[3])}>D. {questionData[questionNo]?.answers[3]}</li>
                        </ul>
                    </>

                }
                <h1 className="finalScore">Score: {score}/10</h1>
                <h2 className="finalTime"></h2>
                {!isLoading && finished &&
                    <>
                        {questionData.map((data, index) => {
                            let background = '';
                            if (data.correctAnswer == chosenAnswers[index]) {
                                background = 'linear-gradient(164deg, rgba(2,0,36,1) 0%, rgba(0,212,255,0) 0%, rgba(14,187,19,1) 100%)';
                            } else {
                                background = 'linear-gradient(164deg, rgba(2,0,36,1) 0%, rgba(0,212,255,0) 0%, rgba(187,14,14,1) 100%)';
                            }
                            return <div className="results" style={{ background: background }} key={index}>
                                <a className="dark">Question: {data.question.text}</a><br />
                                <a className="dark">Correct Answer: {data.correctAnswer}</a><br />
                                <a className="dark">Your Answer: {chosenAnswers[index]}</a>
                            </div>
                        })}
                        <button className="btn" onClick={() => goToLeaderboardFromQuiz()}>Leaderboard</button>
                        <Link className="btn" to={"/home"}>Main Menu</Link>
                    </>
                }





            </div>

        </div>
    );
}

export default Quiz;