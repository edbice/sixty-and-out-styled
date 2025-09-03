export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  // Let's see what data we're getting from the form
  const jsonData = {};
  Object.keys(req.body || {}).forEach(key => {
    jsonData[key] = req.body[key] || '';
  });

  // Return the data instead of sending it to Apps Script (for debugging)
  return res.status(200).json({
    debug: true,
    receivedData: jsonData,
    dataKeys: Object.keys(jsonData),
    bodyType: typeof req.body
  });
}