import { useAuthStore } from '@/presentation/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  const { session } = useAuthStore();

  // If we wanted to protect tabs specifically, we could, but root layout handles it globally.
  // However, maybe we allow access to tabs but if not logged in, Profile tab shows login screen.
  
  return (
    <Tabs 
      screenOptions={{ 
        tabBarActiveTintColor: '#d98f7a', 
        headerShown: false,
        tabBarStyle: {
            height: 70,
            paddingBottom: 8,
            paddingTop: 8,
        },
        tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 4,
            fontWeight: '500',
        },
        tabBarIconStyle: {
            marginBottom: 0,
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="list" color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="calendar-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="quotes"
        options={{
          title: 'Quotes',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="bulb-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}
