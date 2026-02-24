import React from 'react';
import { SafeAreaView, StatusBar, View } from 'react-native';

export const ScreenContainer: React.FC<{ children: React.ReactNode; center?: boolean }> = ({ children, center }) => {
  return (
    <SafeAreaView className="flex-1 bg-[#ffcf82]">
      <StatusBar barStyle="dark-content" />
      <View className={`flex-1 px-6 ${center ? 'justify-center' : ''}`}>
        {children}
      </View>
    </SafeAreaView>
  );
};
