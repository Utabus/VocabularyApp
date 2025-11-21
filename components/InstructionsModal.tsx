
import React, { useState } from 'react';
import { XIcon } from './icons';

interface InstructionsModalProps {
    onClose: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'usage' | 'apikey'>('usage');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-gray-800 text-gray-200 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-700 animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-700 bg-gray-900/50">
                    <h2 className="text-2xl font-bold text-indigo-400">Hướng dẫn & Trợ giúp</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition p-1">
                        <XIcon />
                    </button>
                </div>

                {/* Tabs Navigation */}
                <div className="flex border-b border-gray-700 bg-gray-900/30">
                    <button
                        onClick={() => setActiveTab('usage')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${
                            activeTab === 'usage' 
                                ? 'text-indigo-400 border-b-2 border-indigo-500 bg-gray-800' 
                                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                        }`}
                    >
                        📖 Cách sử dụng App
                    </button>
                    <button
                        onClick={() => setActiveTab('apikey')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${
                            activeTab === 'apikey' 
                                ? 'text-indigo-400 border-b-2 border-indigo-500 bg-gray-800' 
                                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                        }`}
                    >
                        🔑 Cách lấy API Key
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto p-6 space-y-8 text-sm md:text-base leading-relaxed custom-scrollbar flex-grow">
                    
                    {activeTab === 'usage' ? (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-8">
                            {/* Section 1 */}
                            <section>
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="bg-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                    Bắt đầu học tập
                                </h3>
                                <div className="pl-8 text-gray-300 space-y-2">
                                    <p>Đầu tiên, bạn cần tạo danh sách từ vựng ở bảng điều khiển phía trên:</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li><strong>Chọn chủ đề:</strong> Hơn 15 chủ đề đa dạng (Công nghệ, Du lịch, IELTS...).</li>
                                        <li><strong>Chọn trình độ:</strong> Từ A1 (Cơ bản) đến C2 (Thành thạo).</li>
                                        <li><strong>Số lượng từ:</strong> Chọn 10, 20 hoặc 30 từ mỗi lần tạo.</li>
                                    </ul>
                                    <p className="italic text-gray-400 mt-1">👉 Bấm nút <strong>"Tạo danh sách"</strong> và đợi vài giây để AI làm việc.</p>
                                </div>
                            </section>

                            {/* Section 2 */}
                            <section>
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="bg-teal-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                    Các chế độ học
                                </h3>
                                <div className="pl-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
                                        <strong className="text-indigo-300 block mb-1">📝 Danh sách từ</strong>
                                        Xem chi tiết từ, nghĩa, ví dụ và nghe phát âm chuẩn.
                                    </div>
                                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
                                        <strong className="text-indigo-300 block mb-1">🃏 Flashcard</strong>
                                        Lật thẻ để ôn tập, mặt trước là từ, mặt sau là nghĩa và ví dụ.
                                    </div>
                                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
                                        <strong className="text-indigo-300 block mb-1">🧠 Quiz & Games</strong>
                                        Kiểm tra kiến thức qua trắc nghiệm, điền từ và nối từ.
                                    </div>
                                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
                                        <strong className="text-indigo-300 block mb-1">🎤 Luyện phát âm</strong>
                                        Nhìn nghĩa tiếng Việt và gõ lại từ tiếng Anh chính xác.
                                    </div>
                                </div>
                            </section>

                            {/* Section 3 */}
                            <section>
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="bg-purple-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                                    Tính năng nâng cao (AI Powered)
                                </h3>
                                <div className="pl-8 space-y-3 text-gray-300">
                                     <p>
                                        <strong>🎧 Podcast AI:</strong> Tạo một bài Podcast tiếng Anh dựa trên các từ vựng bạn vừa học. Bạn có thể nghe và đọc transcript song song.
                                    </p>
                                     <p>
                                        <strong>🗣️ Luyện nói & IELTS:</strong> 
                                        <ul className="list-disc pl-5 mt-1 text-gray-400">
                                            <li>Thực hành trả lời câu hỏi Speaking Part 1 & 2.</li>
                                            <li>Nhập câu trả lời của bạn và nhận <strong>Feedback chi tiết từ AI</strong> (sửa lỗi ngữ pháp, gợi ý từ vựng hay hơn).</li>
                                        </ul>
                                    </p>
                                </div>
                            </section>

                            {/* Section 4 */}
                            <section>
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="bg-orange-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                                    Quản lý dữ liệu
                                </h3>
                                <div className="pl-8 text-gray-300">
                                    <p>Ứng dụng tự động lưu các bộ từ vựng bạn đã tạo vào trình duyệt.</p>
                                    <p className="mt-1">Bạn có thể chọn lại các bộ từ cũ ở mục <strong>"Ôn lại bộ từ đã tạo"</strong> hoặc xoá chúng nếu không cần thiết.</p>
                                </div>
                            </section>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="p-4 bg-indigo-900/30 border border-indigo-500/30 rounded-lg">
                                <p className="text-indigo-200 font-medium">
                                    Gemini API Key là chìa khóa miễn phí từ Google cho phép ứng dụng này tạo ra nội dung thông minh.
                                </p>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-4">Các bước lấy Key miễn phí (1 phút):</h3>
                            
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white">1</div>
                                    <div>
                                        <p className="font-semibold text-white">Truy cập Google AI Studio</p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Đi tới <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">aistudio.google.com/app/apikey</a> và đăng nhập bằng tài khoản Google của bạn.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white">2</div>
                                    <div>
                                        <p className="font-semibold text-white">Tạo Key mới</p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Nhấn vào nút to <strong>"Create API key"</strong> ở góc trên bên trái.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white">3</div>
                                    <div>
                                        <p className="font-semibold text-white">Chọn dự án</p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Trong hộp thoại hiện ra, chọn <strong>"Create API key in new project"</strong> (Tạo Key trong dự án mới).
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white">4</div>
                                    <div>
                                        <p className="font-semibold text-white">Sao chép và Sử dụng</p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Sau khi tạo xong, copy đoạn mã bắt đầu bằng <code>AIza...</code>
                                        </p>
                                        <p className="text-gray-400 text-sm mt-2">
                                            Quay lại ứng dụng này, nhấn vào nút <strong>API Key</strong> ở góc trên bên phải màn hình và dán mã vào.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 text-center">
                                <a 
                                    href="https://aistudio.google.com/app/apikey" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                                >
                                    Lấy API Key ngay ↗
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-700 bg-gray-900/50 text-center">
                    <button 
                        onClick={onClose}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-8 rounded-lg transition"
                    >
                        Đóng hướng dẫn
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstructionsModal;
