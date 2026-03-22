import { useState, useEffect } from "react";
import { Plus, Save, Database, Trash2 } from "lucide-react";
import { api } from "../services/api";

export default function KBEditor() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    scheme_id: "",
    name: "",
    description: "",
    intent_class: 1,
    dialects: ["hindi"],
    qa_pairs: [{ intent: "eligibility", question_keywords: [""], answer_text: "" }]
  });

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      const data = await api.getSchemes();
      // Ensure data is array (FastAPI directly returns array based on our router)
      setSchemes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createScheme({
        ...formData,
        dialects: typeof formData.dialects === 'string' ? formData.dialects.split(',') : formData.dialects
      });
      alert("Scheme saved successfully to Database!");
      fetchSchemes();
      // Reset form
      setFormData({...formData, scheme_id: "", name: "", description: ""});
    } catch (err) {
      alert("Error saving scheme. Ensure backend is running.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-sm flex items-center gap-3">
            <Database className="w-8 h-8 text-teal-400" />
            Knowledge Base Editor
          </h1>
          <p className="text-slate-400 mt-2">Manage government schemes for the local SQLite offline cache.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Area */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border border-slate-700/50 shadow-2xl">
          <h2 className="text-xl font-bold text-slate-200 mb-6 border-b border-slate-800 pb-4">Add Scheme Node</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Scheme ID</label>
                <input 
                  required
                  type="text" 
                  value={formData.scheme_id}
                  onChange={(e) => setFormData({...formData, scheme_id: e.target.value})}
                  className="w-full bg-slate-900/80 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all shadow-inner"
                  placeholder="e.g., pm_kisan"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Scheme Name</label>
                <input 
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-900/80 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all shadow-inner"
                  placeholder="PM Kisan Samman Nidhi"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Description</label>
              <textarea 
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-slate-900/80 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all shadow-inner"
                placeholder="Details about the scheme..."
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-800/50">
              <h3 className="text-lg font-semibold text-slate-300 flex items-center justify-between">
                Q&A Pairs (Intents)
              </h3>
              
              <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-700/30 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-medium">Intent Type</label>
                    <input 
                      type="text"
                      value={formData.qa_pairs[0].intent}
                      onChange={(e) => {
                        const newQa = [...formData.qa_pairs];
                        newQa[0].intent = e.target.value;
                        setFormData({...formData, qa_pairs: newQa});
                      }}
                      className="w-full bg-slate-800/80 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none focus:border-teal-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-medium">Trigger Keywords</label>
                    <input 
                      type="text"
                      value={formData.qa_pairs[0].question_keywords.join(',')}
                      onChange={(e) => {
                        const newQa = [...formData.qa_pairs];
                        newQa[0].question_keywords = e.target.value.split(',');
                        setFormData({...formData, qa_pairs: newQa});
                      }}
                      className="w-full bg-slate-800/80 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium">Voice Assistant Answer</label>
                  <textarea 
                    rows={2}
                    value={formData.qa_pairs[0].answer_text}
                    onChange={(e) => {
                      const newQa = [...formData.qa_pairs];
                      newQa[0].answer_text = e.target.value;
                      setFormData({...formData, qa_pairs: newQa});
                    }}
                    className="w-full bg-slate-800/80 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 mt-4 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-slate-950 font-black tracking-wide uppercase rounded-xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(20,184,166,0.4)] transition-all transform hover:scale-[1.01]"
            >
              <Save className="w-5 h-5" />
              Save Protocol to Database
            </button>
          </form>
        </div>

        {/* Existing Schemes Area */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-700/50 flex flex-col shadow-xl">
          <h2 className="text-xl font-bold text-slate-200 mb-6 border-b border-slate-800 pb-4 flex items-center justify-between">
            Active Logic DB
            <span className="text-xs font-black px-2.5 py-1 bg-slate-800/80 border border-slate-700 text-slate-300 rounded-full">{schemes.length} Total</span>
          </h2>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {loading ? (
              <p className="text-slate-500 text-sm text-center py-10 animate-pulse font-medium tracking-wide">Querying SQLite Node...</p>
            ) : schemes.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-700/50 rounded-2xl bg-slate-900/30">
                <Database className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-medium">No schemes deployed yet.</p>
              </div>
            ) : (
              schemes.map(s => (
                <div key={s.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 hover:border-teal-500/50 transition-colors shadow-sm group">
                  <h3 className="font-bold text-slate-200 text-sm drop-shadow-sm">{s.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 font-mono bg-slate-950 px-2 py-0.5 rounded inline-block">{s.scheme_id}</p>
                  <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">{s.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
