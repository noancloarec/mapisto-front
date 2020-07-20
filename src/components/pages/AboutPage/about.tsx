import React from 'react';
import { Link } from 'react-router-dom';
export const About: React.FC = () => {
    return (
        <div className="container">
            <Link to="/">
                <h1 className="text-center">Mapisto</h1>
            </Link>
            <p>Mapisto is a project aiming to tell History with clarity.</p>
            <p>Any comment, suggestion or question is much appreciated, send an e-mail to <a href="mailto:noan@mapisto.org">noan@mapisto.org</a></p>
        </div>
    );
};