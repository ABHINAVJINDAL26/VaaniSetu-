import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, Sparkles, Activity } from "lucide-react";

export default function VoiceAssistant() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState(null);
  const [liveText, setLiveText] = useState("");
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const speechAnalyzerRef = useRef(null);

  // Setup Web Speech API for real-time frontend visualization
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      speechAnalyzerRef.current = new SpeechRecognition();
      speechAnalyzerRef.current.continuous = true;
      speechAnalyzerRef.current.interimResults = true;
      speechAnalyzerRef.current.lang = 'hi-IN'; // Force Hindi recognition

      speechAnalyzerRef.current.onresult = (event) => {
        let currentInterim = "";
        let finalTrans = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }
        setLiveText(finalTrans + currentInterim);
      };
    }
  }, []);

  const startRecording = async () => {
    try {
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
      
      // Start real-time live transcript typing
      if (speechAnalyzerRef.current) {
        try { speechAnalyzerRef.current.start(); } catch(e) {}
      }
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Please allow microphone access to use the voice assistant.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setIsProcessing(true);
      
      // Stop real-time UI typing
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
      // Send genuine audio blob to FastAPI for Python SpeechRecognition
      const res = await fetch("http://localhost:8000/query/voice", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error("Backend error:", error);
      setResponse({ answer_text: "Connection to AI server failed. Ensure FastAPI is running on port 8000." });
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
          Web Voice Assistant
        </h1>
        <p className="text-slate-400 max-w-lg mx-auto text-lg leading-relaxed">
          Ask questions in Hindi or your local dialect. The audio is sent directly to the FastAPI Voice Processing endpoint.
        </p>
      </div>

      {/* Voice Interaction Core UI */}
      <div className="glass-panel p-10 rounded-3xl border border-slate-700/50 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden transition-all duration-500">
        
        {/* Dynamic Waveform Background during recording */}
        {isRecording && (
          <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30">
             <div className="w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(20,184,166,0.2)_0%,transparent_70%)] animate-pulse shadow-inner"></div>
          </div>
        )}
        
        <div className="z-10 flex flex-col items-center justify-center space-y-8 w-full">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`relative group h-36 w-36 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
              isRecording 
                ? "bg-rose-500/20 hover:bg-rose-500/30 border-2 border-rose-500 shadow-[0_0_60px_rgba(244,63,94,0.5)] scale-105" 
                : "bg-teal-500/10 hover:bg-teal-500/20 border-2 border-teal-500 shadow-[0_0_30px_rgba(20,184,166,0.3)] hover:shadow-[0_0_50px_rgba(20,184,166,0.5)] cursor-pointer"
            } ${isProcessing ? 'opacity-50 cursor-not-allowed scale-95' : ''}`}
          >
            {/* Multi-layered Ping Ripple Animations */}
            {isRecording && (
              <>
                <div className="absolute inset-0 rounded-full border-4 border-rose-400 animate-ping opacity-30"></div>
                <div className="absolute inset-0 rounded-full border-2 border-rose-300 animate-ping opacity-20" style={{ animationDelay: '0.3s' }}></div>
              </>
            )}
            
            {isProcessing ? (
              <Loader2 className="w-14 h-14 text-teal-400 animate-spin" />
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
                <Loader2 className="w-5 h-5 animate-spin" /> Transmitting Audio to Python AI Engine... 🧠
              </p>
            )}
            {!isRecording && !isProcessing && !response && (
              <p className="text-slate-500 font-bold tracking-widest text-sm uppercase mt-4 text-center">
                Tap mic to speak
              </p>
            )}
          </div>
        </div>
      </div>

      {/* AI Resolution Presentation */}
      {response && (
        <div className="glass-panel p-8 rounded-3xl border border-teal-500/30 shadow-[0_0_40px_rgba(20,184,166,0.15)] animate-in slide-in-from-bottom-8 duration-700">
          <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-teal-500/20 pb-4">
            <Sparkles className="w-5 h-5" /> AI Resolution Engine
          </h3>
          
          <div className="space-y-6">
            <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-700/50 shadow-inner">
              <p className="text-xs text-slate-400 mb-2 font-bold uppercase tracking-widest flex items-center gap-2">
                <Mic className="w-3 h-3" /> Audio Transcript Log
              </p>
              <p className="text-emerald-400 font-medium text-lg leading-relaxed font-mono">
                {">"} {response.transcript || liveText}
              </p>
            </div>
            
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
