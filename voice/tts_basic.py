import pyttsx3

class VaaniSetuVoice:

    def __init__(self):
        self.engine = pyttsx3.init()

        # Hindi voice dhundho
        voices = self.engine.getProperty('voices')
        for voice in voices:
            if 'hindi' in voice.name.lower() or 'hi' in voice.id.lower():
                self.engine.setProperty('voice', voice.id)
                print(f"Hindi voice selected: {voice.name}")
                break

        # Jarvis-style settings
        self.engine.setProperty('rate',   145)  # Speed
        self.engine.setProperty('volume', 1.0)  # Full volume

    def speak(self, text: str):
        print(f"[VaaniSetu]: {text}")
        self.engine.say(text)
        self.engine.runAndWait()

    def save(self, text: str, filename: str):
        self.engine.save_to_file(text, filename)
        self.engine.runAndWait()
        print(f"Saved to: {filename}")


if __name__ == "__main__":
    v = VaaniSetuVoice()
    v.speak("Namaskar! Main VaaniSetu hoon.")
    v.speak("PM Kisan mein aapko 6000 rupaye milenge.")
    v.speak("Helpline number hai: ek do teen char panch.")
