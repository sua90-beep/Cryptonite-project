import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation

import { NavBar } from "../NavBar/NavBar";
import { Routing } from "../Routing/Routing";
import "./Layout.css";
import { Banner } from "../Banner/Banner";


export function Layout() {
    const [searchTerm, setSearchTerm] = useState<string>("");
    
    // Get the current location (URL path)
    const location = useLocation();

    // Effect that triggers every time the URL changes
    useEffect(() => {
        // Reset the search term whenever the user navigates to a different route
        setSearchTerm("");
    }, [location.pathname]); // Listen specifically to path changes

    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    return (
        <div className="Layout">
            <header className="header">
                <Banner />
            </header>

            <menu>
                {/* IMPORTANT: To make the input box actually clear visually, 
                   you must pass searchTerm back to NavBar as a prop.
                */}
                <NavBar onSearch={handleSearch} searchTerm={searchTerm} />
            </menu>

            <main>
                <Routing searchTerm={searchTerm} />
            </main>

            <footer>
                <div>

                     <p> © 2026 Cryptonite. All rights reserved </p>
                </div>
              
            </footer>
        </div>
    );
}