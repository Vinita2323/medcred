export const saveFCMToken = async (req, res) => {
  try {
    const { token, platform } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'token is required',
      });
    }

    // req.user could be a User, Agent, or Admin depending on the token
    req.user.fcmToken = token;
    // Optionally save platform if we add it to the schema in the future
    // req.user.platform = platform;
    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'FCM token saved successfully',
    });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save FCM token',
    });
  }
};

export const testPushNotification = async (req, res) => {
  try {
    const { token, title, body } = req.body;
    
    // We can import sendPushNotification here, but we will just use the controller directly
    const { sendPushNotification } = await import('../services/notification.service.js');
    
    const result = await sendPushNotification({
      token: token || req.user.fcmToken,
      title: title || 'Test Notification',
      body: body || 'This is a test notification from MedCred',
      data: { test: 'true' }
    });

    if (result.success) {
      res.status(200).json({ success: true, message: 'Notification sent successfully', response: result.response });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send notification', error: result.error });
    }
  } catch (error) {
    console.error('Error in test push:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
