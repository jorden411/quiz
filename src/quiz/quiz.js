import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import './quiz.css';
import { db, auth } from '../firebase-config'
import { getAuth } from 'firebase/auth'


function Quiz() {
    const [user, setUser] = useState([])
    const auth = getAuth()
    const fireUser = auth.currentUser

    const loc = useLocation()
    const url = 'https://the-trivia-api.com/v2';

    const [questionData, setQuestionData] = useState([]);
    const [questionNo, setQuestionNo] = useState(0);
    const [chosenAnswers, setChosenAnswers] = useState([]);
    const [finished, setFinished] = useState(false);
    const [score, setScore] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

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
            await fetch(`${url}/questions?categories=${loc.state.cat}&difficulty=${loc.state.lvl}`)
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
    }, []);
    console.log(questionData);

    const doneLoading = () => {
        setIsLoading(false);
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
            setFinished(true)
        }

    }


    return (
        <div className="Quiz">

            <div className='page'>
                {isLoading &&
                    <>
                        <h2>You will get only one chance to answer each question</h2>
                        <h2>If you refresh at any point you will restart the quiz with new questions</h2>
                        <button onClick={doneLoading}>Continue</button>
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
                {!isLoading && finished &&
                    <>
                        <h1>Score: {score}/10</h1>


                        {questionData.map((data, index) => {
                            let background = '';
                            if (data.correctAnswer == chosenAnswers[index]) {
                                background = 'linear-gradient(164deg, rgba(2,0,36,1) 0%, rgba(0,212,255,0) 0%, rgba(14,187,19,1) 100%)';
                            } else {
                                background = 'linear-gradient(164deg, rgba(2,0,36,1) 0%, rgba(0,212,255,0) 0%, rgba(187,14,14,1) 100%)';
                            }
                            return <div className="results" style={{ background: background }} key={index}>
                                <a>Question: {data.question.text}</a><br />
                                <a>Correct Answer: {data.correctAnswer}</a><br />
                                <a>Your Answer: {chosenAnswers[index]}</a>
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