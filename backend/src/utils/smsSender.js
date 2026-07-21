import https from 'https';
import http from 'http';

/**
 * Utility to send SMS via SMS India Hub API using native Node https/http module.
 * Guarantees compatibility with all Node.js versions.
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

  const queryParams = `APIKey=${encodeURIComponent(apiKey)}&msisdn=${encodeURIComponent(cleanMobile)}&sid=${encodeURIComponent(senderId)}&msg=${encodeURIComponent(message)}&fl=0&gwid=2&entityid=${encodeURIComponent(peId)}&peid=${encodeURIComponent(peId)}&PE_ID=${encodeURIComponent(peId)}&templateid=${encodeURIComponent(templateId)}&dlt_template_id=${encodeURIComponent(templateId)}&dlttemplateid=${encodeURIComponent(templateId)}&DLT_TE_ID=${encodeURIComponent(templateId)}`;
  const httpsUrl = `https://cloud.smsindiahub.in/vendorsms/pushsms.aspx?${queryParams}`;
  const httpUrl = `http://cloud.smsindiahub.in/vendorsms/pushsms.aspx?${queryParams}`;

  return new Promise((resolve) => {
    console.log(`[SMS Service] Sending SMS to ${cleanMobile}...`);
    
    https.get(httpsUrl, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`[SMS Service] SMS India Hub response: ${data}`);
        resolve({ success: true, response: data });
      });
    }).on('error', (error) => {
      console.warn(`[SMS Service] HTTPS failed, falling back to HTTP: ${error.message}`);
      http.get(httpUrl, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          console.log(`[SMS Service] SMS India Hub HTTP response: ${data}`);
          resolve({ success: true, response: data });
        });
      }).on('error', (httpError) => {
        console.error(`[SMS Service] Failed to send SMS to ${cleanMobile}:`, httpError);
        resolve({ success: false, error: httpError.message });
      });
    });
  });
};
