export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyXkeqNAjET2cVG77--Ub2ZhosNAmFMt9i-EDJTVfcFwWmkK3_oIUc1SM6r_61iagxKJQ/exec";

  try {
    const jsonData = {};
    Object.keys(req.body || {}).forEach(key => {
      jsonData[key] = req.body[key] || '';
    });

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