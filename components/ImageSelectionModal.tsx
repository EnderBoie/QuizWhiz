
import React, { useState } from 'react';
import { X, Upload, Link, Image as ImageIcon, Search, Sparkles, Loader2, Monitor, Smartphone, Square, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { compressImage } from '../services/imageUtils';

interface ImageSelectionModalProps {
  onSelect: (imageUrl: string) => void;
  onClose: () => void;
  onAiUsed: () => void;
}

type Tab = 'upload' | 'url' | 'search' | 'generate';
type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export const ImageSelectionModal: React.FC<ImageSelectionModalProps> = ({ onSelect, onClose, onAiUsed }) => {
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const [urlInput, setUrlInput] = useState('');
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // AI Generation State
  const [genPrompt, setGenPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onSelect(urlInput);
      onClose();
    }
  };

  const handleWebSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // We ask Gemini to search and extract image URLs
        const prompt = `Find 9 public, direct, high-quality image URLs for the search query: "${searchQuery}". 
        Return ONLY a raw JSON array of strings, e.g., ["url1", "url2"]. 
        Ensure URLs are direct links to images (jpg, png, webp) and not HTML pages.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: 'application/json'
            }
        });

        const text = response.text;
        if (text) {
            const urls = JSON.parse(text);
            if (Array.isArray(urls)) {
                setSearchResults(urls);
            } else {
                setSearchError("No images found in the response.");
            }
        } else {
            setSearchError("Failed to find images.");
        }
    } catch (err) {
        console.error("Search failed", err);
        setSearchError("Failed to perform web search. Please try again.");
    } finally {
        setIsSearching(false);
    }
  };

  const handleSelectSearchResult = async (url: string) => {
      // We try to compress/proxy it through canvas to ensure it's valid and CORS-safe if possible,
      // or just pass the URL if it's a direct link.
      try {
          // Attempt to fetch/compress to avoid hotlinking issues later if possible
          const compressed = await compressImage(url);
          onSelect(compressed);
      } catch (e) {
          // If CORS fails, just use the URL directly
          onSelect(url);
      }
      onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const rawBase64 = reader.result as string;
        try {
            const compressed = await compressImage(rawBase64);
            onSelect(compressed);
        } catch (e) {
            console.error("Compression failed", e);
            onSelect(rawBase64);
        }
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!genPrompt.trim()) return;
    setIsGenerating(true);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: genPrompt,
            config: {
                imageConfig: {
                    aspectRatio: aspectRatio
                }
            }
        });

        const parts = response.candidates?.[0]?.content?.parts;
        if (parts) {
            for (const part of parts) {
                if (part.inlineData) {
                    const base64Str = part.inlineData.data;
                    const imageUrl = `data:image/png;base64,${base64Str}`;
                    
                    // Compress generated image
                    const compressed = await compressImage(imageUrl);
                    
                    onSelect(compressed);
                    onAiUsed(); // Trigger stat
                    onClose();
                    return;
                }
            }
        }
        alert("No image generated. Please try a different prompt.");
    } catch (error) {
        console.error("Generation failed", error);
        alert("Failed to generate image. Please try again.");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 h-[80vh] sm:h-auto sm:max-h-[85vh]">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 flex justify-between items-center text-white flex-shrink-0">
          <div className="flex items-center gap-2 font-bold text-lg">
            <ImageIcon size={20} />
            Select Image
          </div>
          <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 rounded p-1">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b overflow-x-auto flex-shrink-0">
          {[
            { id: 'upload', icon: Upload, label: 'Upload' },
            { id: 'url', icon: Link, label: 'URL' },
            { id: 'search', icon: Search, label: 'Web Search' },
            { id: 'generate', icon: Sparkles, label: 'AI Gen' }
          ].map(tab => (
             <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex-1 py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {activeTab === 'upload' && (
            <div className="h-full flex flex-col justify-center">
                <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-xl hover:border-violet-400 hover:bg-violet-50 transition-colors cursor-pointer relative group">
                <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.gif"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="transform group-hover:scale-110 transition-transform duration-300">
                    <Upload className="mx-auto text-violet-300 mb-3" size={48} />
                </div>
                <p className="font-bold text-gray-700 text-lg">Click to Upload</p>
                <p className="text-sm text-gray-400 mt-1">JPG, PNG, GIF, WEBP</p>
                </div>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700">Image URL</label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-violet-500"
              />
              <button
                onClick={handleUrlSubmit}
                disabled={!urlInput.trim()}
                className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold disabled:opacity-50 transition-all shadow-lg hover:shadow-violet-200"
              >
                Use URL
              </button>
            </div>
          )}

          {activeTab === 'search' && (
            <div className="h-full flex flex-col">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleWebSearch()}
                  placeholder="e.g. Cute Puppy, Solar System"
                  className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-500"
                />
                <button
                  onClick={handleWebSearch}
                  disabled={!searchQuery.trim() || isSearching}
                  className="bg-violet-600 hover:bg-violet-700 text-white px-6 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isSearching ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>

              {searchError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 flex items-center gap-2">
                      <AlertCircle size={16} />
                      {searchError}
                  </div>
              )}

              <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[200px]">
                  {searchResults.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {searchResults.map((url, idx) => (
                              <button
                                  key={idx}
                                  onClick={() => handleSelectSearchResult(url)}
                                  className="aspect-square relative group overflow-hidden rounded-xl bg-slate-100 border border-slate-200 hover:border-violet-500 transition-all"
                              >
                                  <img 
                                    src={url} 
                                    alt={`Result ${idx}`} 
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                    onError={(e) => e.currentTarget.parentElement!.style.display = 'none'}
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                      <div className="bg-white/90 text-violet-700 p-2 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-sm">
                                          <ImageIcon size={16} />
                                      </div>
                                  </div>
                              </button>
                          ))}
                      </div>
                  ) : (
                      !isSearching && (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                              <Search size={48} className="opacity-20" />
                              <p>Enter a topic to search the web for images.</p>
                          </div>
                      )
                  )}
                   {isSearching && (
                      <div className="h-full flex items-center justify-center text-violet-600">
                          <Loader2 size={32} className="animate-spin" />
                      </div>
                  )}
              </div>
            </div>
          )}

          {activeTab === 'generate' && (
             <div className="space-y-4">
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-2">
                    <p className="text-amber-800 text-sm font-medium flex gap-2">
                        <Sparkles size={16} className="mt-0.5" />
                        AI will create a unique image for you!
                    </p>
                </div>
                
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Aspect Ratio</label>
                    <div className="grid grid-cols-5 gap-2">
                        {[
                            { id: '1:1', icon: Square, label: 'Square' },
                            { id: '4:3', icon: Monitor, label: 'Landscape' },
                            { id: '16:9', icon: Monitor, label: 'Wide' },
                            { id: '3:4', icon: Smartphone, label: 'Portrait' },
                            { id: '9:16', icon: Smartphone, label: 'Tall' },
                        ].map((ratio) => (
                            <button
                                key={ratio.id}
                                onClick={() => setAspectRatio(ratio.id as AspectRatio)}
                                className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${
                                    aspectRatio === ratio.id 
                                    ? 'border-violet-600 bg-violet-50 text-violet-700' 
                                    : 'border-gray-200 hover:border-violet-300 text-gray-500'
                                }`}
                                title={ratio.label}
                            >
                                <ratio.icon size={20} className={ratio.id.includes('9') ? 'scale-x-125' : ''} />
                                <span className="text-[10px] font-bold mt-1">{ratio.id}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Image Prompt</label>
                    <textarea
                        value={genPrompt}
                        onChange={(e) => setGenPrompt(e.target.value)}
                        placeholder="e.g. A futuristic city with flying cars, neon lights, digital art style"
                        className="w-full px-4 py-3 bg-white text-slate-900 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 min-h-[80px] resize-none placeholder-gray-400"
                    />
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !genPrompt.trim()}
                    className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-xl font-bold disabled:opacity-70 flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-violet-200"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles size={20} />
                            Generate Image
                        </>
                    )}
                </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
