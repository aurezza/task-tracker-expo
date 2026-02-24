import { Button } from '@/presentation/components/Button';
import { Input } from '@/presentation/components/Input';
import { ScreenContainer } from '@/presentation/components/ScreenContainer';
import { useAuthStore } from '@/presentation/store/useAuthStore';
import { Link, useRouter } from 'expo-router';
import { styled } from 'nativewind';
import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

const StyledText = styled(Text);
const StyledView = styled(View);

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    await login(email, password);
    // Navigation is handled by auth state listener in _layout usually, 
    // but explicit replace is okay too if we handle it correctly.
    // However, the best practice is to let the layout redirect if user is set.
  };

  return (
    <ScreenContainer center>
      <StyledView className="items-center mb-10">
        <StyledText className="text-4xl font-bold text-blue-600 mb-2">TaskTracker</StyledText>
        <StyledText className="text-gray-500 text-lg">Welcome back!</StyledText>
      </StyledView>

      <Input
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
      />
      <Input
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error ? <StyledText className="text-red-500 mb-4 text-center">{error}</StyledText> : null}

      <StyledView className="h-6" />
      
      <Button 
        title="Login" 
        onPress={handleLogin} 
        isLoading={isLoading} 
      />

      <StyledView className="flex-row justify-center mt-6">
        <StyledText className="text-gray-600">Don't have an account? </StyledText>
        <Link href="/register" asChild>
          <TouchableOpacity>
            <StyledText className="text-blue-600 font-bold">Sign Up</StyledText>
          </TouchableOpacity>
        </Link>
      </StyledView>
    </ScreenContainer>
  );
}
