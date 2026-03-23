from TTS.api import TTS
import os
import subprocess

class CoquiVoice:

    def __init__(self):
        print("Loading Hindi TTS model...")
        self.tts = TTS(
            model_name="tts_models/hi/cv/vits",
            progress_bar=False,
            gpu=False
        )
        print("Coqui Hindi voice ready!")

    def speak(self, text: str):
        print(f"[VaaniSetu]: {text}")
        self.tts.tts_to_file(text=text, file_path="temp_response.wav")
        if os.name == 'nt':
            os.system("start temp_response.wav")
        else:
            subprocess.run(["aplay", "temp_response.wav"])

    def speak_and_save(self, text: str, filename: str = "response.wav"):
        self.tts.tts_to_file(text=text, file_path=filename)
        print(f"Saved: {filename}")
        return filename


if __name__ == "__main__":
    voice = CoquiVoice()
    voice.speak("Namaskar! Main VaaniSetu hoon.")
    voice.speak("PM Kisan yojana mein aapko saal mein chheh hazaar rupaye milte hain.")
    voice.speak("Ration card ke liye Tehsil office mein Aadhaar aur income proof lekar jaayein.")
