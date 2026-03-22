import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import VoiceAssistant from "./pages/VoiceAssistant";

import KBEditor from "./pages/KBEditor";

// Placeholder components for other routes, styled in glassmorphism dark theme
function DeviceManager() { return <div className="p-8 glass-panel rounded-3xl h-96 flex flex-col items-center justify-center text-slate-400"><h2 className="text-2xl font-black text-slate-200 mb-2 drop-shadow-sm">Device Manager</h2><p>View and sync deployed VaaniSetu edge nodes here.</p></div>; }
function Analytics() { return <div className="p-8 glass-panel rounded-3xl h-96 flex flex-col items-center justify-center text-slate-400"><h2 className="text-2xl font-black text-slate-200 mb-2 drop-shadow-sm">Advanced Analytics</h2><p>Deep dive into dialect accuracy and query telemetry.</p></div>; }

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/voice" element={<VoiceAssistant />} />
          <Route path="/devices" element={<DeviceManager />} />
          <Route path="/kb" element={<KBEditor />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
