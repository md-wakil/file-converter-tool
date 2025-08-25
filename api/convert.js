// api/convert.js
const CloudConvert = require('cloudconvert');

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Only POST requests allowed' });
  }

  const cloudConvert = new CloudConvert(process.env.CLOUDCONVERT_API_KEY);

  try {
    const { fileName, fileData, formatTo } = await request.body;

    let job = await cloudConvert.jobs.create({
      tasks: {
        'import-my-file': {
          operation: 'import/base64',
          file: fileData,
          filename: fileName
        },
        'convert-my-file': {
          operation: 'convert',
          input: 'import-my-file',
          output_format: formatTo,
          engine: formatTo === 'pdf' ? 'libreoffice' : undefined,
        },
        'export-my-file': {
          operation: 'export/url',
          input: 'convert-my-file'
        }
      }
    });

    // Wait for the job to finish
    job = await cloudConvert.jobs.wait(job.id);
    
    // --- CRITICAL: ADD ERROR CHECKING HERE ---
    
    // Check if the entire job failed
    if (job.status === 'error') {
      console.error('Job failed:', job);
      // Try to get more specific error information
      const failedTask = job.tasks.find(task => task.status === 'error');
      const errorMessage = failedTask 
        ? (failedTask.message || `Task "${failedTask.name}" failed during processing.`) 
        : 'Conversion job failed for an unknown reason.';
      
      throw new Error(errorMessage);
    }

    // Find the export task
    const exportTask = job.tasks.find(task => task.name === 'export-my-file');
    
    // Check if export task exists and has a result
    if (!exportTask || !exportTask.result) {
      console.error('Export task missing or has no result:', job);
      throw new Error('Conversion completed but could not prepare file for download.');
    }

    // Check if export task has files
    if (!exportTask.result.files || exportTask.result.files.length === 0) {
      console.error('No files in export task result:', exportTask);
      throw new Error('Conversion completed but no file was generated.');
    }

    // Now it's safe to access the files array
    const downloadUrl = exportTask.result.files[0].url;

    // Send the download URL back to the frontend
    response.status(200).json({
      success: true,
      downloadUrl: downloadUrl,
      jobId: job.id
    });

  } catch (error) {
    console.error('Conversion error:', error);
    
    // Provide more specific error messages based on the error type
    let errorMessage = 'Conversion failed. Please try again.';
    
    if (error.message.includes('format') || error.message.includes('unsupported')) {
      errorMessage = 'This file format conversion is not supported. Please try a different format.';
    } else if (error.message.includes('invalid') || error.message.includes('corrupt')) {
      errorMessage = 'The file appears to be invalid or corrupted. Please try a different file.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    response.status(500).json({ error: errorMessage });
  }
}
