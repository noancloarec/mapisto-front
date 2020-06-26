import React from 'react';
import { Link } from 'react-router-dom';
export const Header = React.memo(() => {
    return (
        <header>
            <Link to='/'>
                <h1 className="text-center">
                    Mapisto
            </h1>
            </Link>
        </header>
    );
});