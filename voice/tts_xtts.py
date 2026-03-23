from TTS.api import TTS
import os
import subprocess

class JarvisVoice:
    """
    XTTS-v2 — Jarvis level Hindi TTS
    Voice clone support ke saath (sirf 6 second ki recording chahiye!)
    """

    def __init__(self, clone_voice_file: str = None):
        print("Loading XTTS-v2 model (first time slow — ~1.8 GB download)...")
        self.tts = TTS(
            "tts_models/multilingual/multi-dataset/xtts_v2",
            gpu=False
        )
        self.clone_file = clone_voice_file
        self.lang = "hi"
        print("Jarvis voice ready!")

    def speak(self, text: str):
        print(f"\n[VaaniSetu Says]: {text}")
        out_file = "jarvis_response.wav"

        if self.clone_file and os.path.exists(self.clone_file):
            self.tts.tts_to_file(
                text=text,
                file_path=out_file,
                speaker_wav=self.clone_file,
                language=self.lang
            )
        else:
            self.tts.tts_to_file(text=text, file_path=out_file, language=self.lang)

        self._play(out_file)

    def _play(self, file: str):
        if os.name == 'nt':
            os.system(f"start {file}")
        else:
            subprocess.run(["aplay", file], capture_output=True)

    def set_voice(self, wav_file: str):
        """Apni awaaz se clone karo — sirf 6 second ki recording!"""
        if os.path.exists(wav_file):
            self.clone_file = wav_file
            print(f"Voice cloned from: {wav_file}")
        else:
            print(f"File not found: {wav_file}")


if __name__ == "__main__":
    jarvis = JarvisVoice()
    jarvis.speak("Namaskar! Main VaaniSetu hoon. Aapki kya madad kar sakta hoon?")
    jarvis.speak("PM Kisan Samman Nidhi mein har saal chheh hazaar rupaye teen kisht mein milte hain.")
    jarvis.speak("Aapke koi sawaal hain toh helpline ek paanch paanch do chheh ek par call kar sakte hain.")

    # Apni awaaz se clone karna ho toh:
    # jarvis = JarvisVoice(clone_voice_file="meri_awaaz.wav")
