// api/convert-router.js
const cloudConvert = require('./converters/cloudconvert');
//const convertAPI = require('./converters/convertapi');
//const onlineConvertFree = require('./converters/onlineconvertfree');

// Track daily usage
let dailyUsage = {
    cloudconvert: 0,
    convertapi: 0,
    lastReset: new Date().toDateString()
};

function resetDailyCounters() {
    const today = new Date().toDateString();
    if (dailyUsage.lastReset !== today) {
        dailyUsage = {
            cloudconvert: 0,
            convertapi: 0,
            lastReset: today
        };
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    resetDailyCounters();
    const { fileData, fileName, formatTo } = req.body;

    try {
        let result;

        // Try CloudConvert first (if under daily limit)
        // if (dailyUsage.cloudconvert < 25) {
            try {
                result = await cloudConvert.convert(fileData, fileName, formatTo);
                dailyUsage.cloudconvert++;
                console.log("Used CloudConvert. Daily usage:", dailyUsage.cloudconvert);
                return res.json({ ...result, service: 'cloudconvert' });
            } catch (error) {
                console.log("CloudConvert failed, trying fallback...");
                throw error;
            }
        //}

        // Try ConvertAPI second (if under daily limit)
        /**if (dailyUsage.convertapi < 10) {
            try {
                result = await convertAPI.convert(fileData, fileName, formatTo);
                dailyUsage.convertapi++;
                console.log("Used ConvertAPI. Daily usage:", dailyUsage.convertapi);
                return res.json({ ...result, service: 'convertapi' });
            } catch (error) {
                console.log("ConvertAPI failed:", error.message);
                // Check if it's an authentication error
                if (error.message.includes('401') || error.message.includes('auth')) {
                console.log("ConvertAPI authentication failed - check API key");
                }
                throw error;
            }
        }**/

        // Try OnlineConvertFree as final fallback
        /**try {
            result = await onlineConvertFree.convert(fileData, fileName, formatTo);
            console.log("Used OnlineConvertFree (unlimited)");
            return res.json({ ...result, service: 'onlineconvertfree' });
        } catch (error) {
            console.log("All converters failed");
            throw new Error('All conversion services are currently unavailable. Please try again later.');
        }**/

    } catch (error) {
        console.error('Conversion router error:', error);
        res.status(500).json({
            error: error.message,
            dailyUsage: dailyUsage
        });
    }
}