// Dialog.tsx
import { CryptoModel } from "../../Models/CryptoModel";
import "./Dialog.css";

interface DialogProps {
    allCurrencies: CryptoModel[];
    selectedIds: string[];
    onRemove: (id: string) => void;
    onClose: () => void;
}

export function Dialog({ allCurrencies, selectedIds, onRemove, onClose }: DialogProps) {
    // Filter only the coins that are in the selected IDs list
    const selectedCoins = allCurrencies.filter(c => selectedIds.includes(c.id!));

    const handleRemove = (id: string) => {
        onRemove(id);
        // Keep dialog open after removal so user can remove more or select a new coin
    };

    return (
        <div className="dialog-overlay" onClick={onClose}>
            <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
                <h3>Select up to 5 coins only</h3>
                <p>To add a new coin, please remove one of these:</p>
                
                <div className="selected-list">
                    {selectedCoins.map(c => (
                        <div key={c.id} className="selected-item">
                            <img src={c.image} alt={c.name} width="30" />
                            <span>{c.name}</span>
                            <button onClick={() => handleRemove(c.id!)}>Remove</button>
                        </div>
                    ))}
                </div>
                
                <button className="close-btn" onClick={onClose}>Back to List</button>
            </div>
        </div>
    );
}