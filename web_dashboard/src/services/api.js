const API_URL = "http://localhost:8000";

export const api = {
  getSchemes: async () => {
    const res = await fetch(`${API_URL}/schemes`);
    if (!res.ok) throw new Error("Failed to fetch schemes");
    const data = await res.json();
    return data; // returns list of schemes
  },
  createScheme: async (schemeData) => {
    const res = await fetch(`${API_URL}/schemes/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(schemeData),
    });
    if (!res.ok) throw new Error("Failed to create scheme");
    return res.json();
  },
};
