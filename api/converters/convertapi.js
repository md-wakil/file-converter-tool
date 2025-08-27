// api/converters/convertapi-official-fallback.js
export default async function convert(fileData, fileName, formatTo) {
  try {
    // For serverless, we might need to use a different approach
    // since Blob and File might not be available
    
    // Use the manual approach but with the official library's knowledge
    const ConvertApi = require('convertapi-js');
    const convertApi = ConvertApi.auth(process.env.CONVERTAPI_SECRET);
    
    // Convert base64 to buffer
    const fileBuffer = Buffer.from(fileData, 'base64');
    
    // Create parameters using buffer directly
    const params = convertApi.createParams();
    
    // Use the alternative method for adding files
    params.add('File', {
      value: fileBuffer,
      options: {
        filename: fileName,
        contentType: 'application/octet-stream'
      }
    });
    
    const sourceFormat = getSourceFormat(fileName);
    const result = await convertApi.convert(sourceFormat, formatTo, params);
    
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