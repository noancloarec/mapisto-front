import React from 'react';
import { Link } from 'react-router-dom';
export const About: React.FC = () => {
    return (
        <div className="container about-page">
            <Link to="/">
                <h1 className="text-center">Mapisto</h1>
            </Link>
            <p>Mapisto is a project aiming to tell History with clarity.</p>
            <p>Any comment, suggestion or question is much appreciated, send an e-mail to <a href="mailto:noan@mapisto.org">noan@mapisto.org</a></p>
            <p>The software developed for the project is free and open-source. It is available  <a target="blank" href="https://github.com/cadoman/">on github</a> </p>
            <h2>Sources</h2>
            <h3>Borders</h3>
            <p>The borders were generated thanks to the video&nbsp;
                <a target="blank" href="https://www.youtube.com/watch?v=UY9P0QSxlnI">The History of Europe: Every Year</a>
            </p>
            <h3>Sovereign states</h3>
            <p>The sovereign states where grouped together, the source document is available&nbsp;
                <a target="blank" href="https://docs.google.com/spreadsheets/d/18fsmYh5oGvv3It0uc-z3G9N_HpS0fAoa6VeZXXDDvlk/edit?usp=sharing">here</a>
            </p>
            <h2>Privacy</h2>
            <p>This website does not collect users data</p>
        </div>
    );
};