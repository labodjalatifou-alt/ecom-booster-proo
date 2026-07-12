import { createAdminSupabase } from './supabase';
import webpush from 'web-push';
import admin from './firebase-admin';

const supabaseAdmin = createAdminSupabase();

const vapidEmail = process.env.VAPID_EMAIL || 'mailto:contact@votre-app.com';
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const privateKey = process.env.VAPID_PRIVATE_KEY || '';

if (publicKey && privateKey) {
  webpush.setVapidDetails(vapidEmail, publicKey, privateKey);
} else {
  console.warn('Web Push VAPID keys are missing for helper.');
}

interface PushParams {
  userId?: string | null;
  userIds?: string[];
  role?: string;
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

export async function sendPushNotification({
  userId,
  userIds,
  role,
  title,
  body,
  url,
  icon
}: PushParams) {
  try {
    let targetUserIds: string[] = [];

    if (userIds && Array.isArray(userIds)) {
      targetUserIds = userIds;
    } else if (userId) {
      targetUserIds = [userId];
    } else if (role) {
      // Fetch all users with this role from the public User table
      const { data: users, error: usersError } = await supabaseAdmin
        .from('User')
        .select('id')
        .eq('role', role);

      if (usersError) {
        console.error('Error fetching users by role in push-helper:', usersError);
        return { success: false, error: usersError };
      }

      targetUserIds = users?.map((u: any) => u.id) || [];
    }

    if (targetUserIds.length === 0) {
      return { success: true, count: 0, message: 'No target users found' };
    }

    // Retrieve subscriptions for target users
    const { data: subscriptions, error: subsError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*')
      .in('user_id', targetUserIds);

    if (subsError) {
      console.error('Error fetching subscriptions in push-helper:', subsError);
      return { success: false, error: subsError };
    }

    if (!subscriptions || subscriptions.length === 0) {
      return { success: true, count: 0, message: 'No active subscriptions found' };
    }

    const payload = JSON.stringify({
      title,
      body,
      url: url || '/commandes',
      icon: icon || '/icon-192.png'
    });

    const pushPromises = subscriptions.map((sub: any) => {
      // Check if this is a Native Push (FCM)
      if (sub.endpoint && sub.endpoint.startsWith('fcm://')) {
        const fcmToken = sub.endpoint.replace('fcm://', '');
        
        const message = {
          // The notification field causes Android to display it even when app is killed
          notification: {
            title: title,
            body: body,
          },
          // The data field passes extra info to the app when it wakes up
          data: {
            url: url || '/commandes',
            title: title,
            body: body,
            click_action: 'FLUTTER_NOTIFICATION_CLICK',
          },
          token: fcmToken,
          android: {
            priority: "high" as const,
            // Omettre 'ttl: 0' permet à Google de mettre en file d'attente les notifications (jusqu'à 4 semaines)
            // au lieu de les jeter instantanément si l'appareil est en veille profonde ou hors ligne.
            notification: {
              icon: "ic_stat_name",
              color: "#1d4ed8",
              sound: "default",
              defaultSound: true,
              defaultVibrateTimings: true,
              notificationPriority: "priority_max" as const,
              visibility: "public" as const,
              channelId: "ecom_orders", // Must match the channel created in Android app
            }
          },
          apns: {
            headers: {
              "apns-priority": "10",
            },
            payload: {
              aps: {
                alert: { title, body },
                sound: "default",
                badge: 1,
              }
            }
          }
        };

        return admin.messaging().send(message)
          .catch(async (error: any) => {
            if (error.code === 'messaging/registration-token-not-registered' || error.code === 'messaging/invalid-registration-token') {
              console.log(`Pruning expired FCM subscription for user ${sub.user_id}`);
              await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id);
            } else {
              console.error(`Error sending FCM to subscription ID ${sub.id}:`, error);
            }
          });
      }

      // Web Push
      const pushSub = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };

      return webpush.sendNotification(pushSub, payload)
        .catch(async (error: any) => {
          // If subscription is invalid (expired/gone), remove it
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`Pruning expired subscription for user ${sub.user_id}`);
            await supabaseAdmin
              .from('push_subscriptions')
              .delete()
              .eq('id', sub.id);
          } else {
            console.error(`Error sending push to subscription ID ${sub.id}:`, error);
          }
        });
    });

    await Promise.all(pushPromises);
    return { success: true, count: pushPromises.length };
  } catch (error) {
    console.error('Error inside sendPushNotification helper:', error);
    return { success: false, error };
  }
}
