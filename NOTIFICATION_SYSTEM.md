# Enhanced Notification System

## Overview

The DoctorSpace application now features a comprehensive notification system that provides real-time updates for appointments, messages, and system events. The system is designed with accessibility in mind and includes advanced features for managing notifications effectively.

## Features

### 1. Real-time Notifications
- **Live Updates**: Notifications appear instantly when events occur
- **Sound Alerts**: Audio notifications for new messages and urgent alerts
- **Visual Indicators**: Unread count badges and priority-based styling

### 2. Appointment Notifications
- **Confirmation**: Sent when appointments are successfully booked
- **Reminders**: Automated reminders for upcoming appointments (24h, 2h, 1h before)
- **Cancellations**: Immediate notifications when appointments are cancelled
- **Rescheduling**: Notifications when appointments are rescheduled
- **Completion**: Confirmation when appointments are completed

### 3. Enhanced Notification Types
- **Appointment Notifications**: All appointment-related events
- **Message Notifications**: New messages from doctors or system
- **System Notifications**: General system updates and alerts
- **Reminder Notifications**: Automated appointment reminders

### 4. Priority System
- **High Priority**: Urgent notifications (cancellations, urgent reminders)
- **Medium Priority**: Important notifications (reminders, rescheduling)
- **Low Priority**: General notifications (confirmations, system updates)

### 5. Accessibility Features
- **ARIA Roles**: Proper semantic markup for screen readers
- **Keyboard Navigation**: Full keyboard support with arrow keys, Enter, Escape
- **Focus Management**: Automatic focus handling and visible focus indicators
- **Screen Reader Support**: Descriptive labels and announcements
- **High Contrast**: Support for dark mode and high contrast themes

## Components

### NotificationsBell Component
Located at `src/components/NotificationsBell.tsx`

**Features:**
- Dropdown notification panel
- Real-time unread count
- Individual notification actions (mark as read, delete)
- Bulk actions (mark all read, clear all)
- Priority-based visual indicators
- Keyboard navigation support

**Accessibility:**
- `aria-label` attributes for screen readers
- `aria-expanded` for dropdown state
- `role="dialog"` for the notification panel
- `role="listbox"` and `role="listitem"` for notification list
- Keyboard shortcuts (Arrow keys, Enter, Escape, Home, End)

### Enhanced Notifications Hook
Located at `src/lib/hooks/useEnhancedNotifications.ts`

**Features:**
- Real-time subscription to notification changes
- Automatic notification categorization
- Priority and type detection
- Toast notifications for new alerts
- Comprehensive notification management

## API Endpoints

### Notification Management
- `GET /api/notifications` - Fetch user notifications
- `POST /api/notifications` - Create new notification
- `PUT /api/notifications/:id` - Update notification
- `DELETE /api/notifications/:id` - Delete notification

### Scheduled Reminders
- `POST /api/notifications/reminders` - Process scheduled appointment reminders
- `GET /api/notifications/reminders` - Test reminder processing

## Database Schema

### Enhanced Notifications Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  notification_type TEXT DEFAULT 'system',
  priority TEXT DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high')),
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### Database Functions
- `get_notification_stats(user_id)` - Get notification statistics
- `mark_notifications_read_by_type(user_id, type)` - Mark notifications as read by type
- `get_upcoming_appointment_reminders()` - Get appointments needing reminders
- `cleanup_expired_notifications()` - Remove expired notifications

## Usage Examples

### Creating Notifications

```typescript
import { 
  createAppointmentNotification,
  createCancellationNotification,
  createRescheduleNotification,
  createAppointmentReminderNotification
} from '@/lib/notifications'

// Appointment confirmation
await createAppointmentNotification(
  userId,
  'Dr. Smith',
  '2024-03-25',
  '10:00:00'
)

// Cancellation notification
await createCancellationNotification(
  userId,
  'Dr. Smith',
  '2024-03-25',
  '10:00:00',
  'patient',
  'Schedule conflict'
)

// Reschedule notification
await createRescheduleNotification(
  userId,
  'Dr. Smith',
  '2024-03-25',
  '10:00:00',
  '2024-03-26',
  '14:00:00',
  'patient'
)

// Reminder notification
await createAppointmentReminderNotification(
  userId,
  'Dr. Smith',
  '2024-03-25',
  '10:00:00',
  24 // hours until appointment
)
```

### Using the Enhanced Hook

```typescript
import { useEnhancedNotifications } from '@/lib/hooks/useEnhancedNotifications'

function MyComponent() {
  const {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getNotificationsByType,
    getNotificationsByPriority
  } = useEnhancedNotifications(userId)

  // Get only appointment notifications
  const appointmentNotifications = getNotificationsByType('appointment')
  
  // Get high priority notifications
  const urgentNotifications = getNotificationsByPriority('high')

  return (
    <div>
      <p>You have {unreadCount} unread notifications</p>
      {notifications.map(notification => (
        <div key={notification.id}>
          <h3>{notification.title}</h3>
          <p>{notification.message}</p>
          <button onClick={() => markAsRead(notification.id)}>
            Mark as Read
          </button>
        </div>
      ))}
    </div>
  )
}
```

## Accessibility Guidelines

### Keyboard Navigation
- **Tab**: Navigate between interactive elements
- **Enter/Space**: Activate buttons and select notifications
- **Arrow Keys**: Navigate through notification list
- **Escape**: Close notification panel
- **Home/End**: Jump to first/last notification

### Screen Reader Support
- All interactive elements have descriptive `aria-label` attributes
- Notification content is properly announced
- Status changes are communicated (e.g., "marked as read")
- Unread count is announced when it changes

### Visual Design
- High contrast colors for better visibility
- Clear visual hierarchy with typography
- Consistent spacing and alignment
- Focus indicators for keyboard navigation
- Dark mode support

## Scheduled Tasks

### Appointment Reminders
The system automatically sends reminders for upcoming appointments:
- **24 hours before**: General reminder
- **2 hours before**: Urgent reminder
- **1 hour before**: Final reminder

### Cleanup Tasks
- Expired notifications are automatically removed
- Old notifications can be archived or deleted
- Database maintenance for optimal performance

## Configuration

### Environment Variables
```env
# Notification settings
NEXT_PUBLIC_NOTIFICATION_SOUND_ENABLED=true
NEXT_PUBLIC_NOTIFICATION_TOAST_DURATION=3000
NEXT_PUBLIC_NOTIFICATION_MAX_DISPLAY=50
```

### Customization
- Notification sounds can be customized
- Toast duration and position can be adjusted
- Priority thresholds can be modified
- Visual styling can be customized via CSS

## Testing

### Manual Testing
1. Book an appointment and verify confirmation notification
2. Cancel an appointment and check cancellation notification
3. Reschedule an appointment and verify reschedule notification
4. Test keyboard navigation in notification panel
5. Verify screen reader announcements

### Automated Testing
- Unit tests for notification functions
- Integration tests for API endpoints
- Accessibility tests for components
- E2E tests for notification workflows

## Troubleshooting

### Common Issues
1. **Notifications not appearing**: Check real-time subscription
2. **Sound not playing**: Verify audio file exists and browser permissions
3. **Keyboard navigation not working**: Check focus management
4. **Screen reader issues**: Verify ARIA attributes

### Debug Mode
Enable debug logging by setting:
```typescript
localStorage.setItem('notification-debug', 'true')
```

## Future Enhancements

### Planned Features
- Push notifications for mobile devices
- Email notifications as backup
- Notification preferences per user
- Advanced filtering and search
- Notification templates
- Multi-language support

### Performance Optimizations
- Notification batching for high-volume scenarios
- Lazy loading for large notification lists
- Caching strategies for better performance
- Database query optimization

## Support

For issues or questions about the notification system:
1. Check the troubleshooting section
2. Review the accessibility guidelines
3. Test with different assistive technologies
4. Contact the development team

---

*This documentation is maintained by the DoctorSpace development team. Last updated: March 2024* 