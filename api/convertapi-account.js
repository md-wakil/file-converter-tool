// api/convertapi-account.js
export default async function handler(req, res) {
  try {
    const response = await fetch('https://v2.convertapi.com/user', {
      headers: {
        'Authorization': `Bearer ${process.env.CONVERTAPI_SECRET}`
      }
    });

    const responseText = await response.text();
    
    res.json({
      status: response.status,
      accountInfo: isJsonString(responseText) ? JSON.parse(responseText) : responseText,
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