// api/debug-convertapi.js
export default async function handler(req, res) {
  try {
    console.log('1. Testing environment variables...');
    const apiKey = process.env.CONVERTAPI_SECRET;
    console.log('API key exists:', !!apiKey);
    console.log('API key length:', apiKey ? apiKey.length : 0);
    
    if (!apiKey) {
      return res.json({ error: 'CONVERTAPI_SECRET environment variable is missing' });
    }

    console.log('2. Testing FormData import...');
    let FormData;
    try {
      FormData = require('form-data');
      console.log('FormData imported successfully');
    } catch (importError) {
      console.log('FormData import failed:', importError);
      return res.json({ error: 'FormData package missing. Run: npm install form-data' });
    }

    console.log('3. Testing simple API call...');
    const testResponse = await fetch('https://v2.convertapi.com/user', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    console.log('API test status:', testResponse.status);
    const testText = await testResponse.text();
    console.log('API test response:', testText.substring(0, 200));
    
    res.json({
      success: true,
      status: testResponse.status,
      responsePreview: testText.substring(0, 200),
      message: 'Debug completed'
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
}