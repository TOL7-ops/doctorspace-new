# Appointment Management System

## Overview

The DoctorSpace app now includes a comprehensive appointment management system with advanced features for cancellation, rescheduling, rating, and status tracking.

## Features Implemented

### 1. Appointment Cancellation
- **Cancel Button**: Available on upcoming appointments (except cancelled ones)
- **Confirmation Modal**: Requires user confirmation before cancellation
- **Reason Capture**: Optional reason field for cancellation tracking
- **24-Hour Rule**: Appointments can only be cancelled at least 24 hours in advance
- **Notifications**: Both patient and doctor receive cancellation notifications
- **Database Tracking**: All cancellations are recorded with reasons

### 2. Appointment Rescheduling
- **Reschedule Button**: Available on upcoming appointments
- **Date/Time Selection**: Choose from available dates and time slots
- **Slot Validation**: Checks doctor availability and existing appointments
- **Reason Capture**: Optional reason for rescheduling
- **24-Hour Rule**: Appointments can only be rescheduled at least 24 hours in advance
- **Notifications**: Both patient and doctor receive reschedule notifications
- **History Tracking**: All reschedules are recorded with before/after details

### 3. Appointment Status Tracking
- **Status Badges**: Visual indicators for appointment status
  - 🟡 **Pending**: Awaiting confirmation
  - 🟢 **Confirmed**: Appointment confirmed
  - 🔴 **Cancelled**: Appointment cancelled
  - 🔵 **Completed**: Appointment completed
- **Color-Coded**: Each status has distinct colors for easy identification
- **Real-time Updates**: Status changes reflect immediately in the UI

### 4. Doctor Rating System
- **Rating Modal**: Available for completed appointments
- **Star Rating**: 1-5 star rating system with visual feedback
- **Comment System**: Optional text feedback
- **One Rating Per Appointment**: Prevents duplicate ratings
- **Update Capability**: Users can update their existing ratings

### 5. Enhanced Notifications
- **Real-time Updates**: Instant notifications for all appointment changes
- **Comprehensive Coverage**: Notifications for:
  - Appointment cancellations
  - Appointment reschedules
  - Upcoming appointment reminders
  - Status changes

## Database Schema

### New Tables

#### `appointment_ratings`
```sql
CREATE TABLE appointment_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  UNIQUE(appointment_id, patient_id)
);
```

#### `appointment_cancellations`
```sql
CREATE TABLE appointment_cancellations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  cancelled_by UUID REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  cancelled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);
```

#### `appointment_reschedules`
```sql
CREATE TABLE appointment_reschedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  rescheduled_by UUID REFERENCES users(id) ON DELETE CASCADE,
  old_date DATE NOT NULL,
  old_start_time TIME NOT NULL,
  new_date DATE NOT NULL,
  new_start_time TIME NOT NULL,
  reason TEXT,
  rescheduled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);
```

### Database Functions

#### `can_cancel_appointment(appointment_uuid UUID)`
Returns `true` if appointment can be cancelled (more than 24 hours away).

#### `can_reschedule_appointment(appointment_uuid UUID)`
Returns `true` if appointment can be rescheduled (more than 24 hours away).

## Components

### Core Components

#### `ConfirmationModal`
- Reusable confirmation dialog
- Supports reason input
- Accessible with proper ARIA roles
- Keyboard navigation support

#### `RescheduleModal`
- Date and time selection
- Real-time slot availability checking
- Doctor schedule validation
- Optional reason capture

#### `RatingModal`
- Star rating interface
- Comment system
- Form validation
- Accessible design

#### `Rating`
- Interactive star rating component
- Hover effects
- Keyboard navigation
- Screen reader support

### Enhanced Components

#### `AppointmentsClient`
- Main appointment management interface
- Tab navigation (Upcoming/Past)
- Action buttons for each appointment
- Real-time state management
- Loading states for all actions

## API Functions

### `cancelAppointment(data: CancellationData)`
- Validates user permissions
- Checks 24-hour rule
- Updates appointment status
- Records cancellation reason
- Sends notifications

### `rescheduleAppointment(data: RescheduleData)`
- Validates user permissions
- Checks 24-hour rule
- Validates slot availability
- Records reschedule history
- Sends notifications

### `submitRating(data: RatingData)`
- Validates appointment completion
- Prevents duplicate ratings
- Supports rating updates
- Stores rating and comment

### `canModifyAppointment(appointmentId: string)`
- Checks if appointment can be modified
- Validates 24-hour rule
- Returns boolean result

## Accessibility Features

### ARIA Support
- Proper ARIA labels for all interactive elements
- Screen reader announcements for status changes
- Focus management in modals
- Keyboard navigation support

### Semantic HTML
- Proper heading hierarchy
- Semantic button roles
- Form labels and descriptions
- Error message associations

### Keyboard Navigation
- Tab navigation through all interactive elements
- Enter/Space key support for buttons
- Escape key to close modals
- Arrow key navigation in rating component

## Usage Examples

### Cancelling an Appointment
```typescript
import { cancelAppointment } from '@/lib/appointment-management'

const handleCancel = async (appointmentId: string, reason: string) => {
  try {
    await cancelAppointment({ appointmentId, reason })
    toast.success('Appointment cancelled successfully')
  } catch (error) {
    toast.error(error.message)
  }
}
```

### Rescheduling an Appointment
```typescript
import { rescheduleAppointment } from '@/lib/appointment-management'

const handleReschedule = async (appointmentId: string, newDate: string, newTime: string) => {
  try {
    await rescheduleAppointment({ appointmentId, newDate, newTime })
    toast.success('Appointment rescheduled successfully')
  } catch (error) {
    toast.error(error.message)
  }
}
```

### Submitting a Rating
```typescript
import { submitRating } from '@/lib/appointment-management'

const handleRating = async (appointmentId: string, rating: number, comment?: string) => {
  try {
    await submitRating({ appointmentId, patientId, doctorId, rating, comment })
    toast.success('Rating submitted successfully')
  } catch (error) {
    toast.error(error.message)
  }
}
```

## Security Features

### Row Level Security (RLS)
- Users can only access their own appointments
- Patients can only modify their own appointments
- Doctors can view appointments assigned to them
- Proper permission checks for all operations

### Validation Rules
- 24-hour advance notice for modifications
- Slot availability validation
- Appointment status validation
- User permission validation

### Data Integrity
- Foreign key constraints
- Check constraints for ratings (1-5 stars)
- Unique constraints to prevent duplicates
- Cascade deletes for related records

## Error Handling

### User-Friendly Messages
- Clear error messages for validation failures
- Specific messages for different error types
- Toast notifications for success/failure states

### Graceful Degradation
- Fallback UI for failed operations
- Loading states during async operations
- Retry mechanisms for network failures

## Performance Optimizations

### Local State Management
- Immediate UI updates for better UX
- Optimistic updates with rollback on failure
- Efficient re-rendering with proper state management

### Database Optimization
- Indexed queries for fast lookups
- Efficient joins for related data
- Pagination support for large datasets

## Testing Considerations

### Unit Tests
- Component rendering tests
- Function logic tests
- Error handling tests

### Integration Tests
- API endpoint tests
- Database operation tests
- User flow tests

### Accessibility Tests
- Screen reader compatibility
- Keyboard navigation tests
- Color contrast validation

## Future Enhancements

### Planned Features
- Bulk appointment operations
- Advanced filtering and search
- Appointment templates
- Integration with calendar systems
- SMS/Email notifications
- Video consultation support

### Performance Improvements
- Virtual scrolling for large lists
- Caching strategies
- Background sync
- Offline support

## Migration Guide

### Database Migration
Run the migration file to create new tables:
```sql
-- Run the migration file
\i supabase/migrations/20240322000000_add_appointment_management.sql
```

### Code Updates
1. Update TypeScript types
2. Import new components
3. Add new API functions
4. Update existing appointment components

### Testing
1. Test all new features
2. Verify accessibility compliance
3. Check error handling
4. Validate security rules 