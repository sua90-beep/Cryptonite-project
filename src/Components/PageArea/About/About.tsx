import "./About.css";
import studentPhoto from "../../../assets/studentimage.jpg";
export function About() {
    
    return (
      <div className="about-container">
    <div className="content-section">
        <h1>About Cryptonite</h1>
        <p className="lead-text">
            Your premier destination for real-time cryptocurrency insights and analytics.
        </p>
        
        <div className="features-grid">
            <div className="feature-item">
                <h3>Live Tracking</h3>
                <p>Comprehensive overview of the top 100 digital currencies with up-to-the-minute data.</p>
            </div>
            <div className="feature-item">
                <h3>AI Insights</h3>
                <p>Data-driven investment recommendations powered by advanced AI models.</p>
            </div>
        </div>
    </div>

    <hr className="divider" />

    <div className="developer-section">
        <div className="image-wrapper">
            <img 
                src={studentPhoto}
                alt="Suha Younis" 
                className="student-photo" 
            />
        </div>
        <div className="developer-info">
            <p className="developed-by">Developed by</p>
            <h2 className="developer-name">Suha Younis</h2>
        </div>
    </div>
</div>
    );
}
