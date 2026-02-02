import { useEffect, useState } from "react";
import "./CryptoList.css";
import { CryptoModel } from "../../../Models/CryptoModel";
import { cryptoService } from "../../../Services/CryptoService";
import { notify } from "../../../Utils/Notify";
import { CryptoCard } from "../CryptoCard/CryptoCard";
import { toggleService } from "../../../Services/ToggleService";
import { filterService } from "../../../Services/FilterService"; 
import { Dialog } from "../../Dialog/Dialog";

interface CryptoListProps {
    searchTerm: string;
}

export function CryptoList({ searchTerm }: CryptoListProps) {

    const [currencies, setCurrencies] = useState<CryptoModel[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

    useEffect(() => {
        // Fetch all currencies from the API on component mount
        cryptoService.getAllCurrencies()
            .then(data => setCurrencies(data))
            .catch(err => notify.error(err));

        // Sync selected coin IDs from LocalStorage
        const savedIds = toggleService.getSelectedIds();
        setSelectedIds(savedIds);
    }, []);

    // Logic to handle coin selection and the 5-coin limit
    const handleToggle = (id: string) => {
        const result = toggleService.toggleCoin(id);
        
        // Refresh the selection state from the service/localStorage
        const currentIds = toggleService.getSelectedIds();
        setSelectedIds(currentIds);

        // If the user tries to select more than 5, open the management dialog
        if (result.limitReached) {
            setIsDialogOpen(true);
        }
    };

    // Filter the existing array in memory based on the searchTerm from NavBar
    // This happens locally without additional API calls for maximum efficiency
    const filteredCurrencies = filterService.filterCurrencies(currencies, searchTerm);

    return (
        <div className="CryptoList">
            {/* Render only the currencies that match the search criteria */}
            {filteredCurrencies.map(c => (
                <CryptoCard
                    key={c.id}
                    currency={c}
                    isChecked={selectedIds.includes(c.id!)}
                    onChange={() => handleToggle(c.id!)}
                />
            ))}

            {/* Selection management modal */}
            {isDialogOpen && (
                <Dialog 
                    allCurrencies={currencies}
                    selectedIds={selectedIds}
                    onRemove={handleToggle}
                    onClose={() => setIsDialogOpen(false)}
                />
            )}
        </div>
    );
}
    