import CONFIG from '../config';
import { getToken } from '../models/api';

/**
 * Convert a base64url string to Uint8Array (required for VAPID applicationServerKey).
 */
export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Safely get the active service worker registration without hanging.
 * Uses getRegistration() with NO argument so it works on any base path,
 * including subdirectory deployments like GitHub Pages (/web_cerita2/).
 */
async function getSWRegistration() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    // No argument = uses current page URL → works for any base path
    const registration = await navigator.serviceWorker.getRegistration();
    return registration || null;
  } catch {
    return null;
  }
}

/**
 * Check if push notifications are currently subscribed.
 */
export async function isPushSubscribed() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
  try {
    const registration = await getSWRegistration();
    if (!registration) return false;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch {
    return false;
  }
}

/**
 * Subscribe to push notifications and register with Dicoding API.
 */
export async function subscribePushNotification() {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push notification tidak didukung di browser ini');
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Izin notifikasi ditolak');
    }

    // Get active SW registration safely
    const registration = await getSWRegistration();
    if (!registration) {
      throw new Error('Service Worker belum aktif. Coba refresh halaman terlebih dahulu.');
    }

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY),
      });
    }

    // Send subscription to Dicoding server
    const token = getToken();
    if (!token) throw new Error('Anda harus login terlebih dahulu');

    const subscriptionJson = subscription.toJSON();
    const response = await fetch(CONFIG.PUSH_SUBSCRIBE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        endpoint: subscriptionJson.endpoint,
        keys: {
          p256dh: subscriptionJson.keys.p256dh,
          auth: subscriptionJson.keys.auth,
        },
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Gagal mendaftarkan push notification');
    }

    localStorage.setItem('push-subscribed', 'true');
    return true;
  } catch (error) {
    console.error('Error subscribing to push:', error);
    throw error;
  }
}

/**
 * Unsubscribe from push notifications and deregister from Dicoding API.
 */
export async function unsubscribePushNotification() {
  try {
    const registration = await getSWRegistration();
    if (!registration) {
      localStorage.removeItem('push-subscribed');
      return true;
    }

    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      localStorage.removeItem('push-subscribed');
      return true;
    }

    const token = getToken();
    const subscriptionJson = subscription.toJSON();

    // Unsubscribe from browser
    await subscription.unsubscribe();

    // Notify server (best effort)
    if (token) {
      try {
        await fetch(CONFIG.PUSH_SUBSCRIBE_URL, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ endpoint: subscriptionJson.endpoint }),
        });
      } catch {
        // Server deregistration is best-effort; browser unsubscribe already done
      }
    }

    localStorage.removeItem('push-subscribed');
    return true;
  } catch (error) {
    console.error('Error unsubscribing:', error);
    throw error;
  }
}
