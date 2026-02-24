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

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    await register(email, password);
  };

  return (
    <ScreenContainer center>
      <StyledView className="items-center mb-10">
        <StyledText className="text-4xl font-bold text-blue-600 mb-2">Create Account</StyledText>
        <StyledText className="text-gray-500 text-lg">Join us and get organized!</StyledText>
      </StyledView>

      <Input
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
      />
      <Input
        label="Password"
        placeholder="Choose a password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error ? <StyledText className="text-red-500 mb-4 text-center">{error}</StyledText> : null}

      <StyledView className="h-6" />
      
      <Button 
        title="Sign Up" 
        onPress={handleRegister} 
        isLoading={isLoading} 
      />

      <StyledView className="flex-row justify-center mt-6">
        <StyledText className="text-gray-600">Already have an account? </StyledText>
        <Link href="/login" asChild>
          <TouchableOpacity>
            <StyledText className="text-blue-600 font-bold">Login</StyledText>
          </TouchableOpacity>
        </Link>
      </StyledView>
    </ScreenContainer>
  );
}
