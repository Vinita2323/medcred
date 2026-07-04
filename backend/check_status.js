import dotenv from 'dotenv';

dotenv.config();

const checkStatus = async () => {
  const apiKey = process.env.SMS_INDIA_API_KEY;
  const messageId = '8AEXl0Q2PkOYG06GyGrQZA';
  
  const url = `http://cloud.smsindiahub.in/vendorsms/CheckDelivery.aspx?APIKey=${apiKey}&MessageID=${messageId}`;
  
  try {
    console.log(`Checking status for MessageID: ${messageId}...`);
    const res = await fetch(url);
    const text = await res.text();
    console.log(`Output: ${text}`);
    process.exit(0);
  } catch (err) {
    console.error('Error checking status:', err);
    process.exit(1);
  }
};

checkStatus();
