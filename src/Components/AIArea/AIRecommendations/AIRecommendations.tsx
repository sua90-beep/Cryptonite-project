import { useEffect, useState } from "react";
import "./AIRecommendations.css";
import { CryptoModel } from "../../../Models/CryptoModel";
import { cryptoService } from "../../../Services/CryptoService";
import { gptService } from "../../../Services/AIService";
import { toggleService } from "../../../Services/ToggleService";
import { notify } from "../../../Utils/Notify";

interface RecommendationData {
    currencyId: string;
    currencyName: string;
    recommendation: "Buy" | "Do Not Buy";
    rationale: string;
    isLoading: boolean;
    hasError: boolean;
}

export function AIRecommendations() {
    const [currencies, setCurrencies] = useState<CryptoModel[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [recommendations, setRecommendations] = useState<Map<string, RecommendationData>>(new Map());
    const [isLoadingAll, setIsLoadingAll] = useState<boolean>(false);

    useEffect(() => {
        // Load all currencies
        cryptoService.getAllCurrencies()
            .then(data => setCurrencies(data))
            .catch(err => {
                notify.error("Failed to load currencies");
                console.error(err);
            });

        // Get selected currency IDs from toggle service
        const savedIds = toggleService.getSelectedIds();
        setSelectedIds(savedIds);
    }, []);

    // Filter currencies to only show selected ones
    const selectedCurrencies = currencies.filter(c => selectedIds.includes(c.id!));

    // Generate recommendation for a single currency
    const handleGetRecommendation = async (currencyId: string, currencyName: string) => {
        // Set loading state
        setRecommendations(prev => {
            const newMap = new Map(prev);
            newMap.set(currencyId, {
                ...(prev.get(currencyId) || { currencyId, currencyName, recommendation: "Do Not Buy", rationale: "", hasError: false }),
                isLoading: true,
                hasError: false
            });
            return newMap;
        });

        try {
            // Get detailed currency data
            const currencyData = await cryptoService.getCurrencyDetailsForRecommendation(currencyId);
            
            // Get recommendation from GPT
            const result = await gptService.getRecommendation(currencyData);

            // Update recommendations state
            setRecommendations(prev => {
                const newMap = new Map(prev);
                newMap.set(currencyId, {
                    currencyId,
                    currencyName,
                    recommendation: result.recommendation,
                    rationale: result.rationale,
                    isLoading: false,
                    hasError: false
                });
                return newMap;
            });

            notify.success(`Recommendation generated for ${currencyName}`);
        } catch (error) {
            console.error("Error generating recommendation:", error);
            setRecommendations(prev => {
                const newMap = new Map(prev);
                newMap.set(currencyId, {
                    currencyId,
                    currencyName,
                    recommendation: "Do Not Buy",
                    rationale: "Error generating recommendation. Please try again.",
                    isLoading: false,
                    hasError: true
                });
                return newMap;
            });
            notify.error("Failed to generate recommendation");
        }
    };

    // Generate recommendations for all selected currencies
    const handleGenerateAllRecommendations = async () => {
        setIsLoadingAll(true);
        try {
            for (const currency of selectedCurrencies) {
                await handleGetRecommendation(currency.id!, currency.name!);
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            notify.success("All recommendations generated!");
        } catch (error) {
            console.error("Error generating all recommendations:", error);
            notify.error("Error generating some recommendations");
        } finally {
            setIsLoadingAll(false);
        }
    };

    if (selectedCurrencies.length === 0) {
        return (
            <div className="AIRecommendations empty-state">
                <h2>AI Recommendations</h2>
                <p>No currencies selected yet. Please toggle on some currencies from the main list to get AI recommendations.</p>
            </div>
        );
    }

    return (
        <div className="AIRecommendations">
            <h2>AI Recommendations</h2>
            <p className="subtitle">Get AI-powered buy/sell recommendations for your selected currencies</p>
            
            <div className="recommendations-header">
                <button 
                    className="btn-generate-all" 
                    onClick={handleGenerateAllRecommendations}
                    disabled={isLoadingAll}
                >
                    {isLoadingAll ? "Generating All..." : "Generate All Recommendations"}
                </button>
            </div>

            <div className="recommendations-container">
                {selectedCurrencies.map(currency => {
                    const rec = recommendations.get(currency.id!);
                    return (
                        <div key={currency.id} className="recommendation-card">
                            <div className="card-header">
                                <div className="currency-info">
                                    {currency.image && <img src={currency.image} alt={currency.name} className="currency-image" />}
                                    <div className="currency-details">
                                        <h3>{currency.name}</h3>
                                        <p className="symbol">{currency.symbol?.toUpperCase()}</p>
                                    </div>
                                </div>
                                <button
                                    className="btn-get-recommendation"
                                    onClick={() => handleGetRecommendation(currency.id!, currency.name!)}
                                    disabled={rec?.isLoading}
                                >
                                    {rec?.isLoading ? "Loading..." : "Get Recommendation"}
                                </button>
                            </div>

                            {rec && (
                                <div className={`recommendation-content ${rec.hasError ? "error" : ""}`}>
                                    <div className={`recommendation-status ${rec.recommendation.toLowerCase().replace(" ", "-")}`}>
                                        <span className="status-label">Recommendation:</span>
                                        <span className="status-value">{rec.recommendation}</span>
                                    </div>
                                    <div className="recommendation-rationale">
                                        <p className="rationale-text">{rec.rationale}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
