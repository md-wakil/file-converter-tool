// api/convert.js
const CloudConvert = require('cloudconvert');

export default async function handler(request, response) {
  // 1. Check if the request is a POST request
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Only POST requests allowed' });
  }

  // 2. Create a new CloudConvert client with our secret API key
  const cloudConvert = new CloudConvert(process.env.CLOUDCONVERT_API_KEY);

  try {
    // 3. Get the file data from the frontend
    const { fileName, fileData, formatTo } = await request.body;

    // 4. Create a CloudConvert job
    let job = await cloudConvert.jobs.create({
      tasks: {
        // Task 1: Import the file from the Base64 string we received
        'import-my-file': {
          operation: 'import/base64',
          file: fileData, // Use the base64 string directly
          filename: fileName
        },
        // Task 2: Convert it to the target format
        'convert-my-file': {
          operation: 'convert',
          input: 'import-my-file',
          output_format: formatTo,
          // Some optional engine-specific options
          engine: formatTo === 'pdf' ? 'libreoffice' : 'ffmpeg', // Example: use ffmpeg for video/audio, libreoffice for documents
        },
        // Task 3: Export the converted file
        'export-my-file': {
          operation: 'export/url',
          input: 'convert-my-file'
        }
      }
    });

    // 5. Wait for the job to finish
    job = await cloudConvert.jobs.wait(job.id);

    // 6. Find the export task to get the download URL
    const exportTask = job.tasks.filter(task => task.name === 'export-my-file')[0];
    const downloadUrl = exportTask.result.files[0].url;

    // 7. Send the download URL back to the frontend
    response.status(200).json({
      success: true,
      downloadUrl: downloadUrl,
      jobId: job.id
    });

  } catch (error) {
    // 8. If anything goes wrong, send an error message
    console.error('Conversion error:', error);
    response.status(500).json({ error: 'Conversion failed. Please try again.' });
  }
}
