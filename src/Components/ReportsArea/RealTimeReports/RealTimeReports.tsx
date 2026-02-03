import { useEffect, useState } from "react";
import { cryptoService } from "../../../Services/CryptoService";
import { toggleService } from "../../../Services/ToggleService";
import { CryptoModel } from "../../../Models/CryptoModel";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from "chart.js";
import "./RealTimeReports.css";

// Registering Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function RealTimeReports() {
    const [allCurrencies, setAllCurrencies] = useState<CryptoModel[]>([]);
    const [chartData, setChartData] = useState<any>({ labels: [], datasets: [] });
    const [loadingCurrencies, setLoadingCurrencies] = useState(true);
    const [isFetchingInitialPrices, setIsFetchingInitialPrices] = useState(false);

    // 1. Initial Load: Get the list of all currencies from the service
    useEffect(() => {
        cryptoService.getAllCurrencies()
            .then(list => {
                setAllCurrencies(list);
                setLoadingCurrencies(false);
            })
            .catch(() => setLoadingCurrencies(false));
    }, []);

    // 2. Real-time Logic: Fetch prices for selected IDs
    useEffect(() => {
        const selectedIds = toggleService.getSelectedIds();
        
        // Find symbols matching the selected IDs
        const symbols = allCurrencies
            .filter(c => selectedIds.includes(c.id!))
            .map(c => c.symbol!.toUpperCase());

        if (symbols.length === 0) {
            setIsFetchingInitialPrices(false);
            return;
        }

        // We are starting to fetch data, show the spinner instead of "No coins"
        setIsFetchingInitialPrices(true);

        const fetchData = async () => {
            try {
                const fsyms = symbols.join(",");
                const response = await fetch(`https://min-api.cryptocompare.com/data/pricemulti?tsyms=USD&fsyms=${fsyms}`);
                const data = await response.json();
                
                const now = new Date().toLocaleTimeString();

                setChartData((prev: any) => {
                    const newLabels = [...prev.labels, now].slice(-15); // Keep last 15 data points
                    const newDatasets = symbols.map((sym, index) => {
                        const oldDataset = prev.datasets.find((d: any) => d.label === sym);
                        const newData = [...(oldDataset?.data || []), data[sym]?.USD].slice(-15);
                        
                        // Define distinct colors for different lines
                        const colors = ["#00f2ff", "#8a2be2", "#ff007f", "#00ff88", "#ffea00"];
                        
                        return {
                            label: sym,
                            data: newData,
                            borderColor: colors[index % colors.length],
                            backgroundColor: "transparent",
                            tension: 0.4, // Smooth line curves
                            pointRadius: 2,
                        };
                    });

                    return { labels: newLabels, datasets: newDatasets };
                });

                // Data received, hide initial loading spinner
                setIsFetchingInitialPrices(false);
            } catch (err) {
                console.error("Fetch error:", err);
                setIsFetchingInitialPrices(false);
            }
        };

        // Execution: Call immediately then set interval
        fetchData(); 
        const interval = setInterval(fetchData, 2000);

        return () => clearInterval(interval);
    }, [allCurrencies]);

    // Chart Configuration Options
    const options: ChartOptions <'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                position: "top" as const, 
                labels: { color: "#ffffff", font: { size: 12, weight: 'bold' } } 
            },
        },
        scales: {
            y: { 
                ticks: { color: "#94a3b8" }, 
                grid: { color: "rgba(255, 255, 255, 0.05)" } 
            },
            x: { 
                ticks: { color: "#94a3b8" }, 
                grid: { display: false } 
            }
        }
    };

    return (
        <div className="RealTimeReports">
            <h3 className="rt-title">Real-Time Price Analysis</h3>

            {/* Case 1: Initial loading of the whole app/currencies */}
            {(loadingCurrencies || (isFetchingInitialPrices && chartData.datasets.length === 0)) && (
                <div className="rt-loading">
                    <div className="spinner"></div>
                    <p>Connecting to live crypto markets...</p>
                </div>
            )}

            {/* Case 2: Chart is ready with data */}
            {!loadingCurrencies && chartData.datasets.length > 0 && (
                <div className="rt-chart-container">
                    <Line options={options} data={chartData} height={400} />
                </div>
            )}

            {/* Case 3: No coins were selected by the user */}
            {!loadingCurrencies && !isFetchingInitialPrices && chartData.datasets.length === 0 && (
                <div className="rt-empty">
                    <p>No coins selected for tracking.</p>
                    <span>Please go to the Home page and toggle the coins you wish to monitor.</span>
                </div>
            )}
        </div>
    );
}