import "./Banner.css";
import { useState, useEffect } from "react";
import bannerImage from "../../../assets/background.png";

export function Banner() {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="Banner">
            <div className="parallax-bg" style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
            <img src={bannerImage} alt="Parallax Background" className="parallax-image" />
            </div>
            <div className="banner-content" style={{ transform: `translateY(${scrollY * 0.3}px)` }}>
                <h1 className="banner-title">Cryptonite</h1>
            </div>
        </div>
    );
}
