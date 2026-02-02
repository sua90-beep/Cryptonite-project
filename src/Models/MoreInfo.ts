
export class MoreInfo {
	
    public market_data: {
        current_price?: {
            usd: number
            eur: number
            ils: number

        }
        market_cap?: {
            usd?: number
        }
        total_volume?: {
            usd?: number
        }
        // CoinGecko provides these as nested objects keyed by currency, e.g. price_change_percentage_30d_in_currency.usd
        price_change_percentage_30d_in_currency?: { [currency: string]: number };
        price_change_percentage_60d_in_currency?: { [currency: string]: number };
        price_change_percentage_200d_in_currency?: { [currency: string]: number };
    } | undefined
}
