import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { router } from 'expo-router';

export default function SignUpScreen1() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateAndProceed = () => {
    // Basic validation
    // if (!fullName || !email || !phone || !location || !password || !confirmPassword) {
    //   alert('Please fill in all fields');
    //   return;
    // }

    // if (password.length < 8) {
    //   alert('Password must be at least 8 characters long');
    //   return;
    // }

    // if (password !== confirmPassword) {
    //   alert('Passwords do not match');
    //   return;
    // }

    // Proceed to next screen
    router.push("/auth/signupscreen2");
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity 
            className="border border-gray-300 rounded-xl px-4 py-3"
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <View className="flex-row items-center">
              <ArrowLeft color="#000000" size={20} strokeWidth={2} />
              <Text className="text-black text-base font-semibold ml-2">Back</Text>
            </View>
          </TouchableOpacity>

          <Text className="text-black text-2xl font-bold">
            Complete Your Profile
          </Text>
        </View>

        {/* Progress Bar */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-600 text-sm font-semibold">Step 1 of 3</Text>
            <Text className="text-gray-600 text-sm font-semibold">33%</Text>
          </View>
          <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <View className="h-full bg-blue-700 rounded-full" style={{ width: '33%' }} />
          </View>
        </View>

        {/* Section Title */}
        <Text className="text-black text-xl font-bold mb-6">
          Personal Information
        </Text>

        {/* Full Name */}
        <Text className="text-black text-base font-bold mb-3">
          Full Name
        </Text>
        <TextInput
          className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base mb-6"
          placeholder="Enter your full name"
          placeholderTextColor="#9ca3af"
          value={fullName}
          onChangeText={setFullName}
        />

        {/* Email Address */}
        <Text className="text-black text-base font-bold mb-3">
          Email Address
        </Text>
        <TextInput
          className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base mb-6"
          placeholder="Enter your email"
          placeholderTextColor="#9ca3af"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Phone Number */}
        <Text className="text-black text-base font-bold mb-3">
          Phone Number
        </Text>
        <TextInput
          className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base mb-6"
          placeholder="Enter your phone number"
          placeholderTextColor="#9ca3af"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        {/* Current Location */}
        <Text className="text-black text-base font-bold mb-3">
          Current Location
        </Text>
        <TextInput
          className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base mb-6"
          placeholder="Enter your location"
          placeholderTextColor="#9ca3af"
          value={location}
          onChangeText={setLocation}
        />

        {/* Password */}
        <Text className="text-black text-base font-bold mb-3">
          Password
        </Text>
        <View className="relative mb-6">
          <TextInput
            className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base pr-12"
            placeholder="Create a password (min 8 characters)"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            className="absolute right-4 top-4"
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
          >
            {showPassword ? (
              <EyeOff color="#6b7280" size={24} strokeWidth={2} />
            ) : (
              <Eye color="#6b7280" size={24} strokeWidth={2} />
            )}
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}
        <Text className="text-black text-base font-bold mb-3">
          Confirm Password
        </Text>
        <View className="relative mb-8">
          <TextInput
            className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base pr-12"
            placeholder="Re-enter your password"
            placeholderTextColor="#9ca3af"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            className="absolute right-4 top-4"
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            activeOpacity={0.7}
          >
            {showConfirmPassword ? (
              <EyeOff color="#6b7280" size={24} strokeWidth={2} />
            ) : (
              <Eye color="#6b7280" size={24} strokeWidth={2} />
            )}
          </TouchableOpacity>
        </View>

        {/* Password Requirements */}
        <View className="bg-blue-50 rounded-2xl p-4 mb-6">
          <Text className="text-blue-900 text-sm font-semibold mb-2">Password Requirements:</Text>
          <Text className="text-blue-700 text-xs leading-5">
            • At least 8 characters long{'\n'}
            • Include uppercase and lowercase letters{'\n'}
            • Include at least one number{'\n'}
            • Include at least one special character
          </Text>
        </View>

        {/* Next Button */}
        <TouchableOpacity 
          className="bg-blue-700 rounded-2xl py-4 items-center"
          activeOpacity={0.8}
          onPress={validateAndProceed}
        >
          <Text className="text-white text-xl font-bold">
            NEXT
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}