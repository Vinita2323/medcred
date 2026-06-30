import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging, vapidKey } from '../configs/firebase.config';
import api from '../services/api';

const usePushNotifications = () => {
  useEffect(() => {
    const requestPermissionAndGetToken = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const token = await getToken(messaging, { vapidKey });
          if (token) {
            console.log('FCM Token:', token);
            // Check if user is authenticated (e.g., token exists in localStorage)
            // api.js handles adding the bearer token automatically
            const hasAuthToken = localStorage.getItem('access_token');
            if (hasAuthToken) {
              await api.post('/api/v1/notifications/fcm-token', { token: token, platform: 'web' });
            }
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        } else {
          console.log('Notification permission denied.');
        }
      } catch (error) {
        console.error('An error occurred while retrieving token. ', error);
      }
    };

    requestPermissionAndGetToken();

    // Handle foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received in foreground: ', payload);
      // You can use a toast library like react-hot-toast here to show the notification
      // Or use standard Notification API if the tab is focused but we still want a system notification
      if (Notification.permission === 'granted') {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: '/vite.svg'
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);
};

export default usePushNotifications;
