import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Briefcase } from 'lucide-react-native';
import { router } from 'expo-router';

export default function Landing() {
  return (
    <SafeAreaView className="flex-1 bg-blue-900" edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Icon */}
        <View className="w-36 h-36 rounded-full bg-white/10 items-center justify-center self-center mb-8 border-2 border-white/20">
          <Briefcase color="#ffffff" size={80} strokeWidth={1.5} />
        </View>
        
        {/* Title */}
        <Text className="text-white text-4xl font-bold text-center mb-2">
          Government
        </Text>
        <Text className="text-white text-4xl font-bold text-center mb-4">
          Opportunities
        </Text>
        
        {/* Subtitle */}
        <Text className="text-white text-lg text-center mb-8 mt-4 leading-7 px-4">
          Find internships, scholarships, schemes, and training programs designed for you
        </Text>
        
        {/* Features Card */}
        <View className="bg-blue-300 rounded-2xl p-6 w-full mb-8">
          {/* Feature 1 */}
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 bg-orange-600 rounded-full items-center justify-center mr-4">
              <Text className="text-white text-xl font-bold">✓</Text>
            </View>
            <Text className="text-white text-base font-semibold flex-1 leading-6">
              AI-powered personalized recommendations
            </Text>
          </View>
          
          {/* Feature 2 */}
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 bg-orange-600 rounded-full items-center justify-center mr-4">
              <Text className="text-white text-xl font-bold">✓</Text>
            </View>
            <Text className="text-white text-base font-semibold flex-1 leading-6">
              Easy profile setup in minutes
            </Text>
          </View>
          
          {/* Feature 3 */}
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-orange-600 rounded-full items-center justify-center mr-4">
              <Text className="text-white text-xl font-bold">✓</Text>
            </View>
            <Text className="text-white text-base font-semibold flex-1 leading-6">
              Direct links to apply instantly
            </Text>
          </View>
        </View>
        
        {/* Sign Up Button */}
        <TouchableOpacity 
          className="bg-orange-600 rounded-2xl w-full py-4 mb-4 items-center shadow-lg"
          activeOpacity={0.8}
          onPress={() => router.push("/auth/signupscreen1")}
        >
          <Text className="text-white text-xl font-bold">
            Sign Up
          </Text>
        </TouchableOpacity>
        
        {/* Sign In Button */}
        <TouchableOpacity 
        className="bg-blue-300 rounded-2xl w-full py-4 items-center"
        activeOpacity={0.8}
        onPress={() => router.push("/auth/signin")}
        >
        <Text className="text-blue-900 text-xl font-semibold">
            Sign In
        </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}