import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import './quiz.css';


function Quiz() {
    const loc = useLocation()
    console.log(loc);
    const url = 'https://the-trivia-api.com/v2';

    const [questionData, setQuestionData] = useState([]);
    const [questionNo, setQuestionNo] = useState(0);
    const [chosenAnswers, setChosenAnswers] = useState([]);
    const [finished, setFinished] = useState(false);
    const [isLoading, setIsLoading] = useState(false);


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

    const updateQuestion = (ans) => {
        if (questionNo < 9) {
            console.log(ans);
            setChosenAnswers([...chosenAnswers, ans]);

            setQuestionNo(questionNo + 1);
            console.log(chosenAnswers);
        } else {
            setChosenAnswers([...chosenAnswers, ans]);
            setFinished(true)
        }

    }
    

    return (
        <div className="Quiz">
            <h1>CI601 Quiz</h1>

            <h2>Score</h2>

            <div className='page'>
                {questionData && !finished &&
                    <>
                        <h2 className='questionNo'>Question No.{questionNo + 1}</h2>

                        <h3 className='question'>{questionData[questionNo]?.question.text}</h3>

                        <ul className='answers'>
                            <li className='ansBtn' onClick={() => updateQuestion(questionData[questionNo]?.answers[0] === questionData[questionNo]?.correctAnswer ? true : false)}>{questionData[questionNo]?.answers[0]}</li>
                            <li className='ansBtn' onClick={() => updateQuestion(questionData[questionNo]?.answers[1] === questionData[questionNo]?.correctAnswer ? true : false)}>{questionData[questionNo]?.answers[1]}</li>
                            <li className='ansBtn' onClick={() => updateQuestion(questionData[questionNo]?.answers[2] === questionData[questionNo]?.correctAnswer ? true : false)}>{questionData[questionNo]?.answers[2]}</li>
                            <li className='ansBtn' onClick={() => updateQuestion(questionData[questionNo]?.answers[3] === questionData[questionNo]?.correctAnswer ? true : false)}>{questionData[questionNo]?.answers[3]}</li>
                        </ul>
                    </>

                }
                {finished &&
                    <>
                        <p>congrats you have finished</p>
                        <ul>

                        </ul>
                        {chosenAnswers.map((ans, index) => {
                            return <li key={index}>{ans}</li>
                        })}
                    </>
                }





            </div>

        </div>
    );
}

export default Quiz;