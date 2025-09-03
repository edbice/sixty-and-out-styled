// api/submit.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbzRWYuvLxAjbqhihk72MXaoUITNNts9bx9QkKvgn-WEonMTLcPY4tysbM0pGw3kAlfT/exec";

  try {
    // Parse FormData from the request
    const formData = new FormData();
    for await (const field of req.body) {
      formData.append(field.name, field.value || '');
    }

    // Convert to simple object for JSON
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

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { ok: false, raw: text };
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}