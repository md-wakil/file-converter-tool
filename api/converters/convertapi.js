// api/converters/convertapi-official-fallback.js
// Try different import approaches:

// Approach 1: Default import
const ConvertApi = require('convertapi-js').default;

// Approach 2: Named import  
const { default: ConvertApi } = require('convertapi-js');

// Approach 3: Dynamic import (works in modern Node.js)
// const ConvertApi = (await import('convertapi-js')).default;

exports.convert = async (fileData, fileName, formatTo) => {
  try {
    console.log('ConvertAPI: Converting', fileName, 'to', formatTo);
    
    // Try different initialization methods
    let convertApi;
    
    // Method 1: Using auth method
    try {
      convertApi = ConvertApi.auth(process.env.CONVERTAPI_SECRET);
    } catch (authError) {
      console.log('Auth method failed, trying alternative...');
      // Method 2: Using constructor
      convertApi = new ConvertApi(process.env.CONVERTAPI_SECRET);
    }
    
    const fileBuffer = Buffer.from(fileData, 'base64');
    const params = convertApi.createParams();
    
    // Add file using the buffer approach
    params.add('File', {
      value: fileBuffer,
      options: {
        filename: fileName,
        contentType: 'application/octet-stream'
      }
    });
    
    const sourceFormat = getSourceFormat(fileName);
    console.log('Converting from', sourceFormat, 'to', formatTo);
    
    const result = await convertApi.convert(sourceFormat, formatTo, params);
    
    console.log('ConvertAPI result:', result);
    
    if (!result?.files?.[0]?.Url) {
      throw new Error('ConvertAPI response missing download URL');
    }
    
    return {
      downloadUrl: result.files[0].Url,
      service: 'convertapi'
    };

  } catch (error) {
    console.error('ConvertAPI conversion failed:', error.message);
    throw error;
  }
}

function getSourceFormat(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  const formatMap = {
    'pdf': 'pdf', 'docx': 'docx', 'doc': 'doc', 'txt': 'txt',
    'jpg': 'jpg', 'jpeg': 'jpeg', 'png': 'png', 'pptx': 'pptx',
    'ppt': 'ppt', 'xlsx': 'xlsx', 'xls': 'xls'
  };
  return formatMap[ext] || 'pdf';
}