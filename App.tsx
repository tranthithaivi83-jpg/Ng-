
import React, { useState, useRef } from 'react';
import { analyzeSafetyImage } from './services/geminiService';
import { AnalysisResult, SafetyIssue } from './types';
import { SafetyIssueList } from './components/SafetyIssueList';
import { ImageVisualizer } from './components/ImageVisualizer';

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setImage(base64);
        setResult(null);
        setSelectedIndex(null);
        setError(null);
        
        // Auto start analysis
        await startAnalysis(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async (base64: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const analysis = await analyzeSafetyImage(base64);
      setResult(analysis);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi phân tích.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setSelectedIndex(null);
    setError(null);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-slate-900 text-white py-6 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400 p-2 rounded-lg text-slate-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">HSE AI Inspector</h1>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Construction Site Safety</p>
            </div>
          </div>
          
          {image && (
            <button 
              onClick={reset}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-semibold transition-colors border border-slate-700"
            >
              Phân tích ảnh mới
            </button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 mt-8">
        {!image ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-12 text-center hover:border-blue-400 transition-colors group">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-50 transition-colors">
                <svg className="w-10 h-10 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Tải lên ảnh hiện trường</h2>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                AI sẽ phân tích các vi phạm an toàn như mũ bảo hiểm, dây an toàn, giàn giáo và hơn thế nữa.
              </p>
              
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2 mx-auto"
              >
                <span>Chọn Hình Ảnh</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Visualizer Column */}
            <div className="lg:col-span-8 space-y-6">
              <div className="relative">
                <ImageVisualizer 
                  imageUrl={image} 
                  issues={result?.issues || []}
                  selectedIndex={selectedIndex}
                  onSelect={setSelectedIndex}
                />
                
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-10">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-white font-bold text-lg animate-pulse">Kỹ sư AI đang kiểm tra...</p>
                    <p className="text-slate-200 text-sm">Quá trình này có thể mất vài giây</p>
                  </div>
                )}
              </div>

              {result && (
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
                  <h3 className="text-blue-900 font-bold mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Báo cáo tóm tắt
                  </h3>
                  <p className="text-blue-800 leading-relaxed italic">
                    "{result.summary}"
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3 text-red-700">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-bold">Lỗi Phân Tích</p>
                    <p className="text-sm">{error}</p>
                    <button 
                      onClick={() => startAnalysis(image)}
                      className="mt-2 text-sm font-bold underline underline-offset-4"
                    >
                      Thử lại
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-4 h-full">
              <div className="sticky top-24 space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-lg font-bold text-slate-800">
                    Danh sách vi phạm {result && `(${result.issues.length})`}
                  </h2>
                  {result && result.issues.length > 0 && (
                      <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full font-bold">
                        HSE ALERT
                      </span>
                  )}
                </div>
                
                <div className="overflow-y-auto max-h-[calc(100vh-250px)] pr-2 custom-scrollbar">
                  {isAnalyzing ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="bg-slate-100 h-32 rounded-xl animate-pulse"></div>
                      ))}
                    </div>
                  ) : (
                    <SafetyIssueList 
                      issues={result?.issues || []} 
                      selectedIndex={selectedIndex}
                      onSelect={setSelectedIndex}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Persistent CTA on Mobile */}
      {!isAnalyzing && image && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden z-50">
            <button 
                onClick={reset}
                className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Kiểm tra ảnh mới
            </button>
          </div>
      )}
    </div>
  );
};

export default App;
