// api/test-simple-conversion.js
export default async function handler(req, res) {
  try {
    // Create a simple text file for testing
    const testContent = "This is a test file for conversion";
    const testFileBuffer = Buffer.from(testContent);
    const base64File = testFileBuffer.toString('base64');
    
    const FormData = require('form-data');
    const form = new FormData();
    form.append('File', testFileBuffer, 'test.txt');
    form.append('OutputFormat', 'pdf'); // Convert to PDF

    const response = await fetch('https://v2.convertapi.com/convert', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CONVERTAPI_SECRET}`,
        ...form.getHeaders()
      },
      body: form
    });

    const responseText = await response.text();
    
    res.json({
      status: response.status,
      response: responseText.substring(0, 1000),
      isJSON: isJsonString(responseText)
    });

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