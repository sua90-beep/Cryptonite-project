import { Navigate, Route, Routes } from "react-router-dom";
import "./Routing.css";
import { RealTimeReports } from "../../ReportsArea/RealTimeReports/RealTimeReports";
import { AIRecommendations} from "../../AIArea/AIRecommendations/AIRecommendations";
import { About } from "../../PageArea/About/About";
import { PageNotFound } from "../../PageArea/PageNotFound/PageNotFound";
import { CryptoList } from "../../CryptoArea/CryptoList/CryptoList";
import { CurrentPrice } from "../../CryptoArea/CurrentPrice/CurrentPrice";

interface RoutingProps {
    searchTerm: string;
}

export function Routing({ searchTerm }: RoutingProps) {
    return (
        <div className="Routing">
            <Routes>
                <Route path="/" element={<Navigate to="/home" />} />
                <Route path="/home" element={<CryptoList searchTerm={searchTerm} />} />
                <Route path="/home/price/:curId" element={<CurrentPrice />} />
                <Route path="/RealTimeReports" element={<RealTimeReports />} />
                <Route path="/AIRecommendations" element={<AIRecommendations />} />
                <Route path="/About" element={<About />} />
                <Route path="*" element={<PageNotFound />} />
            </Routes>
        </div>
    );
}