import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import './quiz.css';


function Quiz() {
    const loc = useLocation()
    console.log(loc);
    const url = 'https://the-trivia-api.com/v2';

    const [questionData, setQuestionData] = useState(null);
    const [questionNo, setQuestionNo] = useState(1);
    const [chosenAnswers, setChosenAnswers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    console.log(isLoading)

    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoading(true);

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
            setIsLoading(false);
        }

        fetchQuestions();
    }, []);

    const updateQuestion = (ans) => {
        
        setChosenAnswers(chosenAnswers.push(ans))
        setQuestionNo(questionNo + 1);

    }

    return (
        <div className="Quiz">
            <h1>CI601 Quiz</h1>

            <h2>Score</h2>

            <div className='page'>
                {questionData &&
                    <>
                        <h2 className='questionNo'>Question No.{questionNo}</h2>

                        <h3 className='question'>{questionData[questionNo].question.text}</h3>

                        <ul className='answers'>
                            <li className='ansBtn' onClick={updateQuestion(questionData[questionNo].answers[0] === questionData[questionNo].correctAnswer ? true : false )}>{questionData[questionNo].answers[0]}</li>
                            <li className='ansBtn' onClick={updateQuestion(questionData[questionNo].answers[1] === questionData[questionNo].correctAnswer ? true : false )}>{questionData[questionNo].answers[1]}</li>
                            <li className='ansBtn' onClick={updateQuestion(questionData[questionNo].answers[2] === questionData[questionNo].correctAnswer ? true : false )}>{questionData[questionNo].answers[2]}</li>
                            <li className='ansBtn' onClick={updateQuestion(questionData[questionNo].answers[3] === questionData[questionNo].correctAnswer ? true : false )}>{questionData[questionNo].answers[3]}</li>
                        </ul>
                    </>

                }






            </div>

        </div>
    );
}

export default Quiz;