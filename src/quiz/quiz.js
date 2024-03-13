import './quiz.css';




function Quiz() {
    return (
        <div className="Quiz">
        <h1>CI601 Quiz</h1>

        <h2>Score</h2>

        <div className='qAndA'>
            <h2 className='questionNo'>Question </h2>

            <h3 className='question'></h3>

            <ul className='answers'>
                <li className='a1'></li>
                <li className='a2'></li>
                <li className='a3'></li>
                <li className='a4'></li>
            </ul>
        </div>

    </div>
    );
}

export default Quiz;