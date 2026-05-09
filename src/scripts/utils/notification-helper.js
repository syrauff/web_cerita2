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
 * Safely get the active service worker registration.
 *
 * Strategy:
 * 1. Try getRegistration() first (immediate, no hang, works for any base path).
 * 2. If null (SW not yet activated), wait for navigator.serviceWorker.ready
 *    with a 5-second timeout so the page never hangs indefinitely.
 */
async function getSWRegistration() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    // Check if there's already an active registration (any scope)
    const existing = await navigator.serviceWorker.getRegistration();
    if (existing) return existing;

    // SW might still be installing/activating — wait up to 5 seconds
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('SW not ready within 5s')), 5000),
      ),
    ]);
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
      throw new Error('Izin notifikasi ditolak oleh pengguna');
    }

    // Get active SW registration (waits up to 5s if still activating)
    const registration = await getSWRegistration();
    if (!registration) {
      throw new Error(
        'Service Worker belum aktif. Push notification hanya tersedia pada versi yang sudah di-deploy (HTTPS). ' +
        'Jika sudah di-deploy, coba refresh halaman dan tunggu beberapa detik.',
      );
    }

    // Get or create push subscription
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
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'Gagal mendaftarkan push notification ke server');
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

    // Unsubscribe from browser first
    await subscription.unsubscribe();

    // Notify server (best-effort — browser already unsubscribed)
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
        // ignore server error — browser already unsubscribed
      }
    }

    localStorage.removeItem('push-subscribed');
    return true;
  } catch (error) {
    console.error('Error unsubscribing:', error);
    throw error;
  }
}
