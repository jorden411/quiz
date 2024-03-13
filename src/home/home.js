import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import './home.css';



function Home() {
    //  https://the-trivia-api.com/v2/questions?categories=
    // https://the-trivia-api.com/v2/categories

    const [categories, setCategories] = useState(Object);

    const [displayHome, setDisplayHome] = useState(true);
    const [displayCategories, setDisplayCategories] = useState(false);
    const [displayLevels, setDisplayLevels] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    let chosenCat = '';
    

    const url = 'https://the-trivia-api.com/v2';

    useEffect(() => {
        const fetchCats = async () => {
            setIsLoading(true);

            await fetch(`${url}/categories`)
                .then((res) => { return res.json(); })
                .then((data) => {
                    console.log(data);
                    setCategories(data);
                    console.log(Object.keys(categories))
                })
                .catch((err) => {
                    console.log(err.message);
                });
            setIsLoading(false);
        }

        fetchCats();
    }, []);


    const toggleHome = () => {
        if (displayHome) {
            setDisplayCategories(false)
        } else {
            setDisplayCategories(true)
        }
    };
    const toggleCats = () => {
        if (displayCategories) {
            setDisplayCategories(false)
            setDisplayHome(true)
        } else {
            setDisplayCategories(true)
            setDisplayHome(false)
        }
    };
    const toggleLevels = () => {
        if (displayLevels) {
            setDisplayCategories(true)
            setDisplayLevels(false)
        } else {
            setDisplayLevels(true)
            setDisplayCategories(false)
        }
    };


    return (
        <div className="Home">
            {displayHome &&
                <div className="page">
                    <h1>CI601 Quiz</h1>

                    <button onClick={toggleCats}>Start a Quiz!</button>

                    <Link className="btn" to="/leaderboard">Leaderboard</Link>
                </div>
            }
            {displayCategories &&
                <div className="page">
                    <ul className="categories">
                        { 
                        Object.keys(categories).map((cat, index) => {
                            return <li key={index} onClick={toggleLevels}>{cat}</li>
                        })}
                    </ul>
                    <button className="backBtn" onClick={toggleCats}>Back</button>
                </div>
            }
            {displayLevels &&
                <div className="page">
                    <ul className="categories">
                        <li>Easy</li>
                        <li>Medium</li>
                        <li>Hard</li>
                        <li>Random</li>
                    </ul>
                    <button className="backBtn" onClick={toggleLevels}>Back</button>
                </div>
            }





        </div>
    );
}

export default Home;