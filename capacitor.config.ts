import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ecombooster.pro',
  appName: 'Ecom Booster Pro',
  webDir: 'public', // This doesn't matter much since we point to a server URL
  server: {
    url: 'https://ecom-booster-proo.vercel.app',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
