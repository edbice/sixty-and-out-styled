// api/submit.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbzRWYuvLxAjbqhihk72MXaoUITNNts9bx9QkKvgn-WEonMTLcPY4tysbM0pGw3kAlfT/exec";

  try {
    // Convert the FormData to a plain object
    const formData = new FormData();
    
    // Parse the request body (which should be FormData from frontend)
    for (const [key, value] of Object.entries(req.body)) {
      if (value instanceof File) {
        // Handle file uploads - for now, just store filename
        formData.append(key, value.name || '');
      } else {
        formData.append(key, value || '');
      }
    }

    // Convert FormData to JSON for Apps Script
    const jsonData = {};
    for (const [key, value] of formData.entries()) {
      jsonData[key] = value;
    }

    // Forward as JSON to Google Apps Script
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(jsonData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Parse the response
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      // If Apps Script didn't send JSON, wrap it safely
      data = { ok: false, raw: text };
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}