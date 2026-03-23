"""
VaaniSetu — Complete Offline Voice Assistant
STT (Sun) + AI (Samjho) + TTS (Bolo)
Jarvis jaisa fully offline, Hindi mein!
"""

import speech_recognition as sr
import json
import os


class VaaniSetu:

    def __init__(self):
        print("=" * 40)
        print("   VaaniSetu Starting...")
        print("=" * 40)

        # Knowledge base
        self.kb = self._load_kb()

        # TTS — pyttsx3 use karo (zero install, works offline)
        self._init_tts()

        # STT
        self.recognizer = sr.Recognizer()
        self.mic = sr.Microphone()

        print("\nVaaniSetu ready!\n")
        self.speak("Namaskar! Main VaaniSetu hoon. Bataiye, kya jaanna chahte hain?")

    def _init_tts(self):
        try:
            import pyttsx3
            self.engine = pyttsx3.init()
            voices = self.engine.getProperty('voices')
            for v in voices:
                if 'hindi' in v.name.lower() or 'hi' in v.id.lower():
                    self.engine.setProperty('voice', v.id)
                    break
            self.engine.setProperty('rate', 145)
            self.engine.setProperty('volume', 1.0)
            self.tts_mode = "pyttsx3"
            print("TTS engine: pyttsx3 (offline)")
        except Exception:
            self.tts_mode = "print"
            print("TTS: pyttsx3 not found — text only mode")

    def _load_kb(self) -> dict:
        for path in ["knowledge_base.json", "output/kb_raw.json"]:
            if os.path.exists(path):
                with open(path, encoding="utf-8") as f:
                    print(f"KB loaded from: {path}")
                    return json.load(f)
        # Built-in fallback
        return {
            "pm_kisan":    {"name": "PM Kisan Samman Nidhi",  "eligibility": "Rs 6000 saal mein, 2 hectare se kam zameen wale kisan eligible hain", "helpline": "155261"},
            "mgnrega":     {"name": "MGNREGA",                "eligibility": "100 din ka guaranteed kaam, har rural ghar ke liye", "helpline": "1800-11-0707"},
            "ration_card": {"name": "Ration Card (NFSA)",     "eligibility": "Tehsil office mein apply karein, Aadhaar aur income proof ke saath", "helpline": "1967"},
            "ayushman":    {"name": "Ayushman Bharat PMJAY",  "eligibility": "5 lakh tak ka free health coverage, SECC families ke liye", "helpline": "14555"},
            "pm_awas":     {"name": "PM Awas Yojana",         "eligibility": "1.20 lakh tak ki madad, pakka ghar banane ke liye", "helpline": "1800-11-6446"},
        }

    def speak(self, text: str):
        print(f"\n[VaaniSetu]: {text}")
        if self.tts_mode == "pyttsx3":
            self.engine.say(text)
            self.engine.runAndWait()

    def listen(self) -> str:
        print("\n[Listening... boliye]")
        with self.mic as source:
            self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
            try:
                audio = self.recognizer.listen(source, timeout=5)
                text = self.recognizer.recognize_google(audio, language="hi-IN")
                print(f"[Aapne kaha]: {text}")
                return text.lower()
            except (sr.WaitTimeoutError, sr.UnknownValueError):
                return ""
            except sr.RequestError:
                self.speak("Network error. Google speech server se sampark nahi hua.")
                return ""

    def find_answer(self, query: str) -> str:
        keywords = {
            "kisan":    "pm_kisan",
            "samman":   "pm_kisan",
            "ration":   "ration_card",
            "rashan":   "ration_card",
            "nfsa":     "ration_card",
            "mgnrega":  "mgnrega",
            "nrega":    "mgnrega",
            "kaam":     "mgnrega",
            "ayushman": "ayushman",
            "hospital": "ayushman",
            "ilaj":     "ayushman",
            "awas":     "pm_awas",
            "ghar":     "pm_awas",
            "makan":    "pm_awas",
        }
        for kw, scheme_id in keywords.items():
            if kw in query:
                s = self.kb.get(scheme_id, {})
                if s:
                    name = s.get("name", scheme_id)
                    elig = s.get("eligibility") or s.get("benefits", "")
                    hlp  = s.get("helpline", "")
                    ans  = f"{name} ke baare mein: {elig}."
                    if hlp:
                        ans += f" Helpline number hai: {hlp}."
                    return ans
        return "Mujhe is baare mein puri jaankari nahi hai. Gram Panchayat ya nearest CSC centre se sampark karein."

    def run(self):
        while True:
            query = self.listen()
            if not query:
                continue
            if any(w in query for w in ["band", "rukho", "bye", "exit", "stop"]):
                self.speak("Dhanyawad! VaaniSetu band ho raha hai.")
                break
            self.speak(self.find_answer(query))


if __name__ == "__main__":
    assistant = VaaniSetu()
    assistant.run()
