import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { newsService, NewsArticle, CATEGORIES, SEARCHABLE_UNIONS } from "../services/newsService";
import { Save, X, Image as ImageIcon, Video, Calendar, User, Tag, CheckCircle, Edit, PlusCircle, AlertCircle, Eye, Upload, Search, MapPin } from "lucide-react";
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AddEditNews() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState<Partial<NewsArticle>>({
    title: "",
    description: "",
    content: "",
    imageUrl: "",
    videoUrl: "",
    category: CATEGORIES[0],
    author: "Admin",
    trending: false,
    publishDate: Date.now(),
    keywords: [],
    union: "",
  });
  const [keywordsInput, setKeywordsInput] = useState("");
  const [unionSearch, setUnionSearch] = useState("");
  const [showUnionDropdown, setShowUnionDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAdditionalImage, setUploadingAdditionalImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEdit) {
      const fetchNews = async () => {
        setLoading(true);
        try {
          const data = await newsService.getNewsById(id);
          if (data) {
            setFormData(data);
            setKeywordsInput(data.keywords?.join(", ") || "");
            setUnionSearch(data.union || "");
          } else {
            setError("সংবাদটি পাওয়া যায়নি।");
          }
        } catch (err) {
          setError("সংবাদ লোড করতে সমস্যা হয়েছে।");
        } finally {
          setLoading(false);
        }
      };
      fetchNews();
    }
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    
    if (name === "videoUrl" && typeof val === "string" && !formData.imageUrl) {
      const ytMatch = val.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/);
      if (ytMatch) {
        const id = ytMatch[1].split('&')[0];
        setFormData(prev => ({ ...prev, [name]: val, imageUrl: `https://img.youtube.com/vi/${id}/maxresdefault.jpg` }));
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeywordsInput(e.target.value);
    const keywordsArray = e.target.value.split(",").map(k => k.trim()).filter(k => k.length > 0);
    setFormData(prev => ({ ...prev, keywords: keywordsArray }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError("");

    try {
      if (storage) {
        const storageRef = ref(storage, `news_images/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        setFormData(prev => ({ ...prev, imageUrl: url }));
      } else {
        // Mock upload if Firebase is not configured
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      setError("ছবি আপলোড করতে সমস্যা হয়েছে।");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAdditionalImage(true);
    setError("");

    try {
      if (storage) {
        const storageRef = ref(storage, `news_images/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        setFormData(prev => ({ 
          ...prev, 
          additionalImages: [...(prev.additionalImages || []), url] 
        }));
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ 
            ...prev, 
            additionalImages: [...(prev.additionalImages || []), reader.result as string] 
          }));
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error("Error uploading additional image:", err);
      setError("অতিরিক্ত ছবি আপলোড করতে সমস্যা হয়েছে।");
    } finally {
      setUploadingAdditionalImage(false);
    }
  };

  const removeAdditionalImage = (index: number) => {
    setFormData(prev => {
      const newImages = [...(prev.additionalImages || [])];
      newImages.splice(index, 1);
      return { ...prev, additionalImages: newImages };
    });
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    setError("");

    try {
      if (storage) {
        const storageRef = ref(storage, `news_videos/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        setFormData(prev => ({ ...prev, videoUrl: url }));
      } else {
        // Mock upload if Firebase is not configured
        const url = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, videoUrl: url }));
      }
    } catch (err) {
      console.error("Error uploading video:", err);
      setError("ভিডিও আপলোড করতে সমস্যা হয়েছে।");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isEdit && id) {
        await newsService.updateNews(id, formData);
      } else {
        await newsService.addNews(formData as Omit<NewsArticle, "id" | "views">);
        setFormData({
          title: "",
          description: "",
          content: "",
          imageUrl: "",
          videoUrl: "",
          category: CATEGORIES[0],
          author: "Admin",
          trending: false,
          publishDate: Date.now(),
          keywords: [],
          union: "",
          additionalImages: [],
          imageCaption: "",
        });
        setKeywordsInput("");
        setUnionSearch("");
      }
      navigate("/admin");
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setError(`সংবাদ সংরক্ষণ করতে সমস্যা হয়েছে: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return <div className="animate-pulse space-y-6 max-w-4xl mx-auto">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
      <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
    </div>;
  }

  const filteredUnions = SEARCHABLE_UNIONS.filter(u => 
    u.name.toLowerCase().includes(unionSearch.toLowerCase()) || 
    u.search.toLowerCase().includes(unionSearch.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative">
      <Helmet>
        <title>{isEdit ? "সংবাদ সম্পাদনা" : "নতুন সংবাদ"} - অ্যাডমিন প্যানেল</title>
      </Helmet>

      <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          {isEdit ? <Edit size={28} className="text-blue-600" /> : <PlusCircle size={28} className="text-green-600" />}
          {isEdit ? "সংবাদ সম্পাদনা" : "নতুন সংবাদ যোগ করুন"}
        </h1>
        <button onClick={() => navigate(-1)} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <X size={24} />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md flex items-start">
          <AlertCircle className="text-red-500 mr-3 mt-0.5" size={20} />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        
        {/* Basic Info */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">শিরোনাম <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-lg font-medium transition-colors"
              placeholder="সংবাদের শিরোনাম লিখুন"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">সংক্ষিপ্ত বিবরণ <span className="text-red-500">*</span></label>
            <textarea
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors resize-none"
              placeholder="সংবাদের সংক্ষিপ্ত সারমর্ম (হোমপেজে দেখানোর জন্য)"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">মূল সংবাদ (HTML সমর্থিত) <span className="text-red-500">*</span></label>
            <textarea
              name="content"
              required
              rows={12}
              value={formData.content}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm transition-colors"
              placeholder="<p>বিস্তারিত সংবাদ এখানে লিখুন...</p>"
            />
          </div>
        </div>

        <hr className="border-gray-200 dark:border-gray-700" />

        {/* Media & Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
              <ImageIcon size={20} className="text-blue-500" /> মিডিয়া
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ছবির URL <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <input
                  type="url"
                  name="imageUrl"
                  required
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  placeholder="https://example.com/image.jpg"
                />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300"
                >
                  {uploadingImage ? <span className="animate-spin">⏳</span> : <Upload size={18} />}
                  আপলোড
                </button>
              </div>
              {formData.imageUrl && (
                <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 aspect-video relative group">
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm font-medium">প্রিভিউ</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ছবির ক্যাপশন/নাম (ঐচ্ছিক)</label>
              <input
                type="text"
                name="imageCaption"
                value={formData.imageCaption || ""}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                placeholder="ছবির ক্যাপশন বা নাম লিখুন"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">অতিরিক্ত ছবি (ঐচ্ছিক)</label>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={additionalFileInputRef}
                  onChange={handleAdditionalImageUpload}
                />
                <button
                  type="button"
                  onClick={() => additionalFileInputRef.current?.click()}
                  disabled={uploadingAdditionalImage || (formData.additionalImages?.length || 0) >= 10}
                  className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                >
                  {uploadingAdditionalImage ? <span className="animate-spin">⏳</span> : <Upload size={18} />}
                  অতিরিক্ত ছবি আপলোড করুন (সর্বোচ্চ ১০টি)
                </button>
              </div>
              
              {formData.additionalImages && formData.additionalImages.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {formData.additionalImages.map((imgUrl, index) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 aspect-square">
                      <img src={imgUrl} alt={`Additional ${index}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeAdditionalImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Video size={16} className="text-gray-500" /> ভিডিও URL (ঐচ্ছিক)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  name="videoUrl"
                  value={formData.videoUrl || ""}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  placeholder="YouTube URL অথবা .mp4/.webm লিংক"
                />
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  className="hidden"
                  ref={videoInputRef}
                  onChange={handleVideoUpload}
                />
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploadingVideo}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300"
                >
                  {uploadingVideo ? <span className="animate-spin">⏳</span> : <Upload size={18} />}
                  আপলোড
                </button>
              </div>
              {formData.videoUrl && (
                <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 aspect-video relative group bg-black">
                  {formData.videoUrl.match(/\.(webm|mp4|mov)$/i) ? (
                    <video src={formData.videoUrl} className="w-full h-full object-contain" />
                  ) : (
                    <iframe 
                      src={formData.videoUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/) 
                        ? `https://www.youtube.com/embed/${formData.videoUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/)?.[1].split('&')[0]}` 
                        : formData.videoUrl.match(/(?:https?:\/\/)?(?:www\.)?drive\.google\.com\/file\/d\/(.+?)\/(?:view|preview)/)
                        ? `https://drive.google.com/file/d/${formData.videoUrl.match(/(?:https?:\/\/)?(?:www\.)?drive\.google\.com\/file\/d\/(.+?)\/(?:view|preview)/)?.[1]}/preview`
                        : formData.videoUrl
                      } 
                      className="w-full h-full" 
                    />
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="text-white text-sm font-medium">ভিডিও প্রিভিউ</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
              <Tag size={20} className="text-green-500" /> মেটাডেটা
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ক্যাটাগরি <span className="text-red-500">*</span></label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-gray-500" /> এলাকা/ইউনিয়ন (ঐচ্ছিক)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={unionSearch || formData.union || ""}
                  onChange={(e) => {
                    setUnionSearch(e.target.value);
                    setShowUnionDropdown(true);
                  }}
                  onFocus={() => setShowUnionDropdown(true)}
                  placeholder="ইউনিয়ন খুঁজুন..."
                  className="w-full px-4 py-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                />
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                {formData.union && (
                  <button 
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, union: "" }));
                      setUnionSearch("");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              
              {showUnionDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {filteredUnions.length > 0 ? (
                    filteredUnions.map(u => (
                      <button
                        key={u.name}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, union: u.name }));
                          setUnionSearch(u.name);
                          setShowUnionDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors ${formData.union === u.name ? 'bg-red-50 dark:bg-gray-700 text-red-700 dark:text-red-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}
                      >
                        {u.name}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500 italic">কোন ইউনিয়ন পাওয়া যায়নি</div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <User size={16} className="text-gray-500" /> প্রতিবেদক <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="author"
                required
                value={formData.author}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Tag size={16} className="text-gray-500" /> কীবোর্ড (কমা দিয়ে আলাদা করুন)
              </label>
              <input
                type="text"
                value={keywordsInput}
                onChange={handleKeywordsChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                placeholder="যেমন: বরগুনা, স্বাস্থ্য, হাসপাতাল"
              />
            </div>
            <div className="pt-4">
              <label className="flex items-center space-x-3 cursor-pointer group p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    name="trending"
                    checked={formData.trending}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <div className="w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-500 peer-checked:bg-red-600 peer-checked:border-red-600 transition-colors flex items-center justify-center">
                    <CheckCircle size={16} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">ট্রেন্ডিং সংবাদ হিসেবে চিহ্নিত করুন</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">এই সংবাদটি হোমপেজের ট্রেন্ডিং সেকশনে প্রদর্শিত হবে।</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="flex items-center space-x-2 px-6 py-2.5 border border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors font-medium"
          >
            <Eye size={18} />
            <span>প্রিভিউ</span>
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            বাতিল
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-8 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 font-medium"
          >
            <Save size={18} />
            <span>{loading ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}</span>
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Eye size={20} className="text-blue-500" /> প্রিভিউ
              </h2>
              <button onClick={() => setShowPreview(false)} className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 md:p-10">
              <article className="max-w-3xl mx-auto">
                <header className="mb-8">
                  <div className="text-sm text-red-600 dark:text-red-400 font-bold uppercase tracking-wider mb-4">
                    {formData.category}
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                    {formData.title || "শিরোনাম এখানে প্রদর্শিত হবে"}
                  </h1>
                  <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400 py-4 border-y border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <User size={16} />
                      <span className="font-medium">{formData.author}</span>
                    </div>
                  </div>
                </header>
                
                <figure className="mb-10 rounded-xl overflow-hidden shadow-lg">
                  {formData.videoUrl ? (
                    <div className="aspect-video w-full bg-black">
                      {formData.videoUrl.match(/\.(webm|mp4|mov)$/i) ? (
                        <video src={formData.videoUrl} controls className="w-full h-full object-contain" poster={formData.imageUrl} />
                      ) : (
                        <iframe 
                          src={formData.videoUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/) 
                            ? `https://www.youtube.com/embed/${formData.videoUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/)?.[1].split('&')[0]}` 
                            : formData.videoUrl.match(/(?:https?:\/\/)?(?:www\.)?drive\.google\.com\/file\/d\/(.+?)\/(?:view|preview)/)
                            ? `https://drive.google.com/file/d/${formData.videoUrl.match(/(?:https?:\/\/)?(?:www\.)?drive\.google\.com\/file\/d\/(.+?)\/(?:view|preview)/)?.[1]}/preview`
                            : formData.videoUrl.replace("watch?v=", "embed/")
                          } 
                          title="Video" 
                          className="w-full h-full" 
                          allowFullScreen
                        ></iframe>
                      )}
                    </div>
                  ) : formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-auto object-cover max-h-[600px]" />
                  ) : (
                    <div className="w-full aspect-video bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                      ছবি বা ভিডিও যুক্ত করা হয়নি
                    </div>
                  )}
                </figure>

                <div 
                  className="prose prose-lg dark:prose-invert max-w-none font-serif text-gray-800 dark:text-gray-200 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formData.content || "<p>বিস্তারিত সংবাদ এখানে প্রদর্শিত হবে...</p>" }}
                />
              </article>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
