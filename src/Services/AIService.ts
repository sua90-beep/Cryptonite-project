import OpenAI from "openai";
import { Prompt } from "../Models/Prompt";
import { appConfig } from "../Utils/AppConfig";

// Interface for input data
interface CurrencyData {
    name: string;
    current_price_usd: number;
    market_cap_usd: number;
    volume_24h_usd: number;
    price_change_percentage_30d_in_currency: number;
    price_change_percentage_60d_in_currency: number;
    price_change_percentage_200d_in_currency: number;
}

// Interface for the final result
interface RecommendationResult {
    recommendation: "Buy" | "Do Not Buy";
    rationale: string;
}

class GptService {
    // OpenAI configuration
    private openai = new OpenAI({
        apiKey: appConfig.chatGptApiKey,
        dangerouslyAllowBrowser: true 
    });

    // The core GPT completion logic
    public async getCompletion(prompt: Prompt): Promise<string> {
        const body: any = { 
            model: "gpt-4o-mini", // Updated to a valid and fast model
            messages: [
                { role: "system", content: prompt.systemContent },
                { role: "user", content: prompt.userContent }
            ],
            response_format: { type: "json_object" } // Ensures clean JSON response
        };

        const response = await this.openai.chat.completions.create(body);
        return response.choices[0].message.content || "";
    }

    // Generate AI recommendation for a currency
    public async getRecommendation(currencyData: CurrencyData): Promise<RecommendationResult> {
        const systemContent = `You are a financial advisor specializing in cryptocurrency market analysis. 
Provide a clear, professional recommendation (Buy or Do Not Buy) for a given cryptocurrency based on market data.
Always respond in JSON format with exactly these fields:
{
  "recommendation": "Buy" or "Do Not Buy",
  "rationale": "A clear explanatory paragraph (2-3 sentences) detailing the logic behind the recommendation"
}`;

        // Using Number() to prevent "toFixed is not a function" error
        const userContent = `Please analyze the following cryptocurrency data and provide a buy/sell recommendation:

Currency: ${currencyData.name}
Current Price (USD): $${Number(currencyData.current_price_usd).toLocaleString('en-US', { maximumFractionDigits: 2 })}
Market Cap (USD): $${Number(currencyData.market_cap_usd).toLocaleString('en-US', { maximumFractionDigits: 0 })}
24h Volume (USD): $${Number(currencyData.volume_24h_usd).toLocaleString('en-US', { maximumFractionDigits: 0 })}
30-Day Price Change: ${Number(currencyData.price_change_percentage_30d_in_currency || 0).toFixed(2)}%
60-Day Price Change: ${Number(currencyData.price_change_percentage_60d_in_currency || 0).toFixed(2)}%
200-Day Price Change: ${Number(currencyData.price_change_percentage_200d_in_currency || 0).toFixed(2)}%

Based on this data, should I buy or not buy this cryptocurrency?`;

        const prompt = new Prompt();
        prompt.systemContent = systemContent;
        prompt.userContent = userContent;

        try {
            const response = await this.getCompletion(prompt);
            const parsed = JSON.parse(response);
            
            return {
                recommendation: parsed.recommendation,
                rationale: parsed.rationale
            };
        } catch (error) {
            console.error("Error generating/parsing recommendation:", error);
            return {
                recommendation: "Do Not Buy",
                rationale: "Unable to generate recommendation due to a data error. Please try again later."
            };
        }
    }
}

export const gptService = new GptService();