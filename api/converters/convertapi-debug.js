import FormData from 'form-data';

export async function convert(fileData, fileName, formatTo) {
  try {
    const fileBuffer = Buffer.from(fileData, 'base64');
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

    // First, get the response as text to see what it actually contains
    const responseText = await response.text();
    console.log('ConvertAPI raw response:', responseText);
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // Try to parse as JSON, but if it fails, we have the text
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      throw new Error(`ConvertAPI returned non-JSON response: ${responseText.substring(0, 200)}...`);
    }

    if (!response.ok) {
      throw new Error(`ConvertAPI error: ${response.status} - ${data.message || responseText}`);
    }

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
}