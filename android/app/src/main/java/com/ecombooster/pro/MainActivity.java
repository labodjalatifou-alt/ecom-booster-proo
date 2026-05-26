package com.ecombooster.pro;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        createNotificationChannels();
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

            // Canal général pour le reste
            NotificationChannel defaultChannel = new NotificationChannel(
                "default",
                "Notifications générales",
                NotificationManager.IMPORTANCE_DEFAULT
            );
            manager.createNotificationChannel(defaultChannel);
        }
    }
}
