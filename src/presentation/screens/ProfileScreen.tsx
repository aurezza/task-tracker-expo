import { Button } from '@/presentation/components/Button';
import { Input } from '@/presentation/components/Input';
import { ScreenContainer } from '@/presentation/components/ScreenContainer';
import { useAuthStore } from '@/presentation/store/useAuthStore';
import { useProfileStore } from '@/presentation/store/useProfileStore';

import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { user, login, register, logout, isLoading: authLoading, error: authError } = useAuthStore();
  const { profile, fetchProfile, updateProfile } = useProfileStore();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
    }
  }, [profile]);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (isLoginMode) {
      await login(email, password);
    } else {
      await register(email, password);
    }
  };

  const handleUpdateProfile = async () => {
    if (user) {
      await updateProfile(user.id, { full_name: fullName });
      Alert.alert('Success', 'Profile updated');
    }
  };

  if (!user) {
    return (
      <ScreenContainer center>
        <View className="items-center mb-10">
          <Text className="text-4xl font-bold text-[#d98f7a] mb-2">
            {isLoginMode ? 'Task Tracker' : 'Create Account'}
          </Text>
          <Text className="text-gray-600 text-lg">
            {isLoginMode ? 'Login to continue' : 'Create an account to get started'}
          </Text>
        </View>

        <Input label="Email" placeholder="email@example.com" value={email} onChangeText={setEmail} />
        <Input label="Password" placeholder="******" value={password} onChangeText={setPassword} secureTextEntry />

        {authError ? <Text className="text-red-500 mb-4 text-center">{authError}</Text> : null}

        <Button 
          title={isLoginMode ? "Login" : "Sign Up"} 
          onPress={handleAuth} 
          isLoading={authLoading} 
        />

        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-600">
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          </Text>
          <TouchableOpacity onPress={() => setIsLoginMode(!isLoginMode)}>
            <Text className="text-[#d98f7a] font-bold">
              {isLoginMode ? "Sign Up" : "Login"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        <View className="mt-6 mb-8 items-center">
          <View className="w-24 h-24 bg-[#f9e8e2] rounded-full items-center justify-center mb-4">
            <Text className="text-3xl text-[#d98f7a] font-bold">
              {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text className="text-xl font-bold text-gray-900">{user.email}</Text>
        </View>

        <View className="mb-8">
          <Text className="text-lg font-bold mb-4 text-gray-800">Profile Details</Text>
          <Input label="Full Name" placeholder="Your Name" value={fullName} onChangeText={setFullName} />
          <Button title="Update Profile" onPress={handleUpdateProfile} />
        </View>
      </ScrollView>

      <View className="pb-5">
        <Button title="Logout" onPress={logout} variant="secondary" />
      </View>
    </ScreenContainer>
  );
}

