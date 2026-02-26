# Key Features & Code Snippets

This document outlines the core technical implementations of the Task Tracker Expo app, detailing how authentication, CRUD operations, and the custom React Native animations are built.

## 1. Authentication (Registration & Login)

Authentication is handled via Supabase's `supabase.auth` client and wrapped into clean Repositories and UseCases for our Zustand store (`useAuthStore`) to consume. 

### Implementation Snippet (`SupabaseAuthRepository.ts`):

The `SupabaseAuthRepository` abstracts the raw database calls to sign a user up with an email and password or authenticate an existing session.

```typescript
import { supabase } from '../../core/supabase';

// ... Inside SupabaseAuthRepository class:

async login(email: string, pass: string): Promise<Result<Session>> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });
  
  if (error) return { success: false, error };
  if (!data.session) return { success: false, error: new Error("No session returned") };

  return { success: true, data: data.session };
}

async register(email: string, pass: string): Promise<Result<Session>> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
  });

  if (error) return { success: false, error };
  if (!data.session) {
      if (data.user && !data.session) {
          return { success: false, error: new Error("Please check your email for confirmation link") };
      }
      return { success: false, error: new Error("No session created") };
  }

  return { success: true, data: data.session };
}
```

## 2. Task CRUD Operations

We use `Zustand` to manage the local state of arrays so the UI is immediately responsive, while asynchronous "UseCase" files handle syncing Data to Supabase. This creates a smooth offline-like experience with eventual consistency.

### Implementation Snippet (`useTaskStore.ts`):

```typescript
// ... Inside useTaskStore:
addTask: async (userId, title, description, categoryId, deadline) => {
  set({ isLoading: true, error: null });
  // Call the core service to insert the row into Supabase
  const result = await createTaskUseCase.execute(userId, title, description, categoryId, deadline);
  
  if (result.success) {
    // Optimistically update the local array so the UI renders it instantly
    set((state) => ({ tasks: [result.data, ...state.tasks], isLoading: false }));
  } else {
    set({ error: 'Failed to create task', isLoading: false });
  }
},

deleteTask: async (taskId, userId) => {
  set({ isLoading: true, error: null });
  const result = await deleteTaskUseCase.execute(taskId, userId);
  if (result.success) {
    // Filter it out of the UI state instantly
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
      isLoading: false,
    }));
  }
}
```

## 3. Calendar Interface & Logic

The `CalendarScreen` generates a dynamic, visual month-grid entirely through native components without relying on heavy third-party calendar mapping libraries. It identifies the first day of the month, injects empty container slots to align the weeks properly, and highlights selected dates and today's current date. 

### Implementation Snippet (`CalendarScreen.tsx`):

First, the `renderCalendar` function maps the UI logic based on standard Javascript `Date()` objects. Then, the active `selectedDate` state is used to filter Zustand's global task array efficiently to populate the list beneath the grid.

```tsx
// Inside CalendarScreen.tsx

const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Map necessary empty slots to align the first weekday
    for (let i = 0; i < firstDay; i++) {
        days.push(<View key={`empty-${i}`} className="w-[14.28%] h-10" />);
    }

    // Map exact days out
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
        const isSelected = isSameDate(date, selectedDate);
        const isToday = isSameDate(date, new Date());

        days.push(
            <TouchableOpacity 
                key={`day-${i}`} 
                className="w-[14.28%] h-10 items-center justify-center"
                onPress={() => setSelectedDate(date)}
            >
                <View className={clsx(
                    "w-8 h-8 items-center justify-center rounded-full",
                    isSelected ? "bg-[#d98f7a]" : isToday ? "bg-[#f9e8e2]" : "bg-transparent"
                )}>
                    <Text className={clsx("font-medium text-xs", isSelected ? "text-white" : isToday ? "text-[#d98f7a]" : "text-gray-900")}>
                        {i}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }
    return <View className="flex-row flex-wrap">{days}</View>;
};

// Filter tasks below the calendar grid dynamically when the user presses a date:
const doneTasks = tasks?.filter(t => t.completed && t.deadline && isSameDate(new Date(t.deadline), selectedDate));
const dueTasks = tasks?.filter(t => !t.completed && t.deadline && isSameDate(new Date(t.deadline), selectedDate));
```

## 4. Profile & User Information Management

The application keeps the user's base identity (`supabase.auth`) separate from their public/metadata application profile (`public.profiles`). The `ProfileScreen` manages these parallel states via `useAuthStore` and `useProfileStore`.

### Implementation Snippet (`ProfileScreen.tsx`):

First, a `useEffect` listens for an active auth `user`. Once verified, it calls the `fetchProfile` method in the Zustand store to fetch their specific display name from the public table. Updating works the exact same way through local state manipulation.

```tsx
export default function ProfileScreen() {
  const { user, login, register, logout, isLoading: authLoading, error: authError } = useAuthStore();
  const { profile, fetchProfile, updateProfile } = useProfileStore();

  const [fullName, setFullName] = useState('');
  
  // React to successful login by immediately fetching the specific profile data mapping to the ID
  useEffect(() => {
    if (user) fetchProfile(user.id);
  }, [user]);

  // Sync internal UI state with global Zustand Profile object
  useEffect(() => {
    if (profile) setFullName(profile.full_name || '');
  }, [profile]);

  // Handle saving the input back to Supabase
  const handleUpdateProfile = async () => {
    if (user) {
      await updateProfile(user.id, { full_name: fullName });
      Alert.alert('Success', 'Profile updated');
    }
  };

  // ... (UI renders different layouts depending on if 'user' is null or active)
}
```

## 5. Daily Quotes via Embedded WebView

To provide users with supplementary inspiration, the application embeds a full web experience using `react-native-webview`. This allows the app to surface dynamic content from external sources easily without manually building an HTML scraper.

### Implementation Snippet (`QuotesScreen.tsx`):

The `WebView` component takes a `source.uri` prop to load the website. We configure `startInLoadingState` to `true` and provide a custom `renderLoading` function so the user sees a smooth, native `ActivityIndicator` spinner overlaid on the screen while the external DOM downloads and renders.

```tsx
import { WebView } from 'react-native-webview';

// Inside QuotesScreen:
<SafeAreaView className="flex-1 bg-white">
  <StatusBar barStyle="dark-content" />
  <WebView 
    source={{ uri: 'https://www.insightoftheday.com' }} 
    startInLoadingState={true}
    renderLoading={() => (
        <View className="absolute inset-0 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
    )}
  />
</SafeAreaView>
```

## 6. Push Notifications & OS Integration

To deliver native user experiences, the app utilizes `expo-notifications` to construct cross-platform push notifications natively on device without remote Apple/Google payloads. It defines two distinct ways to trigger these alerts: **immediate firing** and **future scheduling**.

### Implementation Snippet (`notifications.ts` Setup logic):

The system first defines a foreground handler so alerts don't silently swallow if the app is open. Then `setup()` is called globally at the Root-level to acquire permissions and generate Android channels.

```typescript
import * as Notifications from 'expo-notifications';

// Allow heads-up notifications even when app is active
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  static async setup() {
    // Android 8.0+ explicitly requires channels
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    // Ask user for permission natively
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      await Notifications.requestPermissionsAsync();
    }
  }

  // 1st Way: Fire an alert locally after a specific delay (0 = instant)
  static async scheduleNotification(title: string, body: string, seconds = 0) {
    await Notifications.scheduleNotificationAsync({
       content: { title, body, sound: true },
       trigger: seconds > 0 ? { seconds, repeats: false } : null,
    });
  }

  // 2nd Way: Schedule an alert locally targeted at an exact `Date` object
  static async scheduleNotificationAt(title: string, body: string, date: Date) {
     if (date.getTime() <= Date.now()) return;
     await Notifications.scheduleNotificationAsync({
       content: { title, body, sound: true },
       trigger: {
           type: Notifications.SchedulableTriggerInputTypes.DATE,
           date: date,
       },
     });
  }
}
```

### Implementation Snippet (`HomeScreen.tsx` scheduling usage):

When the user creates a new task with a deadline, the app taps into the 2nd method (`scheduleNotificationAt`) and calculates exactly 1 minute before the target time to set the system alarm. 

```tsx
// Inside handleCreateOrUpdateTask() in HomeScreen:

await addTask(user.id, newTaskTitle, newTaskDesc, selectedCategoryId, deadlineISO);

if (deadline) {
  // Fire 60 seconds early
  const reminderDate = new Date(deadline.getTime() - 60 * 1000); 
  
  if (reminderDate > new Date()) {
    await NotificationService.scheduleNotificationAt(
      "Task Deadline Approaching! ⏳", 
      `"${newTaskTitle}" is due in 1 minute!`, 
      reminderDate
    );
  }
}
```

*(Note: The `scheduleNotification` immediate trigger function is documented further below in the Lion Urgent Modal section).*

## 7. High Priority Task "Wiggle" Animation

If a task falls under 30 seconds away from its hard deadline, the `<TaskItem />` component physically animates to grab the user's attention using `Animated.loop` driving a rotation `transform`.

### Implementation Snippet (`TaskItem.tsx`):

First, a `setInterval` tracks the time locally inside a `useEffect`. Once the 30-second threshold is passed, it triggers a looping sequence over an `Animated.Value`:

```tsx
const wiggleValue = useRef(new Animated.Value(0)).current;

// Trigger rotation sequence if > 0 seconds and <= 30 seconds away
Animated.loop(
  Animated.sequence([
    Animated.timing(wiggleValue, { toValue: 1, duration: 50, useNativeDriver: true }),
    Animated.timing(wiggleValue, { toValue: -1, duration: 50, useNativeDriver: true }),
    Animated.timing(wiggleValue, { toValue: 1, duration: 50, useNativeDriver: true }),
    Animated.timing(wiggleValue, { toValue: 0, duration: 50, useNativeDriver: true }),
    Animated.delay(1000)
  ])
).start();

// Interpolated mapped styles later applied to the View's style tag:
const wiggleInterpolation = wiggleValue.interpolate({
  inputRange: [-1, 1],
  outputRange: ['-3deg', '3deg'] 
});
```

## 8. Lion Urgent Notification Modal

Parallel to the wiggle animation, the `HomeScreen` manages a global interval that scans for any incoming task crashing into its deadline. When found, it throws a full-screen React Native `<Modal>` utilizing a fast `lion.gif` asset.

### Implementation Snippet (`HomeScreen.tsx`):

```tsx
useEffect(() => {
  if (lionModalVisible) return;

  const interval = setInterval(() => {
      const now = new Date();
      // Scan active store elements to see if any are about to expire
      const incomingTask = tasks.find(t => {
          if (!t.deadline || t.completed) return false;
          const due = new Date(t.deadline);
          const diffInSeconds = (due.getTime() - now.getTime()) / 1000;
          return diffInSeconds > 0 && diffInSeconds <= 30; // Find task within 30 seconds
      });

      // Show large visual alert popup and push native OS Notification
      if (incomingTask) {
          setLionTask(incomingTask);
          setLionModalVisible(true);
          NotificationService.scheduleNotification(
              "Task Deadline Approaching! 🦁",
              `"${incomingTask.title}" needs doing immediately!`
          );
      }
  }, 10000); // Poll every 10 seconds

  return () => clearInterval(interval);
}, [tasks, lionModalVisible]);
```

## 9. Deletion Explosion & Squiggly Border Animation

When the user chooses to delete a task, they don't witness a boring and abrupt removal from the list. Instead, the task transforms into a jagged dashed border that fluctuates in shape, followed by an explosion GIF fading out the entire element.

### Implementation Snippet (`HomeScreen.tsx` orchestrating the delay):

Instead of deleting the data immediately, we lock the UI state to `explodingTaskId` and wait for `1800ms` (1.8 seconds) to let the graphical animation play out on the child component before un-mounting the item entirely via `deleteTask()`:

```tsx
const executeDelete = async () => {
    if (taskToDelete && user) {
        const taskId = taskToDelete;
        setDeleteModalVisible(false);
        setTaskToDelete(null);
        setExplodingTaskId(taskId);
        
        // Let the animation visually destroy the task for 1.8 seconds before actually deleting the DB row
        setTimeout(async () => {
            setExplodingTaskId(null);
            await deleteTask(taskId, user.id);
        }, 1800);
    }
};
```

### Implementation Snippet (`TaskItem.tsx` handling the visual explosion):

When `TaskItem` receives `isDeleting = true`, it manipulates React Native Layout structures:

```tsx
useEffect(() => {
  if (isDeleting) { 
    // Squiggly border animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(squigglyValue, { toValue: 1, duration: 75, useNativeDriver: false }),
        Animated.timing(squigglyValue, { toValue: -1, duration: 150, useNativeDriver: false }),
        Animated.timing(squigglyValue, { toValue: 0, duration: 75, useNativeDriver: false }),
      ])
    ).start();

    // Fade out right at the end
    Animated.sequence([
      Animated.delay(1500),
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      squigglyValue.stopAnimation();
    });
  }
}, [isDeleting]);

const squigglyBorderRadius1 = squigglyValue.interpolate({
  inputRange: [-1, 0, 1],
  outputRange: [4, 16, 30] // Rapidly shifting between rigid and round corners!
});
```
