
import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole } from '../types';
import { generateCampaignPoster, editImpactPhoto, analyzeFieldPhoto, searchCharityTrends } from '../geminiService';

const AITools: React.FC<{ user: User | null }> = ({ user }) => {
  const [activeTool, setActiveTool] = useState<'generate' | 'edit' | 'analyze' | 'search'>('generate');
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<"1K" | "2K" | "4K">("1K");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [searchResponse, setSearchResponse] = useState<{ text?: string; sources?: any[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // [Fix: Mandatory API key check for gemini-3-pro-image-preview]
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkApiKey = async () => {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
    };
    checkApiKey();
  }, [activeTool]);

  const handleOpenKeySelection = async () => {
    await window.aistudio.openSelectKey();
    setHasKey(true); // Assume success per race condition guidelines
  };

  if (user?.role !== UserRole.ADMIN) {
    return (
      <div className="p-20 text-center">
        <h2 className="text-2xl font-bold">Access Restricted</h2>
        <p className="text-slate-500">Only NGO Admins can access the AI Studio.</p>
      </div>
    );
  }

  const handleGenerate = async () => {
    // [Fix: Ensure user has selected a key before generating high-res images]
    const keySelected = await window.aistudio.hasSelectedApiKey();
    if (!keySelected) {
      await handleOpenKeySelection();
    }
    
    setLoading(true);
    setResult(null);
    try {
      const img = await generateCampaignPoster(prompt, size);
      setResult(img);
    } catch (e: any) {
      if (e?.message?.includes("Requested entity was not found.")) {
        await handleOpenKeySelection();
      } else {
        alert("Generation failed. Check API key settings.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const toBase64 = (f: File): Promise<string> => 
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });

  const handleEditOrAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const base64 = await toBase64(file);
      if (activeTool === 'edit') {
        const img = await editImpactPhoto(base64, prompt || "make this look more professional for a social media post");
        setResult(img);
      } else {
        const report = await analyzeFieldPhoto(base64);
        setResult(report);
      }
    } catch (e) {
      alert("Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setSearchResponse(null);
    try {
      const res = await searchCharityTrends(prompt);
      setSearchResponse(res);
    } catch (e) {
      alert("Search failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">NGO AI Studio</h1>
        <p className="text-slate-500">Harness Gemini 3.0 to boost your impact and storytelling.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="space-y-2">
          <button 
            onClick={() => { setActiveTool('generate'); setResult(null); }}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all ${activeTool === 'generate' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            <div className="font-bold">Poster Generator</div>
            <div className="text-xs opacity-70">Gemini 3 Pro Image</div>
          </button>
          <button 
            onClick={() => { setActiveTool('edit'); setResult(null); }}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all ${activeTool === 'edit' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            <div className="font-bold">Photo Editor</div>
            <div className="text-xs opacity-70">Gemini 2.5 Flash Image</div>
          </button>
          <button 
            onClick={() => { setActiveTool('analyze'); setResult(null); }}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all ${activeTool === 'analyze' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            <div className="font-bold">Field Analysis</div>
            <div className="text-xs opacity-70">Gemini 3 Pro Preview</div>
          </button>
          <button 
            onClick={() => { setActiveTool('search'); setResult(null); }}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all ${activeTool === 'search' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            <div className="font-bold">Trend Research</div>
            <div className="text-xs opacity-70">Gemini 3 Flash Search</div>
          </button>
        </div>

        {/* Workspace */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
          {/* [Fix: API Key Selection Requirement UI for Gemini 3 Pro Image] */}
          {activeTool === 'generate' && hasKey === false && (
            <div className="mb-8 p-6 bg-indigo-50 border border-indigo-200 rounded-2xl">
              <h3 className="text-indigo-900 font-bold mb-2">High-Quality Assets Required</h3>
              <p className="text-indigo-800 text-sm mb-4">Gemini 3 Pro Image generation requires a selected API key from a paid project. Please authorize to continue.</p>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleOpenKeySelection}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                >
                  Authorize API Key
                </button>
                <a 
                  href="https://ai.google.dev/gemini-api/docs/billing" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-indigo-600 text-sm font-bold hover:underline"
                >
                  Billing Support Docs
                </a>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {(activeTool === 'edit' || activeTool === 'analyze') && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Upload Field Photo</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-indigo-600 transition-colors cursor-pointer group"
                >
                  <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                  {file ? (
                    <div className="text-indigo-600 font-medium">Selected: {file.name}</div>
                  ) : (
                    <>
                      <svg className="w-10 h-10 mx-auto text-slate-300 group-hover:text-indigo-600 transition-colors mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      <p className="text-slate-500">Drop image here or click to browse</p>
                    </>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                {activeTool === 'generate' ? "Poster Concept" : 
                 activeTool === 'edit' ? "Edit Instructions" : 
                 activeTool === 'search' ? "Research Topic" : "Additional Context (Optional)"}
              </label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none min-h-[100px]"
                placeholder={
                  activeTool === 'generate' ? "e.g., A minimalist poster for a clean water campaign in Africa, emotional and inspiring..." :
                  activeTool === 'search' ? "e.g., What are the current emerging donor trends for climate change NGOs in 2024?" :
                  "e.g., Add more greenery and sunlight to this photo..."
                }
              />
            </div>

            {activeTool === 'generate' && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Image Resolution</label>
                <div className="flex gap-4">
                  {(['1K', '2K', '4K'] as const).map(s => (
                    <button 
                      key={s} 
                      onClick={() => setSize(s)}
                      className={`px-6 py-2 rounded-lg border font-bold transition-all ${size === s ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button 
              disabled={loading || (activeTool !== 'generate' && activeTool !== 'search' && !file)}
              onClick={activeTool === 'generate' ? handleGenerate : activeTool === 'search' ? handleSearch : handleEditOrAnalyze}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing with Gemini...
                </>
              ) : (
                'Generate Result'
              )}
            </button>
          </div>

          {/* Results Area */}
          {(result || searchResponse) && (
            <div className="mt-10 pt-10 border-t border-slate-100 animate-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Generated Content</h3>
              
              {activeTool === 'search' && searchResponse ? (
                <div className="prose prose-slate max-w-none">
                   <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                     <p className="whitespace-pre-wrap">{searchResponse.text}</p>
                     {searchResponse.sources && searchResponse.sources.length > 0 && (
                       <div className="mt-6 pt-6 border-t border-slate-200">
                         <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Sources</h4>
                         <ul className="space-y-1">
                           {searchResponse.sources.map((s: any, idx) => (
                             <li key={idx}><a href={s.uri} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-sm">{s.title || s.uri}</a></li>
                           ))}
                         </ul>
                       </div>
                     )}
                   </div>
                </div>
              ) : result?.startsWith('data:image') ? (
                <div className="relative group">
                  <img src={result} alt="AI Result" className="w-full rounded-2xl shadow-xl" />
                  <a href={result} download="ai-impact-photo.png" className="absolute top-4 right-4 bg-white/90 backdrop-blur p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-6 h-6 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  </a>
                </div>
              ) : (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <h4 className="font-bold mb-2">Analysis Report:</h4>
                  <p className="text-slate-600 whitespace-pre-wrap">{result}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AITools;
