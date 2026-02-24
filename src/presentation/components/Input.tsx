import React from 'react';
import { Text, TextInput, View } from 'react-native';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  label?: string;
}

export const Input: React.FC<InputProps> = ({ value, onChangeText, placeholder, secureTextEntry, label }) => {
  return (
    <View className="mb-4 w-full">
      {label && <Text className="mb-1 text-gray-600 font-medium ml-1">{label}</Text>}
      <TextInput
        className="w-full bg-gray-50 border border-gray-300 rounded-xl p-4 text-gray-800"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );
};
