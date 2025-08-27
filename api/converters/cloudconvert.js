const CloudConvert = require('cloudconvert');

const cloudConvertClient = new CloudConvert(process.env.CLOUDCONVERT_API_KEY);

exports.convert = async (fileData, fileName, formatTo) => {
  const job = await cloudConvertClient.jobs.create({
    tasks: {
      'import-file': {
        operation: 'import/base64',
        file: fileData,
        filename: fileName
      },
      'convert-file': {
        operation: 'convert',
        input: 'import-file',
        output_format: formatTo,
        engine: formatTo === 'pdf' ? 'libreoffice' : undefined,
      },
      'export-file': {
        operation: 'export/url',
        input: 'convert-file'
      }
    }
  });

  const completedJob = await cloudConvertClient.jobs.wait(job.id);
  const exportTask = completedJob.tasks.find(task => task.name === 'export-file');
  
  if (!exportTask?.result?.files?.[0]?.url) {
    throw new Error('CloudConvert conversion failed');
  }

  return {
    downloadUrl: exportTask.result.files[0].url,
    service: 'cloudconvert'
  };
};