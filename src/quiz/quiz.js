import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import './quiz.css';
import { db, auth } from '../firebase-config'
import { collection, getDoc, getDocs, doc, addDoc, updateDoc, setDoc } from "@firebase/firestore"
import { getAuth } from 'firebase/auth'
import { PollyClient, SynthesizeSpeechCommand, StartSpeechSynthesisTaskCommand, GetSpeechSynthesisTaskCommand, GetSpeechSynthesisTaskCommandOutput } from "@aws-sdk/client-polly";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons'


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

    const [useTTS, setUseTTS] = useState(true);
    const [ttsUris, setTTSUris] = useState([]);
    const [testTTS, setTestTTS] = useState(['I', 'U']);

    console.log(questionData);

    const client = new PollyClient({
        region: "eu-west-2",
        credentials: {
            accessKeyId: "AKIA5FTZB3MQFG25IT5H",
            secretAccessKey: "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",
        }
    })





    // Handle user state changes
    async function onAuthStateChanged(user) {
        if (user) {
            const userDocRefocRef = doc(db, 'users', user.uid)
            const userSnap = await getDoc(userDocRefocRef);
            setUser(userSnap.data());
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
        //let qData = []
        const fetchQuestions = async () => {
            await fetch(`${url}/questions?categories=${loc.state.cat}&difficulty=${loc.state.level}`)
                .then((res) => { return res.json(); })
                .then(async (data) => {
                    let qid = 0;
                    data.forEach(e => {
                        e.qid = qid;
                        qid++

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
                    //qData = data;
                    //console.log(qData);
                    if (useTTS) {
                        await textToSpeech(data)
                    }
                })
                .catch((err) => {
                    console.log(err.message);
                });
        }
        fetchQuestions();
        setUser(auth.currentUser);

        const textToSpeech = async (qData) => {

            if (useTTS) {

                let uris = [];
                for (let i = 0; i < qData.length; i++) {

                    if (qData.length > 0) {
                        console.log(qData);

                        const input = {
                            OutputFormat: "mp3",
                            OutputS3BucketName: "ci601", // required
                            Text: qData[i].question.text,
                            //Text: "I",
                            TextType: "text",
                            VoiceId: "Joanna"
                        };
                        console.log(input)
                        const command = new StartSpeechSynthesisTaskCommand(input);

                        await client.send(command)
                            .then((res) => {
                                console.log(res)
                                if (res.$metadata.httpStatusCode !== 200) {
                                    console.error("Error occurred:", res.$metadata.httpStatusCode);
                                } else {
                                    //setTaskId(res.SynthesisTask.TaskId);
                                    // const getTTSInput = {
                                    //     TaskId: res.SynthesisTask.TaskId
                                    // };
                                    // const task = new GetSpeechSynthesisTaskCommand(getTTSInput)
                                    // const gottenTask = await client.send(task);
                                    // console.log(gottenTask);
                                    //setQuestionData(questionData.map(q => q.qid == 0 ? { ...q, tts: res.SynthesisTask.OutputUri } : q))

                                    uris.push({ qid: i, tts: res.SynthesisTask.OutputUri })

                                }


                            })
                    }
                }
                console.log(uris);
                setTTSUris(uris);
                console.log(ttsUris)
            } else {
                console.log('tts false')
                console.log(ttsUris)
            }
        }
        


    }, []);


    // useEffect(() => {

    //text();
    // }, [])

    // const textToSpeech = async () => {
    //     console.log(questionData);
    //     const url = 'https://voicerss-text-to-speech.p.rapidapi.com/?key=%3CREQUIRED%3E';
    //     const options = {
    //         method: 'POST',
    //         headers: {
    //             'content-type': 'application/x-www-form-urlencoded',
    //             'X-RapidAPI-Key': '650b228226msheca9745575e163fp150ff4jsn89f5474c7c52',
    //             'X-RapidAPI-Host': 'voicerss-text-to-speech.p.rapidapi.com'
    //         },
    //         body: new URLSearchParams({
    //             src: 'Hello, world!',
    //             hl: 'en-us',
    //             r: '0',
    //             c: 'mp3',
    //             f: '8khz_8bit_mono'
    //         })
    //     };

    //     try {
    //         const response = await fetch(url, options);
    //         const result = await response.text();
    //         console.log(result);
    //     } catch (error) {
    //         console.error(error);
    //     }
    // }
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
        const audioElement = document.querySelector(".TTS");
        audioElement.src = ttsUris[questionNo].tts;
    }

    const play = () => {   
        const audioElement = document.querySelector(".TTS");
        console.log(audioElement.src);
        // console.log(audioElement.src == ttsUris[qNo].tts)
        // if (audioElement.src == ttsUris[qNo].tts) {
        //     audioElement.play();
        // } else {
        //     audioElement.src = ttsUris[qNo].tts;
            
        // }
        if (audioElement.src) {
            audioElement.play().then(() => {})
            .catch(error => {
                console.log(error)
                audioElement.src = ttsUris[questionNo].tts;
                play();
            });
        } else {
            audioElement.src = ttsUris[questionNo].tts;
        }
        
        
        
    }

    const updateQuestion = (ans) => {
        if (questionNo < 10) {
            
        }
        const audioElement = document.querySelector(".TTS");
        audioElement.src = ttsUris[questionNo+1].tts;

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
            <audio className="TTS" src=""></audio>
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
                        {/* { useTTS && */}
                        <FontAwesomeIcon className="play" title="Play Question" onClick={() => play(questionNo)} icon={faPlay} />
                        {/* } */}

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