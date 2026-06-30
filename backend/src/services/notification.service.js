import admin from '../configs/firebase-admin.config.js';

/**
 * Sends a push notification to a specific FCM token.
 * 
 * @param {Object} params
 * @param {string} params.token - The FCM token of the target device.
 * @param {string} params.title - The title of the notification.
 * @param {string} params.body - The body text of the notification.
 * @param {Object} [params.data] - Additional data payload.
 * @returns {Promise<Object>}
 */
export const sendPushNotification = async ({ token, title, body, data = {} }) => {
  if (!token) {
    throw new Error('FCM token is required to send a notification');
  }

  const message = {
    notification: {
      title,
      body,
    },
    data,
    token,
  };

  try {
    const response = await admin.messaging().send(message);
    return { success: true, response };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: error.message };
  }
};
