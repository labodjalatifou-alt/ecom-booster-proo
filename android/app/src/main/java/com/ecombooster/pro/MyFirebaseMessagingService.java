package com.ecombooster.pro;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class MyFirebaseMessagingService extends FirebaseMessagingService {

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        
        String title = "Nouvelle commande";
        String body = "Vous avez une nouvelle commande";
        String url = "/commandes";

        // Récupération sécurisée du titre
        if (remoteMessage.getNotification() != null && remoteMessage.getNotification().getTitle() != null) {
            title = remoteMessage.getNotification().getTitle();
        } else if (remoteMessage.getData().containsKey("title")) {
            title = remoteMessage.getData().get("title");
        }

        // Récupération sécurisée du corps (body)
        if (remoteMessage.getNotification() != null && remoteMessage.getNotification().getBody() != null) {
            body = remoteMessage.getNotification().getBody();
        } else if (remoteMessage.getData().containsKey("body")) {
            body = remoteMessage.getData().get("body");
        }

        // Récupération sécurisée de l'URL
        if (remoteMessage.getData().containsKey("url")) {
            url = remoteMessage.getData().get("url");
        }
        
        sendNotification(title, body, url);
    }

    @Override
    public void onNewToken(String token) {
        super.onNewToken(token);
        // Important : envoyer le nouveau token FCM au serveur Next.js
        sendTokenToServer(token);
    }

    private void sendTokenToServer(String token) {
        new Thread(() -> {
            try {
                // Adapter selon l'URL en production
                URL url = new URL("https://ecom-booster-proo.vercel.app/api/push/register-token"); 
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);
                
                String body = "{\"token\":\"" + token + "\",\"platform\":\"android\"}";
                try (OutputStream os = conn.getOutputStream()) {
                    byte[] input = body.getBytes("utf-8");
                    os.write(input, 0, input.length);
                }
                int responseCode = conn.getResponseCode(); // déclenche l'envoi
                conn.disconnect();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();
    }

    private void sendNotification(String title, String body, String urlStr) {
        String channelId = "ecom_booster_orders";
        
        // Intent qui ouvre l'app sur la bonne page (MainActivity captera l'URL)
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        intent.putExtra("url", urlStr);
        
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_ONE_SHOT | PendingIntent.FLAG_IMMUTABLE
        );
        
        Uri defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
        
        NotificationCompat.Builder notificationBuilder = new NotificationCompat.Builder(this, channelId)
            // L'icône est celle définie dans res/drawable/ic_stat_name.xml
            .setSmallIcon(R.drawable.ic_stat_name) 
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setSound(defaultSoundUri)
            .setVibrate(new long[]{0, 250, 250, 250})
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent);
        
        NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        
        // Créer le canal (obligatoire Android 8+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                channelId,
                "Commandes ECOM BOOSTER",
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Notifications nouvelles commandes");
            channel.enableVibration(true);
            channel.enableLights(true);
            notificationManager.createNotificationChannel(channel);
        }
        
        notificationManager.notify((int) System.currentTimeMillis(), notificationBuilder.build());
    }
}
