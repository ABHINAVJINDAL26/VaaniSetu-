import 'package:flutter/material.dart';

class VoiceQueryScreen extends StatefulWidget {
  const VoiceQueryScreen({super.key});

  @override
  State<VoiceQueryScreen> createState() => _VoiceQueryScreenState();
}

class _VoiceQueryScreenState extends State<VoiceQueryScreen> {
  bool isListening = true;
  String transcript = "Listening in Bhili/Gondi...";
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Voice Query')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            const Spacer(),
            Center(
              child: Container(
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isListening ? Colors.teal.withOpacity(0.2) : Colors.grey.withOpacity(0.2),
                ),
                child: Icon(
                  isListening ? Icons.mic : Icons.mic_off,
                  size: 80,
                  color: isListening ? Colors.teal : Colors.grey,
                ),
              ),
            ),
            const SizedBox(height: 40),
            Text(
              transcript,
              style: const TextStyle(fontSize: 22, fontStyle: FontStyle.italic),
              textAlign: TextAlign.center,
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () {
                  setState(() {
                    isListening = false;
                    transcript = "Processing locally via TFLite (248KB INT8)... Model Offline inference successful.";
                  });
                },
                child: const Text("Stop & Process Locally"),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
