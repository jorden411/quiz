import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import './quiz.css';
import { db, auth } from '../firebase-config'
import { collection, getDoc, getDocs, doc, addDoc, updateDoc, setDoc } from "@firebase/firestore"
import { getAuth } from 'firebase/auth'


function Quiz() {
    const [user, setUser] = useState([])
    const auth = getAuth()



    const loc = useLocation()
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
            console.log(userSnap.data())
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
    }, []);
    console.log(questionData);

    const doneLoading = () => {
        setIsLoading(false);
        const min = document.querySelector('.minutes');
        const colon = document.querySelector('.colon');
        const sec = document.querySelector(".seconds");

        min.style.display = 'inline';
        colon.style.display = 'inline';
        sec.style.display = 'inline';
        timer();
    }

    const updateQuestion = (ans) => {
        if (ans == questionData[questionNo].correctAnswer) {
            setScore(score + 1);
        }

        if (questionNo < 9) {
            console.log(ans);
            setChosenAnswers([...chosenAnswers, ans]);

            setQuestionNo(questionNo + 1);
            console.log(chosenAnswers);
        } else {
            setChosenAnswers([...chosenAnswers, ans]);
            for (let i = 0; i < chosenAnswers.length; i++) {
                chosenAnswers[i] = questionData
            }
            setFinished(true);
            finishQuiz()
        }

    }

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
            console.log(`leaderboards/${loc.state.cat}/${loc.state.level}`)
            const colRef = collection(db, `leaderboards/${loc.state.cat}/${loc.state.level}`)
            await addDoc(colRef, { username: user.username, uid: user.uid, score: score, time: ((minInt * 60) + secInt) })

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

                        <h1 className='questionNo'>Question No.{questionNo + 1}</h1>

                        <h3 className='question'>{questionData[questionNo]?.question.text}</h3>

                        <ul className='answers'>
                            <li className='ansBtn' onClick={() => updateQuestion(questionData[questionNo]?.answers[0])}>{questionData[questionNo]?.answers[0]}</li>
                            <li className='ansBtn' onClick={() => updateQuestion(questionData[questionNo]?.answers[1])}>{questionData[questionNo]?.answers[1]}</li>
                            <li className='ansBtn' onClick={() => updateQuestion(questionData[questionNo]?.answers[2])}>{questionData[questionNo]?.answers[2]}</li>
                            <li className='ansBtn' onClick={() => updateQuestion(questionData[questionNo]?.answers[3])}>{questionData[questionNo]?.answers[3]}</li>
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
                        <Link className="btn" to={{ pathname: "/leaderboard" }}>Leaderboard</Link>
                        <Link className="btn" to={"/home"}>Main Menu</Link>
                    </>
                }





            </div>

        </div>
    );
}

export default Quiz;