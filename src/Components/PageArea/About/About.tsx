import "./About.css";
import studentPhoto from "../../../assets/studentimage.jpg";
export function About() {
    
    return (
        <div className="About">
            <div className="content-section">
                <p>
                    Welcome to Cryptonite, your premier destination for real-time cryptocurrency insights and analytics. 
                    Our platform provides a comprehensive overview of the world's top 100 digital currencies, 
                    offering up-to-the-minute price data and detailed market information at your fingertips. 
                    Whether you are tracking live fluctuations through our dynamic reporting tools or seeking 
                    data-driven guidance via our AI-powered investment recommendations, Cryptonite is designed 
                    to keep you ahead in the fast-paced world of virtual finance.
                </p>
            </div>

            <div className="developer-section">
                {/* 2. Display the image using the imported variable */}
                <img 
                    src={studentPhoto}
                    alt="Suha Younis" 
                    className="student-photo" 
                />
                <p>Developed by: Suha Younis</p>
            </div>
        </div>
    );
}
