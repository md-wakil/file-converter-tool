const FormData = require('form-data');

exports.convert = async (fileData, fileName, formatTo) => {
  try {
    console.log('Starting ConvertAPI conversion for:', fileName, 'to', formatTo);
    
    // Convert base64 to buffer
    const fileBuffer = Buffer.from(fileData, 'base64');
    
    // Create form data
    const form = new FormData();
    form.append('File', fileBuffer, fileName);
    form.append('OutputFormat', formatTo);

    console.log('Sending request to ConvertAPI...');
    
    const response = await fetch('https://v2.convertapi.com/convert', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CONVERTAPI_SECRET}`,
        ...form.getHeaders()
      },
      body: form
    });

    console.log('ConvertAPI response status:', response.status);
    
    const responseText = await response.text();
    console.log('ConvertAPI response text (first 200 chars):', responseText.substring(0, 200));

    // Check if response is HTML (indicating an error page)
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
      throw new Error('ConvertAPI returned HTML error page. Check API key and account status.');
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      throw new Error(`ConvertAPI returned invalid JSON: ${responseText.substring(0, 100)}...`);
    }

    if (!response.ok) {
      throw new Error(`ConvertAPI error ${response.status}: ${data.message || response.statusText}`);
    }

    if (!data.Files || !data.Files[0] || !data.Files[0].Url) {
      throw new Error('ConvertAPI response missing file URL');
    }

    console.log('ConvertAPI success! Download URL:', data.Files[0].Url);
    return {
      downloadUrl: data.Files[0].Url,
      service: 'convertapi'
    };

  } catch (error) {
    console.error('ConvertAPI conversion failed:', error.message);
    throw new Error(`ConvertAPI failed: ${error.message}`);
  }
};