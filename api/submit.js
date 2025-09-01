// Vercel Serverless Function: /api/submit
// Proxies form submissions to Google Apps Script to avoid CORS issues.

export const config = { runtime: 'edge' }; // Edge is fast & simple

const GAS_URL = 
"https://script.google.com/macros/s/AKfycbzRWYuvLxAjbqhihk72MXaoUITNNts9bx9QkKvgn-WEonMTLcPY4tysbM0pGw3kAlfT/exec";

export default async function handler(req) {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ ok: false, error: 'Use POST' 
}), {
        status: 405,
        headers: { 'content-type': 'application/json' }
      });
    }

    // Forward the original body as-is (FormData or JSON) without setting 
headers
    // so that the boundary/content-type is preserved by fetch 
automatically.
    const res = await fetch(GAS_URL, {
      method: 'POST',
      body: req.body, // streams the body through
    });

    // Read the response as text, then try JSON (Apps Script returns JSON 
text)
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); }
    catch { json = { ok: res.ok, status: res.status, body: text }; }

    return new Response(JSON.stringify(json), {
      status: res.ok ? 200 : 500,
      headers: { 'content-type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: 
String(err?.message || err) }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}

