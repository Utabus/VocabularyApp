
import React, { useState, useEffect } from 'react';
import { XIcon } from './icons';

interface ApiKeyModalProps {
    onSuccess: () => void;
    onClose?: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSuccess, onClose }) => {
    const [error, setError] = useState<string | null>(null);
    const [inputKey, setInputKey] = useState<string>('');
    const [showGuide, setShowGuide] = useState<boolean>(false);
    const isAIStudioEnvironment = typeof window !== 'undefined' && (window as any).aistudio;
    const [useManualInput, setUseManualInput] = useState(!isAIStudioEnvironment);

    useEffect(() => {
        // Pre-fill input with existing key if available in localStorage
        const savedKey = localStorage.getItem('gemini_api_key');
        if (savedKey) {
            setInputKey(savedKey);
        }
    }, []);

    const handleConnect = async () => {
        try {
            if (isAIStudioEnvironment) {
                await (window as any).aistudio.openSelectKey();
                onSuccess();
            } else {
                setError("Không tìm thấy module AI Studio.");
            }
        } catch (e: any) {
             if (e.message && e.message.includes("Requested entity was not found")) {
                setError("Key không hợp lệ hoặc dự án chưa được chọn. Vui lòng thử lại.");
             } else {
                 setError("Đã xảy ra lỗi khi kết nối. Vui lòng thử lại.");
                 console.error(e);
             }
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputKey.trim().length < 10) {
            setError("API Key có vẻ không hợp lệ (quá ngắn).");
            return;
        }
        localStorage.setItem('gemini_api_key', inputKey.trim());
        onSuccess();
    };

    const renderGuide = () => (
        <div className="text-left animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm">?</span>
                Cách lấy Gemini API Key
            </h2>
            
            <div className="space-y-4 text-sm text-gray-300 mb-6">
                <div className="flex gap-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">1</div>
                    <p>Truy cập <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline font-semibold">Google AI Studio</a> và đăng nhập.</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">2</div>
                    <p>Nhấn vào nút <strong>"Create API key"</strong>.</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">3</div>
                    <p>Chọn <strong>"Create API key in new project"</strong>.</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">4</div>
                    <p>Copy mã Key và dán vào ô nhập.</p>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition text-center"
                >
                    Đến trang lấy Key ngay ↗
                </a>
                <button 
                    onClick={() => setShowGuide(false)}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-2.5 px-4 rounded-lg transition"
                >
                    Quay lại
                </button>
            </div>
        </div>
    );

    const renderManualForm = () => (
        <div className="text-left w-full animate-in fade-in duration-300">
            <p className="text-gray-400 mb-4 text-sm text-center">
                Nhập Gemini API Key của bạn để bắt đầu:
            </p>
            <form onSubmit={handleManualSubmit} className="space-y-3">
                <input 
                    type="password" 
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="Dán mã Key bắt đầu bằng AIza... vào đây"
                    className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none placeholder-gray-600"
                />
                <button 
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                >
                    Lưu API Key
                </button>
            </form>
            
            <div className="mt-4 flex flex-col gap-2 items-center">
                <button 
                    type="button"
                    onClick={() => setShowGuide(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline flex items-center justify-center gap-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Hướng dẫn lấy API Key miễn phí
                </button>
                
                {isAIStudioEnvironment && (
                     <button 
                        type="button"
                        onClick={() => setUseManualInput(false)}
                        className="text-xs text-gray-500 hover:text-gray-300 mt-2"
                    >
                        Quay lại đăng nhập Google
                    </button>
                )}
            </div>
        </div>
    );

    const renderGoogleLogin = () => (
        <>
            <p className="text-gray-400 mb-8 text-sm md:text-base">
                Đăng nhập để mở khóa sức mạnh AI cho việc học từ vựng của bạn.
            </p>
            <button
                onClick={handleConnect}
                className="w-full bg-white text-gray-900 hover:bg-gray-100 font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-3 group"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Tiếp tục với Google</span>
            </button>
            
            <div className="mt-6">
                <button 
                    onClick={() => setUseManualInput(true)}
                    className="text-xs text-gray-500 hover:text-indigo-400 underline"
                >
                    Hoặc nhập API Key thủ công
                </button>
            </div>
        </>
    );

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/90 backdrop-blur-sm text-white p-4">
            <div className="absolute inset-0 overflow-hidden -z-10">
                <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-indigo-900/20 rounded-full blur-[120px]"></div>
                <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center transition-all duration-300">
                {onClose && (
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
                    >
                        <XIcon />
                    </button>
                )}

                <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 16l-.672.672a4 4 0 01-5.656 0L4 15.464 15 4.464 15.464 4l.672.672a4 4 0 005.656 0L22 4.464 19 7.464 19 9z" />
                        </svg>
                    </div>
                </div>

                <h1 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                    Cấu hình API Key
                </h1>

                {showGuide ? renderGuide() : (useManualInput ? renderManualForm() : renderGoogleLogin())}

                {error && (
                    <div className="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-in fade-in slide-in-from-top-2">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApiKeyModal;
