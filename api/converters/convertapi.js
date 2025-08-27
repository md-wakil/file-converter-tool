// api/converters/convertapi.js
const FormData = require('form-data');
const fetch = require('node-fetch'); // If you haven't installed node-fetch yet

exports.convert = async (fileData, fileName, formatTo) => {
  try {
    // Create FormData object for Node.js
    const form = new FormData();
    
    // Convert base64 to buffer
    const fileBuffer = Buffer.from(fileData, 'base64');
    
    // Append file to form data
    form.append('File', fileBuffer, fileName);
    
    // Add other parameters
    form.append('OutputFormat', formatTo);

    // Make the API request
    const response = await fetch('https://v2.convertapi.com/convert', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CONVERTAPI_SECRET}`,
        ...form.getHeaders() // This is crucial for FormData
      },
      body: form
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ConvertAPI error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.Files || !data.Files[0] || !data.Files[0].Url) {
      throw new Error('ConvertAPI returned invalid response format');
    }

    return {
      downloadUrl: data.Files[0].Url,
      service: 'convertapi'
    };

  } catch (error) {
    console.error('ConvertAPI conversion error:', error);
    throw new Error(`ConvertAPI failed: ${error.message}`);
  }
};