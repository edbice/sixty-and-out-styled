// api/submit.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbzRWYuvLxAjbqhihk72MXaoUITNNts9bx9QkKvgn-WEonMTLcPY4tysbM0pGw3kAlfT/exec";

  try {
    // Forward the request to Google Apps Script
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: req.body, // raw body (formData)
      headers: {
        "content-type": req.headers["content-type"] || "application/json",
      },
    });

    // Attempt to parse JSON
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      // If Apps Script didn't send JSON, wrap it safely
      data = { ok: false, raw: text };
    }

    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
