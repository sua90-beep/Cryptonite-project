class AppConfig {
	public readonly cryptoUrl="https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd";
	public readonly cryptoInfo= "https://api.coingecko.com/api/v3/coins/";
    public readonly chatGptUrl="https://api.openai.com/v1/chat/completions";
    public readonly chatGptApiKey= import.meta.env.VITE_CHATGPT_API_KEY;
}

export const appConfig = new AppConfig();
