import dotenv from 'dotenv';

dotenv.config();

const checkBalance = async () => {
  const apiKey = process.env.SMS_INDIA_API_KEY;
  // Let's test checking balance with APIKey parameter
  const url1 = `http://cloud.smsindiahub.in/vendorsms/CheckBalance.aspx?APIKey=${apiKey}`;
  const url2 = `http://cloud.smsindiahub.in/vendorsms/CheckBalance.aspx?user=${apiKey}&password=${apiKey}`;

  try {
    console.log('Checking SMS India Hub balance...');
    const res1 = await fetch(url1);
    const text1 = await res1.text();
    console.log(`Balance check output (with APIKey): ${text1}`);

    const res2 = await fetch(url2);
    const text2 = await res2.text();
    console.log(`Balance check output (with user/password): ${text2}`);

    process.exit(0);
  } catch (err) {
    console.error('Error checking balance:', err);
    process.exit(1);
  }
};

checkBalance();
