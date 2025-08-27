// api/test-endpoints.js
export default async function handler(req, res) {
  try {
    const testContent = "Test file content";
    const testFileBuffer = Buffer.from(testContent);
    
    const FormData = require('form-data');
    const form = new FormData();
    form.append('File', testFileBuffer, 'test.txt');

    // Test multiple endpoints
    const endpoints = [
      'https://v2.convertapi.com/convert/pdf/to/docx',
      'https://v2.convertapi.com/convert',
      'https://api.convertapi.com/convert',
      'https://v2.convertapi.com/convert/docx/to/pdf'
    ];

    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CONVERTAPI_SECRET}`,
            ...form.getHeaders()
          },
          body: form,
          timeout: 10000
        });
        
        const status = response.status;
        const text = await response.text();
        
        results.push({
          endpoint,
          status,
          success: response.ok,
          response: text.substring(0, 200),
          isJSON: isJsonString(text)
        });
        
      } catch (error) {
        results.push({
          endpoint,
          error: error.message,
          success: false
        });
      }
    }

    res.json({ results });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

function isJsonString(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}