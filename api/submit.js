// api/submit.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyXkeqNAjET2cVG77--Ub2ZhosNAmFMt9i-EDJTVfcFwWmkK3_oIUc1SM6r_61iagxKJQ/exec";
 

  try {
    // Vercel automatically parses FormData into req.body as an object
    const jsonData = {};
    
    // Extract form fields - req.body should be a plain object
    Object.keys(req.body || {}).forEach(key => {
      jsonData[key] = req.body[key] || '';
    });

    console.log('Form data received:', jsonData); // For debugging

    // Forward as JSON to Google Apps Script
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(jsonData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const text = await response.text();
    console.log('Apps Script response:', text); // For debugging
    
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { ok: false, raw: text };
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
}