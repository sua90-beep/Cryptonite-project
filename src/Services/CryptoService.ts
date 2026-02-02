import axios from "axios";
import { CryptoModel } from "../Models/CryptoModel";
import { appConfig } from "../Utils/AppConfig";
import { cryptoSlice } from "../Redux/CryptoSlice";
import { store } from "../Redux/store";
import { MoreInfo } from "../Models/MoreInfo";


interface CurrencyDetailData {
    name: string;
    current_price_usd: number;
    market_cap_usd: number;
    volume_24h_usd: number;
    price_change_percentage_30d_in_currency: number;
    price_change_percentage_60d_in_currency: number;
    price_change_percentage_200d_in_currency: number;
}

class CryptoService {
	
    public async getAllCurrencies(): Promise <CryptoModel[]>{
        if (store.getState().currencies.length >0){
            return store.getState().currencies;
        }
        const response= await axios.get<CryptoModel[]>(appConfig.cryptoUrl);
        const currencies= response.data;
        const action= cryptoSlice.actions.initCurrencies(currencies);

        store.dispatch(action);
        return currencies;
    }




    public async getOneCurrency(id: string): Promise<MoreInfo> {
       
        const response = await axios.get<MoreInfo>(appConfig.cryptoInfo + id);
        const singleCurrency = response.data;

        
        return singleCurrency;
    }

    // Get detailed currency data needed for AI recommendations
    public async getCurrencyDetailsForRecommendation(id: string): Promise<CurrencyDetailData> {
        try {
            const response = await axios.get<any>(
                `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
            );

            const data = response.data;
            const marketData = data.market_data || {};

            return {
                name: data.name || id,
                current_price_usd: marketData.current_price?.usd || 0,
                market_cap_usd: marketData.market_cap?.usd || 0,
                volume_24h_usd: marketData.total_volume?.usd || 0,
                price_change_percentage_30d_in_currency: marketData.price_change_percentage_30d_in_currency || 0,
                price_change_percentage_60d_in_currency: marketData.price_change_percentage_60d_in_currency || 0,
                price_change_percentage_200d_in_currency: marketData.price_change_percentage_200d_in_currency || 0
            };
        } catch (error) {
            console.error("Error fetching currency details:", error);
            throw error;
        }
    }

}



export const cryptoService = new CryptoService();

