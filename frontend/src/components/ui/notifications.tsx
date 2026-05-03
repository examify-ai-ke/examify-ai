'use client';

import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { useUIStore } from '@/stores/ui';
import { Button } from './button';

const NotificationIcon = ({ type }: { type: 'success' | 'error' | 'warning' | 'info' }) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'error':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'warning':
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case 'info':
      return <Info className="h-5 w-5 text-blue-500" />;
    default:
      return <Info className="h-5 w-5 text-blue-500" />;
  }
};

const getNotificationStyles = (type: 'success' | 'error' | 'warning' | 'info') => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-200 text-green-800';
    case 'error':
      return 'bg-red-50 border-red-200 text-red-800';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    case 'info':
      return 'bg-blue-50 border-blue-200 text-blue-800';
    default:
      return 'bg-blue-50 border-blue-200 text-blue-800';
  }
};

export function Notifications() {
  const { notifications, removeNotification } = useUIStore();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            p-4 rounded-lg border shadow-lg transition-all duration-300 ease-in-out
            ${getNotificationStyles(notification.type)}
          `}
        >
          <div className="flex items-start space-x-3">
            <NotificationIcon type={notification.type} />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium">{notification.title}</h4>
              {notification.message && (
                <p className="text-sm opacity-90 mt-1">{notification.message}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-black/10"
              onClick={() => removeNotification(notification.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
