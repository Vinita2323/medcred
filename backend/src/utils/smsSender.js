import http from 'http';

/**
 * Utility to send SMS via SMS India Hub API using native Node http module.
 * This guarantees compatibility with all Node.js versions (including those without global fetch).
 */
export const sendSmsViaIndiaHub = async (mobile, message) => {
  const apiKey = process.env.SMS_INDIA_API_KEY;
  const senderId = process.env.SMS_SENDER_ID;
  const peId = process.env.SMS_PE_ID;
  const templateId = process.env.SMS_TEMPLATE_ID;

  if (!apiKey || !senderId || !peId || !templateId) {
    console.error('[SMS Service] Missing SMS India Hub configurations in environment variables.');
    return { success: false, error: 'Missing configurations' };
  }

  // Ensure Indian mobile number is formatted correctly (typically prefix 91)
  let cleanMobile = mobile.replace(/\D/g, '');
  if (cleanMobile.length === 10) {
    cleanMobile = `91${cleanMobile}`;
  }

  const url = `http://cloud.smsindiahub.in/vendorsms/pushsms.aspx?APIKey=${encodeURIComponent(apiKey)}&msisdn=${encodeURIComponent(cleanMobile)}&sid=${encodeURIComponent(senderId)}&msg=${encodeURIComponent(message)}&fl=0&gwid=2&entityid=${encodeURIComponent(peId)}&peid=${encodeURIComponent(peId)}&templateid=${encodeURIComponent(templateId)}&dlt_template_id=${encodeURIComponent(templateId)}&dlttemplateid=${encodeURIComponent(templateId)}`;

  return new Promise((resolve) => {
    console.log(`[SMS Service] Sending SMS to ${cleanMobile}...`);
    
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`[SMS Service] SMS India Hub response: ${data}`);
        resolve({ success: true, response: data });
      });
    }).on('error', (error) => {
      console.error(`[SMS Service] Failed to send SMS to ${cleanMobile}:`, error);
      resolve({ success: false, error: error.message });
    });
  });
};
