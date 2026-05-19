'use client';
import { usePushNotification } from '@/hooks/usePushNotification';

export function NotificationButton() {
  const { subscribe, unsubscribe, subscribed, loading, error } = usePushNotification();

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={subscribed ? unsubscribe : subscribe}
        disabled={loading}
        className={`
          flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95
          ${subscribed
            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-100 dark:border-emerald-900/30 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
            : 'bg-primary-600 text-white hover:bg-primary-700'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {loading ? (
          <span className="animate-spin">⏳</span>
        ) : subscribed ? (
          <span>🔔 Notifications activées</span>
        ) : (
          <span>🔕 Activer les notifications</span>
        )}
      </button>
      {error && (
        <p className="text-red-500 text-xs font-semibold">{error}</p>
      )}
    </div>
  );
}
