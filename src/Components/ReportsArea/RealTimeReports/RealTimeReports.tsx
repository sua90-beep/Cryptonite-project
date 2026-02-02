import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { cryptoService } from "../../../Services/CryptoService";
import { toggleService } from "../../../Services/ToggleService";
import { CryptoModel } from "../../../Models/CryptoModel";
import "./RealTimeReports.css";

interface PriceMap {
    [symbol: string]: {
        USD: number;
    };
}

export function RealTimeReports() {
    const [allCurrencies, setAllCurrencies] = useState<CryptoModel[]>([]);
    const [prices, setPrices] = useState<PriceMap>({});
    const [priceHistory, setPriceHistory] = useState<Record<string, number[]>>({});
    const [timestamps, setTimestamps] = useState<number[]>([]);
    const [candleSize, setCandleSize] = useState<number>(5);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [lastUpdated, setLastUpdated] = useState<number | null>(null);

    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        let mounted = true;
        cryptoService.getAllCurrencies()
            .then(list => {
                if (!mounted) return;
                setAllCurrencies(list);
                setLoading(false);
            })
            .catch(() => {
                if (!mounted) return;
                setError("Failed to load currency list");
                setLoading(false);
            });

        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        const fetchOnce = async () => {
            try {
                const selectedIds = toggleService.getSelectedIds();
                if (!selectedIds || selectedIds.length === 0) {
                    setPrices({});
                    setLastUpdated(null);
                    return;
                }

                const selectedSymbols = allCurrencies
                    .filter(c => c.id && selectedIds.includes(c.id))
                    .map(c => (c.symbol || "").toUpperCase())
                    .filter(s => s.length > 0);

                if (selectedSymbols.length === 0) return;

                const fsyms = selectedSymbols.join(",");
                const url = `https://min-api.cryptocompare.com/data/pricemulti?tsyms=USD&fsyms=${encodeURIComponent(fsyms)}`;

                const res = await axios.get<PriceMap>(url);
                const data = res.data || {};
                setPrices(data);

                const now = Date.now();
                const MAX_POINTS = 60;

                // Debug log
                console.log("Fetched prices:", data);
                console.log("Selected symbols:", selectedSymbols);

                // update timestamps
                setTimestamps(prevTs => {
                    const nextTs = [...prevTs, now];
                    if (nextTs.length > MAX_POINTS) nextTs.shift();
                    console.log("Updated timestamps:", nextTs.length, "points");
                    return nextTs;
                });

                // update history for each symbol (keep last MAX_POINTS points)
                setPriceHistory(prev => {
                    const next: Record<string, number[]> = { ...prev };
                    Object.entries(data).forEach(([symbol, obj]) => {
                        const val = obj.USD;
                        const arr = next[symbol] ? [...next[symbol]] : [];
                        arr.push(val);
                        if (arr.length > MAX_POINTS) arr.shift();
                        next[symbol] = arr;
                    });
                    console.log("Updated priceHistory:", Object.keys(next).map(k => `${k}: ${next[k].length} points`));
                    return next;
                });

                setLastUpdated(now);
                setError(null);
            } catch (e) {
                setError("Failed to fetch prices");
            }
        };

        fetchOnce();
        intervalRef.current = window.setInterval(fetchOnce, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allCurrencies]);

    const getNameBySymbol = (symbol: string) => {
        const entry = allCurrencies.find(c => (c.symbol || "").toUpperCase() === symbol.toUpperCase());
        return entry?.name || symbol;
    };

    // render a small SVG sparkline from price history (currently unused, kept for reference)
    // const renderSparkline = (values: number[] | undefined) => {
        // if (!values || values.length === 0) return null;
        // const w = 140;
        // const h = 40;
        // const max = Math.max(...values);
        // const min = Math.min(...values);
        // const range = max - min || 1;

        // const points = values.map((v, i) => {
        //     const x = (i / (values.length - 1 || 1)) * w;
        //     const y = h - ((v - min) / range) * h;
        //     return `${x},${y}`;
        // }).join(" ");

        // return (
        //     <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        //         <polyline points={points} fill="none" stroke="#007bff" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        //     </svg>
        // );
    // };

    // Build candles from per-second history (currently unused, kept for reference)
    // const buildCandles = (history: Record<string, number[]>, ts: number[], candleSize = 5) => {
        // returns Record<symbol, Array<{o,h,l,c,time}>>
        // const result: Record<string, { o: number; h: number; l: number; c: number; time: number }[]> = {};
        // Object.entries(history).forEach(([symbol, values]) => {
        //     const candles: { o: number; h: number; l: number; c: number; time: number }[] = [];
        //     for (let i = 0; i < values.length; i += candleSize) {
        //         const slice = values.slice(i, i + candleSize);
        //         if (slice.length === 0) continue;
        //         const o = slice[0];
        //         const c = slice[slice.length - 1];
        //         const h = Math.max(...slice);
        //         const l = Math.min(...slice);
        //         const timeIndex = Math.min(ts.length - 1, i + slice.length - 1);
        //         const time = ts[timeIndex] ?? Date.now();
        //         candles.push({ o, h, l, c, time });
        //     }
        //     result[symbol] = candles;
        // });
        // return result;
    // };












    // Render combined multi-series line chart for all symbols using SVG
    const renderCandlestickChart = (history: Record<string, number[]>, _unused = candleSize) => {
        const symbols = Object.keys(history).filter(s => history[s] && history[s].length > 0);
        if (symbols.length === 0) return <div className="rt-empty">Loading chart data...</div>;

        const w = 900;
        const h = 320;
        const padding = 48;

        // align series to timestamps (timestamps is global array of times per sample)
        const ts = timestamps.slice();
        if (ts.length < 1) return <div className="rt-empty">Waiting for data...</div>;

        // build global min/max prices across all series (aligning values to ts)
        let globalMin = Infinity;
        let globalMax = -Infinity;
        const seriesPoints: Record<string, { x: number; y: number }[]> = {};

        // prepare color palette
        const colors = symbols.reduce<Record<string, string>>((acc, s, i) => {
            const palette = ["#007bff", "#28a745", "#ff6b6b", "#6f42c1", "#fd7e14", "#20c997"];
            acc[s] = palette[i % palette.length];
            return acc;
        }, {} as Record<string, string>);

        // collect all points and compute min/max
        symbols.forEach(sym => {
            const vals = history[sym] || [];
            if (vals.length === 0) return;
            // right-align the values to timestamps
            const offset = Math.max(0, ts.length - vals.length);
            const pts: { x: number; y: number }[] = [];
            for (let i = 0; i < vals.length; i++) {
                const t = ts[offset + i];
                const price = vals[i];
                if (price == null || !isFinite(price)) continue;
                if (price < globalMin) globalMin = price;
                if (price > globalMax) globalMax = price;
                pts.push({ x: t, y: price });
            }
            if (pts.length > 0) {
                seriesPoints[sym] = pts;
            }
        });

        // ensure we have data to plot
        if (!isFinite(globalMax) || !isFinite(globalMin)) {
            return <div className="rt-empty">Collecting price data...</div>;
        }
        const priceRange = Math.max(globalMax - globalMin, 0.0001);

        // helper to map time->x, price->y
        const minT = ts[0];
        const maxT = ts[ts.length - 1];
        const timeRange = maxT - minT || 1;
        const timeToX = (t: number) => padding + ((t - minT) / timeRange) * (w - padding * 2);
        const priceToY = (p: number) => padding + (1 - (p - globalMin) / priceRange) * (h - padding * 2);

        return (
            <div className="rt-chart">
                <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet">
                    {/* grid + Y labels */}
                    {Array.from({ length: 5 }).map((_, i) => {
                        const y = padding + (i / 4) * (h - padding * 2);
                        const label = (globalMax - (i / 4) * priceRange).toFixed(2);
                        return (
                            <g key={i}>
                                <line x1={padding} x2={w - padding} y1={y} y2={y} stroke="#eef2f6" />
                                <text x={12} y={y + 4} fontSize={11} fill="#6b7280">{label}</text>
                            </g>
                        );
                    })}

                    {/* series polylines */}
                    {symbols.map(sym => {
                        const pts = seriesPoints[sym] || [];
                        if (pts.length === 0) return null;
                        
                        // build polyline string for multi-point line, or just points for single point
                        if (pts.length === 1) {
                            const p = pts[0];
                            return (
                                <g key={sym}>
                                    <circle cx={timeToX(p.x)} cy={priceToY(p.y)} r={4} fill={colors[sym]} stroke="#fff" strokeWidth={1.5} />
                                </g>
                            );
                        }
                        
                        const pointsAttr = pts.map(p => `${timeToX(p.x)},${priceToY(p.y)}`).join(" ");
                        return (
                            <g key={sym}>
                                <polyline points={pointsAttr} fill="none" stroke={colors[sym]} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
                                {/* last value dot */}
                                <circle cx={timeToX(pts[pts.length - 1].x)} cy={priceToY(pts[pts.length - 1].y)} r={4} fill={colors[sym]} stroke="#fff" strokeWidth={1.5} />
                            </g>
                        );
                    })}

                    {/* X-axis ticks */}
                    {(() => {
                        const ticks = Math.min(6, ts.length);
                        const labels: React.ReactNode[] = [];
                        for (let ti = 0; ti < ticks; ti++) {
                            const idx = Math.floor((ti / (ticks - 1)) * (ts.length - 1));
                            const t = ts[idx];
                            const x = timeToX(t);
                            labels.push(<text key={ti} x={x} y={h - 10} fontSize={11} fill="#6b7280" textAnchor="middle">{new Date(t).toLocaleTimeString()}</text>);
                        }
                        return labels;
                    })()}
                </svg>

                <div className="rt-legend" aria-hidden>
                    {symbols.map((s) => (
                        <div className="rt-legend-item" key={s}>
                            <div className="rt-legend-swatch" style={{ background: colors[s] }} />
                            <div>{s} — {getNameBySymbol(s)}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };
    return (
        <div className="RealTimeReports">
            <h3>Real-Time Report (USD)</h3>

            {loading && <div className="rt-loading">Loading currencies...</div>}
            {error && <div className="rt-error">{error}</div>}

            {!loading && Object.keys(prices).length === 0 && <div className="rt-empty">No selected currencies. Use Follow toggles to add up to 5.</div>}

            {Object.keys(prices).length > 0 && (
                <>
                    <div className="rt-controls">
                        <label> Candel Interval: </label>
                        <select value={String(candleSize)} onChange={(e) => setCandleSize(parseInt(e.target.value, 10))}>
                            <option value="1">1s</option>
                            <option value="5">5s</option>
                            <option value="15">15s</option>
                            <option value="60">60s</option>
                        </select>
                    </div>

                    {renderCandlestickChart(priceHistory, candleSize)}
                </>
            )}

            {lastUpdated && <div className="rt-timestamp">Last updated: {new Date(lastUpdated).toLocaleTimeString()}</div>}
        </div>
    );
}
