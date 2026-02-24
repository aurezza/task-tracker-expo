import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

export class CalendarService {
  static async requestPermissions(): Promise<boolean> {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status === 'granted') {
        const reminders = await Calendar.requestRemindersPermissionsAsync();
        return reminders.status === 'granted';
    }
    return false;
  }

  static async getDefaultCalendarId(): Promise<string | null> {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const defaultCalendar =
      Platform.OS === 'ios'
        ? calendars.find((cal) => cal.source.name === 'Default') || calendars[0]
        : calendars.find((cal) => cal.accessLevel === Calendar.CalendarAccessLevel.OWNER) || calendars[0];
        
    return defaultCalendar ? defaultCalendar.id : null;
  }

  static async addEvent(title: string, startDate: Date, notes?: string): Promise<string | null> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
        console.warn('Calendar permissions not granted');
        return null;
    }

    try {
      const calendarId = await this.getDefaultCalendarId();
      if (!calendarId) {
          console.warn('No calendar found');
          return null;
      }
      
      const eventId = await Calendar.createEventAsync(calendarId, {
        title,
        startDate,
        endDate: new Date(startDate.getTime() + 60 * 60 * 1000), // Default 1 hour duration
        timeZone: 'GMT',
        notes,
      });
      
      return eventId;
    } catch (e) {
      console.error('Failed to add calendar event', e);
      return null;
    }
  }
}
