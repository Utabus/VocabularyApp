
function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

function pcmToWav(pcmData: Int16Array, sampleRate: number): Blob {
    const numChannels = 1;
    const bitsPerSample = 16;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const byteRate = sampleRate * blockAlign;
    const dataSize = pcmData.length * (bitsPerSample / 8);
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    
    // fmt sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    
    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    let offset = 44;
    for (let i = 0; i < pcmData.length; i++) {
        view.setInt16(offset, pcmData[i], true);
        offset += 2;
    }

    return new Blob([view], { type: 'audio/wav' });
}

export const playAiSpeech = (audioData: string, mimeType: string): Promise<HTMLAudioElement> => {
    return new Promise((resolve, reject) => {
        try {
            const sampleRateMatch = mimeType.match(/rate=(\d+)/);
            if (!sampleRateMatch) {
                throw new Error("Sample rate not found in mimeType");
            }
            const sampleRate = parseInt(sampleRateMatch[1], 10);
            const pcmData = base64ToArrayBuffer(audioData);
            const pcm16 = new Int16Array(pcmData);
            const wavBlob = pcmToWav(pcm16, sampleRate);
            const audioUrl = URL.createObjectURL(wavBlob);
            
            const audio = new Audio(audioUrl);
            audio.play();
            resolve(audio);
        } catch (error) {
            console.error("Error processing and playing AI speech:", error);
            reject(error);
        }
    });
};

// Browser TTS Logic
const getBestVoice = (lang: 'en-US' | 'zh-CN') => {
    const voices = speechSynthesis.getVoices();
    if (!voices.length) return null;
    
    let bestVoice: SpeechSynthesisVoice | undefined;
    
    // Find voice matching exact language code
    bestVoice = voices.find(v => v.lang === lang && v.name.includes('Google'));
    if (!bestVoice) bestVoice = voices.find(v => v.lang === lang);
    if (!bestVoice) bestVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0])); // Fallback to 'en' or 'zh'
    
    return bestVoice || null;
};

// Ensure voices are loaded
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {}; // Just trigger voice load
}

export const speakBrowser = (text: string, language: 'English' | 'Chinese' = 'English') => {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }

    const langCode = language === 'Chinese' ? 'zh-CN' : 'en-US';
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = language === 'Chinese' ? 0.8 : 0.9; // Chinese can be fast, slow down slightly

    const selectedVoice = getBestVoice(langCode);
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    speechSynthesis.speak(utterance);
};
