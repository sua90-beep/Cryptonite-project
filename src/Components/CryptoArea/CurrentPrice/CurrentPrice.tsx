import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // For smooth animations
import { cryptoService } from "../../../Services/CryptoService";
import { notify } from "../../../Utils/Notify";
import { MoreInfo } from "../../../Models/MoreInfo";
import "./CurrentPrice.css";

export function CurrentPrice() {
    const [currencyInfo, setCurrencyInfo] = useState<MoreInfo | undefined>();
    const params = useParams();
    const navigate = useNavigate();
    const id = params.curId;

    useEffect(() => {
        if (id) {
            cryptoService.getOneCurrency(id)
                .then(data => setCurrencyInfo(data))
                .catch(err => notify.error(err));
        }
    }, [id]);

    function closeInfo() {
        navigate("/home");
    }

    if (!currencyInfo) return null; // Keep background clean while loading

    return (
        <AnimatePresence>
            <div className="CurrentPriceOverlay" onClick={closeInfo}>
                {/* stopPropogation ensures that clicking inside the card 
                   doesn't trigger the closeInfo on the background 
                */}
                <motion.div 
                    className="price-card"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={(e) => e.stopPropagation()} 
                >
                

                    <div className="price-content">
                        <div className="price-item usd">
                            <span className="label">USD</span>
                            <span className="value">${currencyInfo.market_data?.current_price?.usd?.toLocaleString()}</span>
                        </div>
                        <div className="price-item eur">
                            <span className="label">EUR</span>
                            <span className="value">€{currencyInfo.market_data?.current_price?.eur?.toLocaleString()}</span>
                        </div>
                        <div className="price-item ils">
                            <span className="label">ILS</span>
                            <span className="value">₪{currencyInfo.market_data?.current_price?.ils?.toLocaleString()}</span>
                        </div>
                    </div>

                    <button className="btn-close" onClick={closeInfo}>Close</button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}