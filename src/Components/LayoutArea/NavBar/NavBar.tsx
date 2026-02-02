import { ChangeEvent } from "react";
import { NavLink } from "react-router-dom";
import "./NavBar.css";

interface NavBarProps {
    onSearch: (term: string) => void;
    searchTerm: string; // Add this prop to receive the current value
}

export function NavBar({ onSearch, searchTerm }: NavBarProps) {

    const handleSearchChange = (args: ChangeEvent<HTMLInputElement>) => {
        onSearch(args.target.value);
    };

    return (
        <div className="NavBar">
            <NavLink to="/home"> Home</NavLink>
            <NavLink to="/RealTimeReports"> Real time reports</NavLink>
            <NavLink to="/AIRecommendations"> AI Recommendations</NavLink>
            <NavLink to="/About"> About</NavLink>
            
            <input 
                type="search" 
                placeholder="Search coins..." 
                onChange={handleSearchChange}
                value={searchTerm} // This connects the input value to the Layout's state
            />
        </div>
    );
}