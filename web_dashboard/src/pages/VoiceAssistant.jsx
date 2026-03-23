import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, Sparkles, Activity, Volume2 } from "lucide-react";

export default function VoiceAssistant() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [response, setResponse] = useState(null);
  const [liveText, setLiveText] = useState("");
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const speechAnalyzerRef = useRef(null);

  // Web Speech Synthesis for Jarvis-style voice output
  const speak = (text) => {
    window.speechSynthesis.cancel(); // Stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    utterance.rate = 0.92;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Pick best available Hindi voice
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v => v.lang === "hi-IN" || v.lang.startsWith("hi"));
    if (hindiVoice) utterance.voice = hindiVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend   = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Setup live transcript Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      speechAnalyzerRef.current = new SpeechRecognition();
      speechAnalyzerRef.current.continuous = true;
      speechAnalyzerRef.current.interimResults = true;
      speechAnalyzerRef.current.lang = 'hi-IN';

      speechAnalyzerRef.current.onresult = (event) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) final += event.results[i][0].transcript;
          else interim += event.results[i][0].transcript;
        }
        setLiveText(final + interim);
      };
    }

    // Pre-load voices
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }, []);

  const startRecording = async () => {
    try {
      window.speechSynthesis.cancel();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = processAudio;
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setResponse(null);
      setLiveText("");
      if (speechAnalyzerRef.current) {
        try { speechAnalyzerRef.current.start(); } catch(e) {}
      }
    } catch (err) {
      alert("Please allow microphone access to use the voice assistant.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
      setIsProcessing(true);
      if (speechAnalyzerRef.current) {
        try { speechAnalyzerRef.current.stop(); } catch(e) {}
      }
    }
  };

  const processAudio = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append("audio", audioBlob, "query.webm");
    formData.append("dialect", "hindi");

    try {
      const res = await fetch("http://localhost:8000/query/voice", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResponse(data);
      // 🔊 Jarvis-style: speak the answer aloud automatically!
      if (data.answer_text) {
        setTimeout(() => speak(data.answer_text), 400);
      }
    } catch (error) {
      const errMsg = "Connection to AI server failed.";
      setResponse({ answer_text: errMsg });
      speak(errMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center space-y-2 mt-8">
        <div className="inline-flex items-center justify-center p-3 bg-teal-500/10 rounded-full mb-4 ring-1 ring-teal-500/30">
          <Sparkles className="w-6 h-6 text-teal-400" />
        </div>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 tracking-tight drop-shadow-sm">
          VaaniSetu Assistant
        </h1>
        <p className="text-slate-400 max-w-lg mx-auto text-lg leading-relaxed">
          Hindi mein boliye — system sun kar, samjhega, aur <span className="text-teal-400 font-semibold">bolega bhi</span>.
        </p>
      </div>

      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="flex items-center justify-center gap-3 py-2 px-6 bg-blue-500/10 border border-blue-400/30 rounded-full mx-auto w-fit animate-pulse">
          <Volume2 className="w-5 h-5 text-blue-400" />
          <span className="text-blue-300 font-bold uppercase tracking-widest text-sm">VaaniSetu Speaking...</span>
        </div>
      )}

      {/* Core UI Panel */}
      <div className="glass-panel p-10 rounded-3xl border border-slate-700/50 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden transition-all duration-500">
        {isRecording && (
          <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30">
            <div className="w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(20,184,166,0.2)_0%,transparent_70%)] animate-pulse shadow-inner"></div>
          </div>
        )}

        <div className="z-10 flex flex-col items-center justify-center space-y-8 w-full">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing || isSpeaking}
            className={`relative group h-36 w-36 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
              isRecording
                ? "bg-rose-500/20 hover:bg-rose-500/30 border-2 border-rose-500 shadow-[0_0_60px_rgba(244,63,94,0.5)] scale-105"
                : isSpeaking
                ? "bg-blue-500/20 border-2 border-blue-400 shadow-[0_0_40px_rgba(59,130,246,0.4)] scale-105"
                : "bg-teal-500/10 hover:bg-teal-500/20 border-2 border-teal-500 shadow-[0_0_30px_rgba(20,184,166,0.3)] hover:shadow-[0_0_50px_rgba(20,184,166,0.5)] cursor-pointer"
            } ${isProcessing ? 'opacity-50 cursor-not-allowed scale-95' : ''}`}
          >
            {isRecording && (
              <>
                <div className="absolute inset-0 rounded-full border-4 border-rose-400 animate-ping opacity-30"></div>
                <div className="absolute inset-0 rounded-full border-2 border-rose-300 animate-ping opacity-20" style={{ animationDelay: '0.3s' }}></div>
              </>
            )}
            {isSpeaking && (
              <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping opacity-30"></div>
            )}
            {isProcessing ? (
              <Loader2 className="w-14 h-14 text-teal-400 animate-spin" />
            ) : isSpeaking ? (
              <Volume2 className="w-14 h-14 text-blue-400" />
            ) : isRecording ? (
              <Square className="w-12 h-12 text-rose-400 fill-current" />
            ) : (
              <Mic className="w-14 h-14 text-teal-400" />
            )}
          </button>

          <div className="text-center h-16 w-full max-w-2xl px-4">
            {isRecording && (
              <div className="space-y-2">
                <p className="text-rose-400 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 animate-pulse">
                  <Activity className="w-4 h-4" /> Listening Live
                </p>
                <p className="text-2xl text-slate-100 font-bold italic min-h-[30px] drop-shadow-md">
                  {liveText || "Listening..."}
                </p>
              </div>
            )}
            {isProcessing && (
              <p className="text-teal-400 font-bold tracking-widest uppercase text-[15px] animate-pulse flex items-center justify-center gap-2 mt-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Processing with AI Engine...
              </p>
            )}
            {isSpeaking && (
              <p className="text-blue-300 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 mt-2 animate-pulse">
                <Volume2 className="w-4 h-4" /> Speaking — wait karo...
              </p>
            )}
            {!isRecording && !isProcessing && !isSpeaking && !response && (
              <p className="text-slate-500 font-bold tracking-widest text-sm uppercase mt-4">
                Tap mic to speak
              </p>
            )}
          </div>
        </div>
      </div>

      {/* AI Resolution */}
      {response && (
        <div className="glass-panel p-8 rounded-3xl border border-teal-500/30 shadow-[0_0_40px_rgba(20,184,166,0.15)] animate-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center justify-between border-b border-teal-500/20 pb-4 mb-6">
            <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> AI Resolution
            </h3>
            <button
              onClick={() => speak(response.answer_text)}
              disabled={isSpeaking}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-blue-500/10 border border-blue-400/30 text-blue-300 hover:bg-blue-500/20 transition-all disabled:opacity-50"
            >
              <Volume2 className="w-3 h-3" /> {isSpeaking ? "Speaking..." : "Replay"}
            </button>
          </div>

          <div className="space-y-6">
            {response.transcript && (
              <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-700/50 shadow-inner">
                <p className="text-xs text-slate-400 mb-2 font-bold uppercase tracking-widest flex items-center gap-2">
                  <Mic className="w-3 h-3" /> Audio Transcript
                </p>
                <p className="text-emerald-400 font-medium text-lg leading-relaxed font-mono">
                  &gt; {response.transcript || liveText}
                </p>
              </div>
            )}

            <div className="bg-gradient-to-br from-teal-500/20 to-blue-600/20 rounded-2xl p-8 border border-teal-400/30 shadow-[inset_0_0_30px_rgba(20,184,166,0.1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <p className="text-xs text-teal-300 mb-3 font-bold uppercase tracking-widest relative z-10">
                VaaniSetu Answer
              </p>
              <p className="text-3xl text-white font-medium leading-normal tracking-tight drop-shadow-md relative z-10">
                {response.answer_text}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
