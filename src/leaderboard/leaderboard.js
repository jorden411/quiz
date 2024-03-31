import { Link, parsePath, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import './leaderboard.css';



function Leaderboard() {

    const loc = useLocation()
    console.log(loc)

    const [categories, setCategories] = useState(Array);
    const [displayCategories, setDisplayCategories] = useState(true);
    const [displayLevels, setDisplayLevels] = useState(false);

    const [displayLeaderboard, setDisplayLeaderboard] = useState(false);

    useEffect(() => {
        setCategories(loc.state)
    })

    const toggleLevel = () => {
        console.log('toggleLevel');
        if (displayCategories) {
            setDisplayCategories(false);
            setDisplayLevels(true);
        } else {
            setDisplayCategories(true);
            setDisplayLevels(false);
        }
    }

    const selectedLevel = () => {

    }

    return (
        <div>
            <div className="page">
                <h1>Leaderboards</h1>
                {displayCategories &&
                    <>
                        <ul className="categories">
                            {
                                categories.map((cat, index) => {
                                    return <li key={index} onClick={() => toggleLevel()}>{cat}</li>
                                })}
                        </ul>
                        <Link className="backBtn" to={'/home'}>Back</Link>
                    </>
                }
                {displayLevels &&
                    <>
                        <ul className="categories">
                            <li onClick={() => selectedLevel('easy')}>Easy</li>
                            <li onClick={() => selectedLevel('medium')}>Medium</li>
                            <li onClick={() => selectedLevel('hard')}>Hard</li>
                            <li onClick={() => selectedLevel('')}>Random</li>
                        </ul>
                        <button className="backBtn" onClick={() => toggleLevel()}>Back</button>
                    </>
                }
                {displayLeaderboard &&
                    <>
                    
                    </>
                }
            </div>
            <Link to="/home">Home</Link>
        </div>

    );
}

export default Leaderboard;