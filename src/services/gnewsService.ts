import { newsService, NewsArticle } from "./newsService";
import { GoogleGenAI, Type } from "@google/genai";

const GNEWS_API_KEY = "1a2bd773fe794bea9f85902b11820c94";

export const gnewsService = {
  async fetchAndImportWorldNews(): Promise<number> {
    try {
      const response = await fetch(
        `https://gnews.io/api/v4/top-headlines?topic=world&lang=en&token=${GNEWS_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`GNews API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      const articles = data.articles || [];
      
      let importedCount = 0;
      
      for (const article of articles) {
        if (!article.title || !article.description || !article.image) continue;
        
        // Translate and transform
        const transformedNews = await this.transformArticle(article);
        
        // Save to Firestore
        await newsService.addNews(transformedNews);
        importedCount++;
      }
      
      return importedCount;
    } catch (error) {
      console.error("Error fetching/importing GNews:", error);
      throw error;
    }
  },

  async transformArticle(article: any): Promise<Omit<NewsArticle, "id" | "views">> {
    const apiKey = process.env.GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
    
    let title = article.title;
    let description = article.description;
    let keywords: string[] = [];

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Translate the following news title and description to Bengali and generate up to 20 keywords in Bengali. Return JSON: { "title": "...", "description": "...", "keywords": ["...", "..."] }. Title: ${article.title}. Description: ${article.description}`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          }
        });
        
        const result = JSON.parse(response.text || "{}");
        title = result.title || title;
        description = result.description || description;
        keywords = result.keywords || [];
      } catch (e) {
        console.error("Translation/Keyword generation failed, using original:", e);
      }
    }

    return {
      title,
      description,
      content: article.content || description,
      imageUrl: article.image,
      category: "World",
      author: "GNews",
      publishDate: new Date(article.publishedAt).getTime(),
      trending: false,
      keywords: keywords.length > 0 ? keywords : ["বিশ্ব", "সংবাদ"],
    };
  }
};
