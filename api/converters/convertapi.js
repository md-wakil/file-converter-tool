// api/converters/convertapi-official.js
import ConvertApi from 'convertapi-js';

// Initialize ConvertAPI with your secret
const convertApi = ConvertApi.auth(process.env.CONVERTAPI_SECRET);

export default async function convert(fileData, fileName, formatTo) {
  try {
    console.log('ConvertAPI: Converting', fileName, 'to', formatTo);
    
    // Convert base64 to buffer
    const fileBuffer = Buffer.from(fileData, 'base64');
    
    // Create a blob from the buffer
    const blob = new Blob([fileBuffer], { type: 'application/octet-stream' });
    
    // Create file object for ConvertAPI
    const file = new File([blob], fileName, { type: 'application/octet-stream' });
    
    // Create parameters
    const params = convertApi.createParams();
    params.add('File', file);
    
    // Determine source format from filename
    const sourceFormat = getSourceFormat(fileName);
    
    console.log('Converting from', sourceFormat, 'to', formatTo);
    
    // Perform conversion
    const result = await convertApi.convert(sourceFormat, formatTo, params);
    
    console.log('ConvertAPI result:', result);
    
    // The result should contain the download URL
    if (!result || !result.files || !result.files[0] || !result.files[0].Url) {
      throw new Error('ConvertAPI response missing download URL');
    }
    
    return {
      downloadUrl: result.files[0].Url,
      service: 'convertapi'
    };

  } catch (error) {
    console.error('ConvertAPI conversion failed:', error.message);
    
    // Provide more specific error messages
    if (error.message.includes('credit') || error.message.includes('limit')) {
      throw new Error('ConvertAPI daily limit reached');
    }
    if (error.message.includes('format') || error.message.includes('unsupported')) {
      throw new Error('Unsupported file format for conversion');
    }
    if (error.message.includes('auth') || error.message.includes('token')) {
      throw new Error('ConvertAPI authentication failed. Check your API key.');
    }
    
    throw error;
  }
}

function getSourceFormat(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  const formatMap = {
    'pdf': 'pdf',
    'docx': 'docx',
    'doc': 'doc',
    'txt': 'txt',
    'jpg': 'jpg',
    'jpeg': 'jpeg',
    'png': 'png',
    'pptx': 'pptx',
    'ppt': 'ppt',
    'xlsx': 'xlsx',
    'xls': 'xls'
  };
  return formatMap[ext] || 'pdf'; // default to pdf if unknown
}