exports.convert = async (fileData, fileName, formatTo) => {
  // ConvertAPI expects different parameters
  const formData = new FormData();
  formData.append('File', Buffer.from(fileData, 'base64'), fileName);
  formData.append('OutputFormat', formatTo);

  const response = await fetch('https://v2.convertapi.com/convert', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CONVERTAPI_SECRET}`,
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`ConvertAPI error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    downloadUrl: data.Files[0].Url,
    service: 'convertapi'
  };
};