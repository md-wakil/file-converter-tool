export default async function convert(fileData, fileName, formatTo) {
  try {
    console.log('ConvertAPI: Converting', fileName, 'to', formatTo);
    
    // Convert base64 to buffer
    const fileBuffer = Buffer.from(fileData, 'base64');
    
    // Create form data using Blob (works better in serverless)
    const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substring(2);
    const chunks = [];
    // Add file part
    chunks.push(Buffer.from(`--${boundary}\r\n`));
    chunks.push(Buffer.from(`Content-Disposition: form-data; name="File"; filename="${fileName}"\r\n`));
    chunks.push(Buffer.from(`Content-Type: application/octet-stream\r\n\r\n`));
    chunks.push(fileBuffer);
    chunks.push(Buffer.from('\r\n'));
    
    // Add format part
    chunks.push(Buffer.from(`--${boundary}\r\n`));
    chunks.push(Buffer.from(`Content-Disposition: form-data; name="OutputFormat"\r\n\r\n`));
    chunks.push(Buffer.from(`${formatTo}\r\n`));
    
    chunks.push(Buffer.from(`--${boundary}--\r\n`));
    
    const formBody = Buffer.concat(chunks);

    // Choose endpoint
    let endpoint;
    if (formatTo === 'docx' && /\.pdf$/i.test(fileName)) {
      endpoint = 'https://v2.convertapi.com/convert/pdf/to/docx';
    } else if (formatTo === 'pdf' && /\.(docx|doc)$/i.test(fileName)) {
      endpoint = 'https://v2.convertapi.com/convert/docx/to/pdf';
    } else {
      endpoint = 'https://v2.convertapi.com/convert';
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CONVERTAPI_SECRET}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': formBody.length.toString()
      },
      body: formBody
    });

    const responseText = await response.text();
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`ConvertAPI error ${response.status}: ${responseText}`);
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
}