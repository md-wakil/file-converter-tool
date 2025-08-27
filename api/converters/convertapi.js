// api/converters/convertapi.js
const FormData = require('form-data');

exports.convert = async (fileData, fileName, formatTo) => {
  try {
    console.log('ConvertAPI: Starting conversion', fileName, 'to', formatTo);
    
    // Check if format is supported
    const supportedFormats = ['pdf', 'docx', 'doc', 'jpg', 'jpeg', 'png', 'txt'];
    if (!supportedFormats.includes(formatTo.toLowerCase())) {
      throw new Error(`ConvertAPI does not support conversion to ${formatTo}`);
    }

    // Convert base64 to buffer
    const fileBuffer = Buffer.from(fileData, 'base64');
    
    // Check file size (ConvertAPI free tier has limits)
    if (fileBuffer.length > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('File size too large for ConvertAPI free tier (max 10MB)');
    }

    const form = new FormData();
    form.append('File', fileBuffer, fileName);
    form.append('OutputFormat', formatTo);

    const response = await fetch('https://v2.convertapi.com/convert', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CONVERTAPI_SECRET}`,
        ...form.getHeaders()
      },
      body: form
    });

    const responseText = await response.text();
    console.log('ConvertAPI response status:', response.status);
    console.log('ConvertAPI response preview:', responseText.substring(0, 200));

    // Handle non-JSON responses
    if (!isJsonString(responseText)) {
      if (responseText.includes('Invalid file format') || responseText.includes('unsupported format')) {
        throw new Error('ConvertAPI: Unsupported file format for conversion');
      }
      if (responseText.includes('quota') || responseText.includes('limit')) {
        throw new Error('ConvertAPI: Daily conversion limit reached');
      }
      if (responseText.includes('size') || responseText.includes('too large')) {
        throw new Error('ConvertAPI: File size too large');
      }
      throw new Error(`ConvertAPI returned non-JSON response: ${responseText.substring(0, 100)}`);
    }

    const data = JSON.parse(responseText);
    
    if (!response.ok) {
      throw new Error(`ConvertAPI error ${response.status}: ${data.message || JSON.stringify(data)}`);
    }

    if (!data.Files || !data.Files[0] || !data.Files[0].Url) {
      throw new Error('ConvertAPI response missing file URL');
    }

    console.log('ConvertAPI success!');
    return {
      downloadUrl: data.Files[0].Url,
      service: 'convertapi'
    };

  } catch (error) {
    console.error('ConvertAPI conversion failed:', error.message);
    throw error; // Re-throw to let router handle fallback
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