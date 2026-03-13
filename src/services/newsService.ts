import { db } from "../firebase";
import { collection, getDocs, doc, getDoc, query, where, orderBy, limit, addDoc, updateDoc, deleteDoc, serverTimestamp, setDoc, Timestamp, onSnapshot, deleteField } from "firebase/firestore";
import { GoogleGenAI } from "@google/genai";

// Helper to handle localStorage persistence for mock data
const STORAGE_KEYS = {
  NEWS: "daily_barguna_news",
  TICKERS: "daily_barguna_tickers",
  ADS: "daily_barguna_ads",
  SOCIAL: "daily_barguna_social",
  RAMADAN: "daily_barguna_ramadan",
  PAGES: "daily_barguna_pages"
};

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving to localStorage", e);
  }
};

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  imageCaption?: string;
  videoUrl?: string;
  additionalImages?: string[];
  category: string;
  author: string;
  publishDate: number;
  views: number;
  trending: boolean;
  keywords: string[];
  union?: string;
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
}

export interface LiveStatus {
  isLive: boolean;
  liveUrl?: string;
  title?: string;
}

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

// Mock Data strictly for Barguna District
let mockNews: NewsArticle[] = loadFromStorage(STORAGE_KEYS.NEWS, [
  {
    id: "1",
    title: "বরগুনা সদরে নতুন আধুনিক হাসপাতালের ভিত্তিপ্রস্তর স্থাপন",
    description: "বরগুনা সদর উপজেলার মানুষের দীর্ঘদিনের দাবি পূরণে নতুন একটি আধুনিক হাসপাতালের ভিত্তিপ্রস্তর স্থাপন করা হয়েছে।",
    content: "<p>বরগুনা সদর উপজেলার মানুষের দীর্ঘদিনের দাবি পূরণে নতুন একটি আধুনিক হাসপাতালের ভিত্তিপ্রস্তর স্থাপন করা হয়েছে। স্বাস্থ্যমন্ত্রী আজ সকালে এই ভিত্তিপ্রস্তর স্থাপন করেন। এর ফলে জেলার চিকিৎসা ব্যবস্থায় আমূল পরিবর্তন আসবে বলে আশা করা হচ্ছে।</p><p>স্থানীয় জনপ্রতিনিধিরা জানান, এই হাসপাতালটি চালু হলে সাধারণ মানুষকে আর চিকিৎসার জন্য বরিশাল বা ঢাকায় যেতে হবে পরিচয়।</p>",
    imageUrl: "https://picsum.photos/seed/hospital-barguna/800/500",
    category: "বরগুনা সদর",
    author: "Admin",
    publishDate: Date.now() - 100000,
    views: 1250,
    trending: true,
    keywords: ["হাসপাতাল", "ভিত্তিপ্রস্তর", "বরগুনা সদর", "চিকিৎসা", "স্বাস্থ্য"],
  },
  {
    id: "2",
    title: "পাথরঘাটায় ইলিশের বাম্পার ফলন, জেলেদের মুখে হাসি",
    description: "বঙ্গোপসাগরে মাছ ধরার নিষেধাজ্ঞা শেষে পাথরঘাটার বিএফডিসি মৎস্য অবতরণ কেন্দ্রে প্রচুর ইলিশ ধরা পড়ছে।",
    content: "<p>বঙ্গোপসাগরে মাছ ধরার নিষেধাজ্ঞা শেষে পাথরঘাটার বিএফডিসি মৎস্য অবতরণ কেন্দ্রে প্রচুর ইলিশ ধরা পড়ছে। প্রতিদিন শত শত ট্রলার মাছ নিয়ে ঘাটে ফিরছে।</p><p>মৎস্য ব্যবসায়ীরা জানান, গত কয়েক বছরের তুলনায় এবার ইলিশের আকার বেশ বড় এবং দামও ভালো পাওয়া যাচ্ছে। এতে জেলেদের মুখে হাসি ফুটেছে।</p>",
    imageUrl: "https://picsum.photos/seed/hilsa-patharghata/800/500",
    category: "পাথরঘাটা",
    author: "মৎস্য প্রতিবেদক",
    publishDate: Date.now() - 500000,
    views: 3400,
    trending: true,
    keywords: ["ইলিশ", "পাথরঘাটা", "জেলে", "মৎস্য", "বঙ্গোপসাগর"],
  },
  {
    id: "3",
    title: "আমতলীতে কৃষকদের মাঝে বিনামূল্যে সার ও বীজ বিতরণ",
    description: "আমতলী উপজেলা কৃষি সম্প্রসারণ অধিদপ্তরের উদ্যোগে প্রান্তিক কৃষকদের মাঝে বিনামূল্যে সার ও বীজ বিতরণ করা হয়েছে।",
    content: "<p>আমতলী উপজেলা কৃষি সম্প্রসারণ অধিদপ্তরের উদ্যোগে প্রান্তিক কৃষকদের মাঝে বিনামূল্যে সার ও বীজ বিতরণ করা হয়েছে। রবি মৌসুমের ফসল উৎপাদন বৃদ্ধির লক্ষ্যে এই উদ্যোগ নেওয়া হয়েছে।</p><p>উপজেলা কৃষি কর্মকর্তা জানান, এই প্রণোদনার ফলে কৃষকরা আর্থিকভাবে লাভবান হবেন এবং উৎপাদন বৃদ্ধি পাবে।</p>",
    imageUrl: "https://picsum.photos/seed/agriculture-amtali/800/500",
    category: "আমতলী",
    author: "কৃষি প্রতিবেদক",
    publishDate: Date.now() - 800000,
    views: 890,
    trending: false,
    keywords: ["কৃষক", "আমতলী", "সার", "বীজ", "কৃষি"],
  },
  {
    id: "4",
    title: "বেতাগীতে বিষখালী নদীর ভাঙন রোধে মানববন্ধন",
    description: "বেতাগী উপজেলায় বিষখালী নদীর তীব্র ভাঙন রোধে দ্রুত ব্যবস্থা নেওয়ার দাবিতে মানববন্ধন করেছে এলাকাবাসী।",
    content: "<p>বেতাগী উপজেলায় বিষখালী নদীর তীব্র ভাঙন রোধে দ্রুত ব্যবস্থা নেওয়ার দাবিতে মানববন্ধন করেছে এলাকাবাসী। গত কয়েক সপ্তাহে নদীর ভাঙনে বেশ কয়েকটি বাড়িঘর ও ফসলি জমি বিলীন হয়ে গেছে।</p><p>পানি উন্নয়ন বোর্ডের কর্মকর্তারা জানিয়েছেন, ভাঙন রোধে দ্রুত জিও ব্যাগ ফেলার কাজ শুরু হবে।</p>",
    imageUrl: "https://picsum.photos/seed/river-betagi/800/500",
    category: "বেতাগী",
    author: "উপজেলা প্রতিনিধি",
    publishDate: Date.now() - 1200000,
    views: 2100,
    trending: true,
    keywords: ["বিষখালী", "নদী ভাঙন", "বেতাগী", "মানববন্ধন"],
  },
  {
    id: "5",
    title: "তালতলীতে রাখাইন সম্প্রদায়ের জলকেলি উৎসব পালিত",
    description: "বরগুনার তালতলী উপজেলায় রাখাইন সম্প্রদায়ের ঐতিহ্যবাহী জলকেলি বা সাংগ্রাই উৎসব আনন্দমুখর পরিবেশে পালিত হয়েছে।",
    content: "<p>বরগুনার তালতলী উপজেলায় রাখাইন সম্প্রদায়ের ঐতিহ্যবাহী জলকেলি বা সাংগ্রাই উৎসব আনন্দমুখর পরিবেশে পালিত হয়েছে। নতুন বছরকে বরণ করে নিতে তারা একে অপরের গায়ে পানি ছিটিয়ে এই উৎসব পালন করে।</p><p>স্থানীয় প্রশাসন উৎসব সুষ্ঠুভাবে সম্পন্ন করতে প্রয়োজনীয় নিরাপত্তা ব্যবস্থা গ্রহণ করেছিল।</p>",
    imageUrl: "https://picsum.photos/seed/rakhine-taltali/800/500",
    category: "তালতলী",
    author: "সংস্কৃতি প্রতিবেদক",
    publishDate: Date.now() - 2000000,
    views: 1450,
    trending: false,
    keywords: ["রাখাইন", "জলকেলি", "তালতলী", "উৎসব", "সাংগ্রাই"],
  }
]);

let mockTickers: Ticker[] = loadFromStorage(STORAGE_KEYS.TICKERS, [
  { id: "t1", text: "বরগুনায় নতুন আধুনিক হাসপাতালের ভিত্তিপ্রস্তর স্থাপন করেছেন স্বাস্থ্যমন্ত্রী।", isActive: true, createdAt: Date.now() },
  { id: "t2", text: "পাথরঘাটায় ইলিশের বাম্পার ফলন, জেলেদের মুখে হাসি।", isActive: true, createdAt: Date.now() - 1000 },
  { id: "t3", text: "বিজ্ঞাপন দিন দৈনিক বরগুনায় - যোগাযোগ করুন: info@dailybarguna.com", isActive: true, createdAt: Date.now() - 2000 }
]);

let mockAds: Ad[] = loadFromStorage(STORAGE_KEYS.ADS, [
  { id: "a1", imageUrl: "https://picsum.photos/seed/ad1/1200/150", linkUrl: "#", isActive: true, createdAt: Date.now() }
]);

let mockSocialLinks: SocialLinks = loadFromStorage(STORAGE_KEYS.SOCIAL, {
  facebook: "https://facebook.com",
  twitter: "https://twitter.com",
  youtube: "https://youtube.com",
  instagram: "https://instagram.com"
});

let mockRamadanTimer: RamadanTimer = loadFromStorage(STORAGE_KEYS.RAMADAN, {
  sehriTime: "04:45 AM",
  iftarTime: "06:15 PM",
  isActive: false
});

let mockPageSettings: PageSettings = loadFromStorage(STORAGE_KEYS.PAGES, {
  about: "দৈনিক বরগুনা সম্পর্কে বিস্তারিত তথ্য এখানে থাকবে।",
  privacy: "আমাদের গোপনীয়তা নীতি এখানে থাকবে।",
  terms: "ব্যবহারের শর্তাবলী এখানে থাকবে।",
  contact: "আমাদের সাথে যোগাযোগের ঠিকানা ও তথ্য এখানে থাকবে।"
});

export interface SearchFilters {
  query?: string;
  startDate?: number;
  endDate?: number;
  category?: string;
  author?: string;
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
    saveToStorage(STORAGE_KEYS.NEWS, mockNews);
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
      saveToStorage(STORAGE_KEYS.NEWS, mockNews);
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
    saveToStorage(STORAGE_KEYS.NEWS, mockNews);
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
    saveToStorage(STORAGE_KEYS.TICKERS, mockTickers);
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
      saveToStorage(STORAGE_KEYS.TICKERS, mockTickers);
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
    saveToStorage(STORAGE_KEYS.TICKERS, mockTickers);
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
    saveToStorage(STORAGE_KEYS.ADS, mockAds);
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
      saveToStorage(STORAGE_KEYS.ADS, mockAds);
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
    saveToStorage(STORAGE_KEYS.ADS, mockAds);
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
    saveToStorage(STORAGE_KEYS.SOCIAL, mockSocialLinks);

    if (db) {
      try {
        const docRef = doc(db, "settings", "social");
        await setDoc(docRef, links, { merge: true });
      } catch (error: any) {
        console.error("Firestore updateSocialLinks error:", error);
        if (error.code === 'permission-denied') {
          throw new Error("সেভ করার অনুমতি নেই (Permission Denied)।");
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
    saveToStorage(STORAGE_KEYS.RAMADAN, mockRamadanTimer);

    if (db) {
      try {
        const docRef = doc(db, "settings", "ramadan");
        await setDoc(docRef, timer, { merge: true });
      } catch (error: any) {
        console.error("Firestore updateRamadanTimer error:", error);
        if (error.code === 'permission-denied') {
          throw new Error("ফায়ারবেস ডাটাবেসে সেভ করার অনুমতি নেই। অনুগ্রহ করে সিকিউরিটি রুলস চেক করুন। তবে আপনার ব্রাউজারে এটি সাময়িকভাবে সেভ হয়েছে।");
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
    saveToStorage(STORAGE_KEYS.PAGES, mockPageSettings);

    if (db) {
      try {
        const docRef = doc(db, "settings", "pages");
        await setDoc(docRef, settings, { merge: true });
      } catch (error: any) {
        console.error("Firestore updatePageSettings error:", error);
        if (error.code === 'permission-denied') {
          throw new Error("সেভ করার অনুমতি নেই (Permission Denied)।");
        }
        throw error;
      }
    }
  },

  // Parliament Live Detection
  async checkParliamentLive(): Promise<LiveStatus> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
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
        title: result.title || "জাতীয় সংসদ সরাসরি সম্প্রচারিত হচ্ছে"
      };
    } catch (error) {
      console.error("Error checking parliament live status:", error);
      return { isLive: false };
    }
  }
};
