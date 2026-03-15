import { db } from "../firebase";
import { collection, getDocs, doc, getDoc, query, where, orderBy, limit, addDoc, updateDoc, deleteDoc, serverTimestamp, setDoc, Timestamp, onSnapshot, deleteField } from "firebase/firestore";
import { GoogleGenAI } from "@google/genai";

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  videoUrl?: string;
  additionalImages?: { url: string; caption: string }[];
  category: string;
  author: string;
  publishDate: number;
  views: number;
  trending: boolean;
  keywords: string[];
  union?: string;
  district?: string;
  fileUrl?: string;
}

export interface Ticker {
  id: string;
  text: string;
  isActive: boolean;
  createdAt: number;
}

export interface Ad {
  id: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  createdAt: number;
}

export interface SocialLinks {
  facebook: string;
  twitter: string;
  youtube: string;
  instagram: string;
}

export interface RamadanTimer {
  sehriTime: string;
  iftarTime: string;
  isActive: boolean;
}

export interface PageSettings {
  about: string;
  privacy: string;
  terms: string;
  contact: string;
  copyright?: string;
}

export interface LiveStatus {
  isLive: boolean;
  liveUrl?: string;
  title?: string;
}

export const DISTRICTS = [
  "বাগেরহাট", "বান্দরবান", "বরগুনা", "বরিশাল", "ভোলা", "বগুড়া", "ব্রাহ্মণবাড়িয়া", "চাঁদপুর", "চাঁপাইনবাবগঞ্জ", "চট্টগ্রাম", "চুয়াডাঙ্গা", "কুমিল্লা", "কক্সবাজার", "ঢাকা", "দিনাজপুর", "ফরিদপুর", "ফেনী", "গাইবান্ধা", "গাজীপুর", "গোপালগঞ্জ", "হবিগঞ্জ", "জামালপুর", "যশোর", "ঝালকাঠি", "ঝিনাইদহ", "জয়পুরহাট", "খাগড়াছড়ি", "খুলনা", "কিশোরগঞ্জ", "কুড়িগ্রাম", "কুষ্টিয়া", "লক্ষ্মীপুর", "লালমনিরহাট", "মাদারীপুর", "মাগুরা", "মানিকগঞ্জ", "মেহেরপুর", "মৌলভীবাজার", "মুন্সীগঞ্জ", "ময়মনসিংহ", "নওগাঁ", "নড়াইল", "নারায়ণগঞ্জ", "নরসিংদী", "নাটোর", "নেত্রকোণা", "নীলফামারী", "নোয়াখালী", "পাবনা", "পঞ্চগড়", "পটুয়াখালী", "রাজবাড়ী", "রাজশাহী", "রাঙ্গামাটি", "রংপুর", "সাতক্ষীরা", "শরীয়তপুর", "শেরপুর", "সিরাজগঞ্জ", "সুনামগঞ্জ", "সিলেট", "টাঙ্গাইল", "ঠাকুরগাঁও"
];

export const CATEGORIES = ["সমগ্র বরগুনা", "বরগুনা সদর", "আমতলী", "পাথরঘাটা", "বেতাগী", "বামনা", "তালতলী", "সারাদেশ", "বিশ্ব"];

export const UNIONS = [
  "বদরখালী", "গৌরীচন্না", "ফুলঝুড়ি", "কেওড়াবুনিয়া", "আয়লাপাতাকাটা", "বুড়িরচর", "ঢলুয়া", "বরগুনা সদর", "এম বালিয়াতলী", "নলটোনা",
  "গুলিসাখালী", "কুকুয়া", "আঠারগাছিয়া", "হলদিয়া", "চাওড়া", "আমতলী সদর", "আড়পাঙ্গাশিয়া",
  "পঁচাকোড়ালিয়া", "ছোটবগী", "কড়ইবাড়ীয়া", "শারিকখালী", "বড়বগী সদর", "নিশানবাড়ীয়া", "সোনাকাটা",
  "বিবিচিনি", "বেতাগী সদর", "হোসনাবাদ", "মোকামিয়া", "বুড়ামজুমদার", "কাজিরাবাদ", "সরিষামুড়ি",
  "বুকাবুনিয়া", "বামনা সদর", "রামনা", "ডৌয়াতলা",
  "রায়হানপুর ইউনিয়ন", "নাচনাপাড়া ইউনিয়ন", "চরদুয়ানী ইউনিয়ন", "পাথরঘাটা সদর ইউনিয়ন", "কালমেঘা ইউনিয়ন", "কাকচিড়া ইউনিয়ন", "কাঠালতলী ইউনিয়ন"
];

export const SEARCHABLE_UNIONS = [
  { name: "বদরখালী", search: "badarkhali" },
  { name: "গৌরীচন্না", search: "gourichanna" },
  { name: "ফুলঝুড়ি", search: "fuljhuri" },
  { name: "কেওড়াবুনিয়া", search: "keorabunia" },
  { name: "আয়লাপাতাকাটা", search: "aylapatakata" },
  { name: "বুড়িরচর", search: "burirchar" },
  { name: "ঢলুয়া", search: "dholua" },
  { name: "বরগুনা সদর", search: "barguna sadar" },
  { name: "এম বালিয়াতলী", search: "m baliatali" },
  { name: "নলটোনা", search: "naltona" },
  { name: "গুলিসাখালী", search: "gulisakhali" },
  { name: "কুকুয়া", search: "kukua" },
  { name: "আঠারগাছিয়া", search: "athargachia" },
  { name: "হলদিয়া", search: "haldiya" },
  { name: "চাওড়া", search: "chaora" },
  { name: "আমতলী সদর", search: "amtali sadar" },
  { name: "আড়পাঙ্গাশিয়া", search: "arpangashia" },
  { name: "পঁচাকোড়ালিয়া", search: "panchakoralia" },
  { name: "ছোটবগী", search: "chotobogi" },
  { name: "কড়ইবাড়ীয়া", search: "koraibaria" },
  { name: "শারিকখালী", search: "sharikkhali" },
  { name: "বড়বগী সদর", search: "borobogi sadar" },
  { name: "নিশানবাড়ীয়া", search: "nishanbaria" },
  { name: "সোনাকাটা", search: "sonakata" },
  { name: "বিবিচিনি", search: "bibichini" },
  { name: "বেতাগী সদর", search: "betagi sadar" },
  { name: "হোসনাবাদ", search: "hosnabad" },
  { name: "মোকামিয়া", search: "mokamia" },
  { name: "বুড়ামজুমদার", search: "buramajumdar" },
  { name: "কাজিরাবাদ", search: "kajirabad" },
  { name: "সরিষামুড়ি", search: "sorishamuri" },
  { name: "বুকাবুনিয়া", search: "bukabunia" },
  { name: "বামনা সদর", search: "bamna sadar" },
  { name: "রামনা", search: "ramna" },
  { name: "ডৌয়াতলা", search: "douatala" },
  { name: "রায়হানপুর ইউনিয়ন", search: "raihanpur union" },
  { name: "নাচনাপাড়া ইউনিয়ন", search: "nachnapara union" },
  { name: "চরদুয়ানী ইউনিয়ন", search: "charduani union" },
  { name: "পাথরঘাটা সদর ইউনিয়ন", search: "patharghata sadar union" },
  { name: "কালমেঘা ইউনিয়ন", search: "kalmegha union" },
  { name: "কাকচিড়া ইউনিয়ন", search: "kakchira union" },
  { name: "কাঠালতলী ইউনিয়ন", search: "kathaltali union" }
];

/**
 * Safely converts a value to a Date object.
 * Handles Firestore Timestamps, numbers (ms), and date strings.
 */
export const safeDate = (dateVal: any): Date => {
  if (!dateVal) return new Date();
  
  // Handle Firestore Timestamp
  if (typeof dateVal === 'object' && dateVal.seconds !== undefined) {
    return new Date(dateVal.seconds * 1000);
  }
  
  const date = new Date(dateVal);
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return new Date();
  }
  return date;
};

export const sortNewsByTrendingAndDate = (a: NewsArticle, b: NewsArticle) => {
  if (a.trending && !b.trending) return -1;
  if (!a.trending && b.trending) return 1;
  return b.publishDate - a.publishDate;
};

// Initial empty states
let mockNews: NewsArticle[] = [];
let mockTickers: Ticker[] = [];
let mockAds: Ad[] = [];
let mockSocialLinks: SocialLinks = {
  facebook: "",
  twitter: "",
  youtube: "",
  instagram: ""
};
let mockRamadanTimer: RamadanTimer = {
  sehriTime: "",
  iftarTime: "",
  isActive: false
};
let mockPageSettings: PageSettings = {
  about: "",
  privacy: "",
  terms: "",
  contact: ""
};

export interface SearchFilters {
  query?: string;
  startDate?: number;
  endDate?: number;
  category?: string;
  author?: string;
  union?: string;
}

export const newsService = {
  async getAllNews(): Promise<NewsArticle[]> {
    if (db) {
      try {
        const q = query(collection(db, "news"));
        const snapshot = await getDocs(q);
        const news = snapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id, 
            ...data,
            publishDate: data.publishDate instanceof Timestamp ? data.publishDate.toMillis() : data.publishDate,
            author: data.author === "xpeee01@gmail.com" ? "Admin" : data.author
          } as NewsArticle;
        });
        return news.sort(sortNewsByTrendingAndDate);
      } catch (error) {
        console.warn("Firestore error in getAllNews, falling back to mock data:", error);
      }
    }
    return [...mockNews].sort(sortNewsByTrendingAndDate);
  },

  subscribeToNews(callback: (news: NewsArticle[]) => void): () => void {
    if (!db) return () => {};
    
    const q = query(collection(db, "news"));
    return onSnapshot(q, (snapshot) => {
      const news = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          publishDate: data.publishDate instanceof Timestamp ? data.publishDate.toMillis() : data.publishDate,
          author: data.author === "xpeee01@gmail.com" ? "Admin" : data.author
        } as NewsArticle;
      });
      callback(news.sort(sortNewsByTrendingAndDate));
    }, (error) => {
      console.error("Firestore subscribeToNews error:", error);
    });
  },

  async getTrendingNews(): Promise<NewsArticle[]> {
    if (db) {
      try {
        // Removed orderBy to avoid requiring a composite index
        const q = query(collection(db, "news"), where("trending", "==", true));
        const snapshot = await getDocs(q);
        const news = snapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id, 
            ...data,
            author: data.author === "xpeee01@gmail.com" ? "Admin" : data.author
          } as NewsArticle;
        });
        return news.sort(sortNewsByTrendingAndDate).slice(0, 5);
      } catch (error) {
        console.warn("Firestore error in getTrendingNews, falling back to mock data:", error);
      }
    }
    return mockNews.filter(n => n.trending).sort(sortNewsByTrendingAndDate).slice(0, 5);
  },

  async getNewsByCategory(category: string): Promise<NewsArticle[]> {
    if (db) {
      try {
        // Removed orderBy to avoid requiring a composite index
        const q = query(collection(db, "news"), where("category", "==", category));
        const snapshot = await getDocs(q);
        const news = snapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id, 
            ...data,
            author: data.author === "xpeee01@gmail.com" ? "Admin" : data.author
          } as NewsArticle;
        });
        return news.sort(sortNewsByTrendingAndDate);
      } catch (error) {
        console.warn("Firestore error in getNewsByCategory, falling back to mock data:", error);
      }
    }
    return mockNews.filter(n => n.category === category).sort(sortNewsByTrendingAndDate);
  },

  async getNewsByUnion(union: string): Promise<NewsArticle[]> {
    if (db) {
      try {
        const q = query(collection(db, "news"), where("union", "==", union));
        const snapshot = await getDocs(q);
        const news = snapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id, 
            ...data,
            author: data.author === "xpeee01@gmail.com" ? "Admin" : data.author
          } as NewsArticle;
        });
        return news.sort(sortNewsByTrendingAndDate);
      } catch (error) {
        console.warn("Firestore error in getNewsByUnion, falling back to mock data:", error);
      }
    }
    return mockNews.filter(n => n.union === union).sort(sortNewsByTrendingAndDate);
  },

  async getNewsById(id: string): Promise<NewsArticle | null> {
    if (db) {
      try {
        const docRef = doc(db, "news", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          return { 
            id: docSnap.id, 
            ...data,
            publishDate: data.publishDate instanceof Timestamp ? data.publishDate.toMillis() : data.publishDate,
            author: data.author === "xpeee01@gmail.com" ? "Admin" : data.author
          } as NewsArticle;
        }
        return null;
      } catch (error) {
        console.warn("Firestore error in getNewsById, falling back to mock data:", error);
      }
    }
    return mockNews.find(n => n.id === id) || null;
  },

  async searchNews(filters: SearchFilters | string): Promise<NewsArticle[]> {
    const allNews = await this.getAllNews();
    
    // Handle legacy string query
    const searchFilters: SearchFilters = typeof filters === 'string' ? { query: filters } : filters;
    
    return allNews.filter(n => {
      // Query filter
      if (searchFilters.query?.trim()) {
        const searchTerms = searchFilters.query.toLowerCase().split(/\s+/).filter(t => t.length > 0);
        const titleLower = n.title.toLowerCase();
        const descLower = n.description.toLowerCase();
        const contentLower = n.content.toLowerCase();
        const keywordsLower = n.keywords?.map(k => k.toLowerCase()) || [];
        
        const matchesQuery = searchTerms.some(term => 
          titleLower.includes(term) || 
          descLower.includes(term) || 
          contentLower.includes(term) ||
          keywordsLower.some(k => k.includes(term))
        );
        if (!matchesQuery) return false;
      }
      
      // Category filter
      if (searchFilters.category && n.category !== searchFilters.category) {
        return false;
      }
      
      // Author filter
      if (searchFilters.author && n.author !== searchFilters.author) {
        return false;
      }
      
      // Date range filter
      const publishDate = safeDate(n.publishDate).getTime();
      if (searchFilters.startDate && publishDate < searchFilters.startDate) {
        return false;
      }
      if (searchFilters.endDate) {
        // Set end date to end of day
        const endOfDay = new Date(searchFilters.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (publishDate > endOfDay.getTime()) {
          return false;
        }
      }
      
      return true;
    });
  },

  async getAuthors(): Promise<string[]> {
    const allNews = await this.getAllNews();
    const authors = new Set(allNews.map(n => n.author));
    return Array.from(authors).filter((a): a is string => !!a).sort();
  },

  // Admin Methods
  async addNews(news: Omit<NewsArticle, "id" | "views">): Promise<string> {
    console.log("Attempting to add news:", news);
    
    // Clean up empty optional fields
    const newsData = { ...news };
    if (!newsData.videoUrl) delete newsData.videoUrl;
    if (!newsData.union) delete newsData.union;

    if (db) {
      try {
        const docRef = await addDoc(collection(db, "news"), {
          ...newsData,
          views: 0,
          publishDate: serverTimestamp(),
          author: newsData.author || "Admin"
        });
        console.log("News added to Firestore with ID:", docRef.id);
        return docRef.id;
      } catch (error) {
        console.error("Firestore addNews error, falling back to mock:", error);
      }
    }
    
    const newId = Math.random().toString(36).substring(7);
    const newArticle = { ...newsData, id: newId, views: 0, publishDate: Date.now(), author: newsData.author || "Admin" };
    mockNews.push(newArticle as NewsArticle);
    console.log("News added to mock storage:", newArticle);
    return newId;
  },

  async updateNews(id: string, news: Partial<NewsArticle>): Promise<void> {
    // Clean up empty optional fields and immutable fields
    const newsData: any = { ...news };
    if (newsData.videoUrl === "") newsData.videoUrl = deleteField();
    if (newsData.union === "") newsData.union = deleteField();
    
    // Do not update immutable fields
    delete newsData.publishDate;
    delete newsData.author;
    delete newsData.id;

    if (db) {
      try {
        const docRef = doc(db, "news", id);
        await updateDoc(docRef, newsData);
        return;
      } catch (error) {
        console.error("Firestore updateNews error, falling back to mock:", error);
      }
    }
    const index = mockNews.findIndex(n => n.id === id);
    if (index !== -1) {
      const updatedMock = { ...mockNews[index], ...news };
      if (news.videoUrl === "") delete updatedMock.videoUrl;
      if (news.union === "") delete updatedMock.union;
      mockNews[index] = updatedMock as NewsArticle;
    }
  },

  async deleteNews(id: string): Promise<void> {
    if (db) {
      try {
        const docRef = doc(db, "news", id);
        await deleteDoc(docRef);
        return;
      } catch (error) {
        console.error("Firestore deleteNews error, falling back to mock:", error);
      }
    }
    mockNews = mockNews.filter(n => n.id !== id);
  },

  // Ticker Methods
  async getTickers(): Promise<Ticker[]> {
    if (db) {
      try {
        const q = query(collection(db, "tickers"));
        const snapshot = await getDocs(q);
        const tickers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticker));
        return tickers.sort((a, b) => b.createdAt - a.createdAt);
      } catch (error) {
        console.warn("Firestore error in getTickers, falling back to mock data:", error);
      }
    }
    return [...mockTickers].sort((a, b) => b.createdAt - a.createdAt);
  },

  async getActiveTickers(): Promise<Ticker[]> {
    if (db) {
      try {
        // Removed orderBy to avoid requiring a composite index
        const q = query(collection(db, "tickers"), where("isActive", "==", true));
        const snapshot = await getDocs(q);
        const tickers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticker));
        return tickers.sort((a, b) => b.createdAt - a.createdAt);
      } catch (error) {
        console.warn("Firestore error in getActiveTickers, falling back to mock data:", error);
      }
    }
    return mockTickers.filter(t => t.isActive).sort((a, b) => b.createdAt - a.createdAt);
  },

  async addTicker(text: string): Promise<string> {
    if (db) {
      try {
        const docRef = await addDoc(collection(db, "tickers"), {
          text,
          isActive: true,
          createdAt: Date.now()
        });
        return docRef.id;
      } catch (error) {
        console.error("Firestore addTicker error, falling back to mock:", error);
      }
    }
    const newId = Math.random().toString(36).substring(7);
    mockTickers.push({ id: newId, text, isActive: true, createdAt: Date.now() });
    return newId;
  },

  async updateTicker(id: string, updates: Partial<Ticker>): Promise<void> {
    if (db) {
      try {
        const docRef = doc(db, "tickers", id);
        await updateDoc(docRef, updates);
        return;
      } catch (error) {
        console.error("Firestore updateTicker error:", error);
      }
    }
    const index = mockTickers.findIndex(t => t.id === id);
    if (index !== -1) {
      mockTickers[index] = { ...mockTickers[index], ...updates };
    }
  },

  async deleteTicker(id: string): Promise<void> {
    if (db) {
      try {
        const docRef = doc(db, "tickers", id);
        await deleteDoc(docRef);
        return;
      } catch (error) {
        console.error("Firestore deleteTicker error:", error);
      }
    }
    mockTickers = mockTickers.filter(t => t.id !== id);
  },

  // Ad Methods
  async getAds(): Promise<Ad[]> {
    if (db) {
      try {
        const q = query(collection(db, "ads"));
        const snapshot = await getDocs(q);
        const ads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad));
        return ads.sort((a, b) => b.createdAt - a.createdAt);
      } catch (error) {
        console.warn("Firestore error in getAds, falling back to mock data:", error);
      }
    }
    return [...mockAds].sort((a, b) => b.createdAt - a.createdAt);
  },

  async getActiveAds(): Promise<Ad[]> {
    if (db) {
      try {
        // Removed orderBy to avoid requiring a composite index
        const q = query(collection(db, "ads"), where("isActive", "==", true));
        const snapshot = await getDocs(q);
        const ads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad));
        return ads.sort((a, b) => b.createdAt - a.createdAt);
      } catch (error) {
        console.warn("Firestore error in getActiveAds, falling back to mock data:", error);
      }
    }
    return mockAds.filter(a => a.isActive).sort((a, b) => b.createdAt - a.createdAt);
  },

  async addAd(ad: Omit<Ad, "id" | "createdAt">): Promise<string> {
    if (db) {
      try {
        const docRef = await addDoc(collection(db, "ads"), {
          ...ad,
          createdAt: Date.now()
        });
        return docRef.id;
      } catch (error) {
        console.error("Firestore addAd error, falling back to mock:", error);
      }
    }
    const newId = Math.random().toString(36).substring(7);
    mockAds.push({ ...ad, id: newId, createdAt: Date.now() });
    return newId;
  },

  async updateAd(id: string, updates: Partial<Ad>): Promise<void> {
    if (db) {
      try {
        const docRef = doc(db, "ads", id);
        await updateDoc(docRef, updates);
        return;
      } catch (error) {
        console.error("Firestore updateAd error:", error);
      }
    }
    const index = mockAds.findIndex(a => a.id === id);
    if (index !== -1) {
      mockAds[index] = { ...mockAds[index], ...updates };
    }
  },

  async deleteAd(id: string): Promise<void> {
    if (db) {
      try {
        const docRef = doc(db, "ads", id);
        await deleteDoc(docRef);
        return;
      } catch (error) {
        console.error("Firestore deleteAd error:", error);
      }
    }
    mockAds = mockAds.filter(a => a.id !== id);
  },

  // Social Links Methods
  async getSocialLinks(): Promise<SocialLinks> {
    if (db) {
      try {
        const docRef = doc(db, "settings", "social");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data() as SocialLinks;
        }
      } catch (error) {
        console.warn("Firestore error in getSocialLinks, falling back to mock data:", error);
      }
    }
    return mockSocialLinks;
  },

  async updateSocialLinks(links: SocialLinks): Promise<void> {
    mockSocialLinks = { ...links };

    if (db) {
      try {
        const docRef = doc(db, "settings", "social");
        await setDoc(docRef, links, { merge: true });
      } catch (error: any) {
        console.error("Firestore updateSocialLinks error:", error);
        if (error.code === 'permission-denied') {
          throw new Error("Permission Denied.");
        }
        throw error;
      }
    }
  },

  // Ramadan Timer Methods
  async getRamadanTimer(): Promise<RamadanTimer> {
    if (db) {
      try {
        const docRef = doc(db, "settings", "ramadan");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data() as RamadanTimer;
        }
      } catch (error) {
        console.warn("Firestore error in getRamadanTimer, falling back to mock data:", error);
      }
    }
    return mockRamadanTimer;
  },

  async updateRamadanTimer(timer: RamadanTimer): Promise<void> {
    // Always update local state first for immediate UI response
    mockRamadanTimer = { ...timer };

    if (db) {
      try {
        const docRef = doc(db, "settings", "ramadan");
        await setDoc(docRef, timer, { merge: true });
      } catch (error: any) {
        console.error("Firestore updateRamadanTimer error:", error);
        if (error.code === 'permission-denied') {
          throw new Error("Permission Denied. Please check your security rules.");
        }
        throw error;
      }
    }
  },

  // Page Settings Methods
  async getPageSettings(): Promise<PageSettings> {
    if (db) {
      try {
        const docRef = doc(db, "settings", "pages");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data() as PageSettings;
        }
      } catch (error) {
        console.warn("Firestore error in getPageSettings, falling back to mock data:", error);
      }
    }
    return mockPageSettings;
  },

  async updatePageSettings(settings: PageSettings): Promise<void> {
    mockPageSettings = { ...settings };

    if (db) {
      try {
        const docRef = doc(db, "settings", "pages");
        await setDoc(docRef, settings, { merge: true });
      } catch (error: any) {
        console.error("Firestore updatePageSettings error:", error);
        if (error.code === 'permission-denied') {
          throw new Error("Permission Denied.");
        }
        throw error;
      }
    }
  },

  // Parliament Live Detection
  async checkParliamentLive(): Promise<LiveStatus> {
    const apiKey = process.env.GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("Gemini API key is missing, skipping live check.");
      return { isLive: false };
    }
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Is the Bangladesh Parliament (Jatiya Sangsad) currently in session and broadcasting live? If yes, provide the live stream URL (usually YouTube). Return JSON: { isLive: boolean, liveUrl?: string, title?: string }",
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        }
      });

      const text = response.text || "{}";
      const result = JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim());
      
      return {
        isLive: result.isLive || false,
        liveUrl: result.liveUrl || "https://www.youtube.com/@BangladeshParliament/live",
        title: result.title || "National Parliament is broadcasting live"
      };
    } catch (error: any) {
      const errorString = String(error);
      if (errorString.includes("429") || errorString.includes("RESOURCE_EXHAUSTED") || errorString.includes("quota")) {
        // Silently fail on quota exhaustion to prevent console spam
        return { isLive: false };
      }
      console.error("Error checking parliament live status:", error);
      return { isLive: false };
    }
  }
};
