// api/debug-convertapi-response.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileData, fileName, formatTo } = req.body;
    
    // Convert base64 to buffer
    const fileBuffer = Buffer.from(fileData, 'base64');
    
    // Create form data
    const FormData = require('form-data');
    const form = new FormData();
    form.append('File', fileBuffer, fileName);
    form.append('OutputFormat', formatTo);

    // Make the API request
    const response = await fetch('https://v2.convertapi.com/convert', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CONVERTAPI_SECRET}`,
        ...form.getHeaders()
      },
      body: form
    });

    const responseText = await response.text();
    
    // Return the raw response for debugging
    res.json({
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      response: responseText,
      responsePreview: responseText.substring(0, 500) + (responseText.length > 500 ? '...' : '')
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}