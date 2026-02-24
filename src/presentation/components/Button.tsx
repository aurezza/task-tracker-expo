import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ title, onPress, isLoading, variant = 'primary' }) => {
  let bgClass = 'bg-[#d98f7a]';
  let textClass = 'text-white';

  if (variant === 'secondary') {
    bgClass = 'bg-gray-200';
    textClass = 'text-gray-800';
  } else if (variant === 'danger') {
    bgClass = 'bg-red-500';
    textClass = 'text-white';
  }

  return (
    <TouchableOpacity 
      className={`p-4 rounded-xl items-center justify-center ${bgClass} ${isLoading ? 'opacity-70' : ''}`}
      onPress={onPress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'secondary' ? 'black' : 'white'} />
      ) : (
        <Text className={`font-bold text-lg ${textClass}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
