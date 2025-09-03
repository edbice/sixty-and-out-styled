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
function submitForm() {
  console.log('submitForm called - form is trying to submit');
  console.log('answers object:', answers);
  
  const formData = new FormData();
  
  Object.keys(answers).forEach(key => {
    const value = answers[key] || '';
    console.log(`Adding to FormData: ${key} = ${value}`);
    formData.append(key, value);
  });

  console.log('About to send POST request to:', APPS_SCRIPT_URL);
  
  typeLine('Submitting RSVP…', () => {});
  
  // ... rest of your existing fetchWithTimeout code
}