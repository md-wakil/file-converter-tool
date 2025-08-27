// api/converters/convertapi-fixed.js
const FormData = require('form-data');

exports.convert = async (fileData, fileName, formatTo) => {
  try {
    console.log('ConvertAPI: Converting', fileName, 'to', formatTo);
    
    const fileBuffer = Buffer.from(fileData, 'base64');
    const form = new FormData();
    form.append('File', fileBuffer, fileName);

    // Choose the correct endpoint based on conversion type
    let endpoint;
    if (formatTo === 'docx' && fileName.toLowerCase().endsWith('.pdf')) {
      endpoint = 'https://v2.convertapi.com/convert/pdf/to/docx';
    } else if (formatTo === 'pdf' && fileName.toLowerCase().endsWith('.docx')) {
      endpoint = 'https://v2.convertapi.com/convert/docx/to/pdf';
    } else {
      // Try the general endpoint (might not work)
      endpoint = 'https://v2.convertapi.com/convert';
      console.log('Using general endpoint - may not work');
    }

    console.log('Using endpoint:', endpoint);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CONVERTAPI_SECRET}`,
        ...form.getHeaders()
      },
      body: form
    });

    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response preview:', responseText.substring(0, 200));

    if (response.status === 404) {
      throw new Error('ConvertAPI endpoint not found. API may have changed.');
    }

    if (!response.ok) {
      throw new Error(`ConvertAPI error ${response.status}: ${responseText}`);
    }

    if (!isJsonString(responseText)) {
      throw new Error(`ConvertAPI returned non-JSON: ${responseText.substring(0, 100)}`);
    }

    const data = JSON.parse(responseText);
    
    if (!data.Files || !data.Files[0] || !data.Files[0].Url) {
      throw new Error('ConvertAPI response missing file URL');
    }

    return {
      downloadUrl: data.Files[0].Url,
      service: 'convertapi'
    };

  } catch (error) {
    console.error('ConvertAPI conversion failed:', error.message);
    throw error;
  }
};

function isJsonString(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}