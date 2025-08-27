// api/test-env.js
export default async function handler(req, res) {
  try {
    // Test if environment variables are accessible
    const envVars = {
      hasCloudConvertKey: !!process.env.CLOUDCONVERT_API_KEY,
      hasConvertAPISecret: !!process.env.CONVERTAPI_SECRET,
      convertAPILength: process.env.CONVERTAPI_SECRET ? process.env.CONVERTAPI_SECRET.length : 0
    };
    
    console.log('Environment variables test:', envVars);
    
    res.json({
      success: true,
      environment: envVars,
      message: 'Environment variables check completed'
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      environment: {
        hasCloudConvertKey: !!process.env.CLOUDCONVERT_API_KEY,
        hasConvertAPISecret: !!process.env.CONVERTAPI_SECRET
      }
    });
  }
}