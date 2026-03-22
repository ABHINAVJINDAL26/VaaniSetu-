import 'package:flutter/material.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const VaaniSetuApp());
}

class VaaniSetuApp extends StatelessWidget {
  const VaaniSetuApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'VaaniSetu',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF0D9488)),
        useMaterial3: true,
        fontFamily: 'Roboto',
      ),
      home: const HomeScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}
