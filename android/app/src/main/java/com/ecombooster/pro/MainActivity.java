package com.ecombooster.pro;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;

import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;
import com.google.firebase.messaging.FirebaseMessaging;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        createNotificationChannels();

        // Demander permission notifications (Android 13+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 101);
            }
        }

        // Récupérer le token FCM et l'envoyer au serveur
        FirebaseMessaging.getInstance().getToken().addOnCompleteListener(task -> {
            if (!task.isSuccessful()) {
                Log.w("MainActivity", "Fetching FCM registration token failed", task.getException());
                return;
            }
            String token = task.getResult();
            sendFcmTokenToServer(token);
        });

        // Gérer le clic sur notification au démarrage
        handleIntentUrl(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        // Gérer le clic sur notification si l'app est déjà en arrière-plan
        handleIntentUrl(intent);
    }

    private void handleIntentUrl(Intent intent) {
        if (intent != null && intent.hasExtra("url")) {
            String url = intent.getStringExtra("url");
            if (url != null) {
                // Rediriger la WebView de Capacitor
                if (this.bridge != null && this.bridge.getWebView() != null) {
                    this.bridge.getWebView().post(() -> {
                        this.bridge.getWebView().evaluateJavascript("window.location.href = '" + url + "';", null);
                    });
                }
            }
        }
    }

    private void sendFcmTokenToServer(String token) {
        new Thread(() -> {
            try {
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
                int responseCode = conn.getResponseCode();
                conn.disconnect();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();
    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager == null) return;

            // Canal pour les nouvelles commandes — importance MAX pour sonner même en Doze
            NotificationChannel ordersChannel = new NotificationChannel(
                "ecom_orders",
                "Nouvelles Commandes",
                NotificationManager.IMPORTANCE_HIGH
            );
            ordersChannel.setDescription("Notifications pour les nouvelles commandes Shopify");
            ordersChannel.enableVibration(true);
            ordersChannel.enableLights(true);
            ordersChannel.setLightColor(android.graphics.Color.BLUE);
            ordersChannel.setShowBadge(true);
            manager.createNotificationChannel(ordersChannel);

            // Canal pour celui défini dans MyFirebaseMessagingService
            NotificationChannel customChannel = new NotificationChannel(
                "ecom_booster_orders",
                "Commandes ECOM BOOSTER",
                NotificationManager.IMPORTANCE_HIGH
            );
            customChannel.setDescription("Notifications nouvelles commandes");
            customChannel.enableVibration(true);
            customChannel.enableLights(true);
            manager.createNotificationChannel(customChannel);
        }
    }
}
