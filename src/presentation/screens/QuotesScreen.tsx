import React from 'react';
import { ActivityIndicator, SafeAreaView, StatusBar, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function QuotesScreen() {
  return (
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
  );
}
