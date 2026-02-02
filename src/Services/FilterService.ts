

import { CryptoModel } from "../Models/CryptoModel";
class FilterService {
	
    /**
     * Filters the currencies array based on a search term.
     * The search is case-insensitive and checks both name and symbol.
     * @param allCurrencies - The original array of crypto coins.
     * @param searchTerm - The string to search for.
     * @returns A filtered array of coins.
     */
    public filterCurrencies(allCurrencies: CryptoModel[], searchTerm: string): CryptoModel[] {
        // If there is no search term, return the full list
        if (!searchTerm) {
            return allCurrencies;
        }

        // Convert search term to lowercase for case-insensitive comparison
        const lowerSearch = searchTerm.toLowerCase();

        // Return only items that include the search term in their name or symbol
        return allCurrencies.filter(coin => 
            coin.name?.toLowerCase().includes(lowerSearch) || 
            coin.symbol?.toLowerCase().includes(lowerSearch)
        );
    }
}

export const filterService = new FilterService();
