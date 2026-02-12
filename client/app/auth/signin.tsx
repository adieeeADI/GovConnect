import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity
        className="flex-row items-center mb-8 border border-gray-300 rounded-xl px-4 py-3 self-start"
        activeOpacity={0.7}
        onPress={() => router.back()}
        >
          <ArrowLeft color="#000000" size={20} strokeWidth={2} />
          <Text className="text-black text-base font-semibold ml-2">Back</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text className="text-black text-3xl font-bold mb-8">
          Opportunity Finder
        </Text>

        {/* Email or Phone Number */}
        <Text className="text-black text-base font-bold mb-3">
          Email or Phone Number
        </Text>
        <TextInput
          className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base mb-6"
          placeholder="Email or Phone Number"
          placeholderTextColor="#9ca3af"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Password */}
        <Text className="text-black text-base font-bold mb-3">
          Password
        </Text>
        <TextInput
          className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base mb-3"
          placeholder="Password"
          placeholderTextColor="#9ca3af"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Forget Password */}
        <TouchableOpacity activeOpacity={0.7} className="mb-8">
          <Text className="text-blue-600 text-base font-semibold">
            Forget Password?
          </Text>
        </TouchableOpacity>

        {/* Sign In Button */}
        <TouchableOpacity 
          className="bg-blue-700 rounded-2xl py-4 items-center mb-6"
          activeOpacity={0.8}
          onPress={() => router.push("/main/home")}
        >
          <Text className="text-white text-xl font-bold">
            Sign In
          </Text>
        </TouchableOpacity>

        {/* OR Divider */}
        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="text-black text-lg font-bold mx-4">OR</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        {/* Continue With OTP */}
        <TouchableOpacity 
          className="border-2 border-gray-800 rounded-2xl py-4 items-center mb-6"
          activeOpacity={0.8}
          onPress={() => router.push("/auth/phone")}
        >
          <Text className="text-black text-lg font-semibold">
            Continue With OTP
          </Text>
        </TouchableOpacity>

        {/* Terms of Service */}
        <Text className="text-black text-sm text-center leading-5">
          By continuing, you agree to our{' '}
          <Text className="font-bold">Terms of Service</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}