import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
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
    if (!fullName || !email || !phone || !location || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    router.push({
      pathname: "/auth/signupscreen2",
      params: {
        fullName,
        email,
        phone,
        location,
        password
      }
    });
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

        {/* Full Name */}
        <Text className="text-black text-base font-bold mb-3">
          Full Name
        </Text>
        <TextInput
          className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base mb-6"
          placeholder="Enter your full name"
          value={fullName}
          onChangeText={setFullName}
        />

        {/* Email */}
        <Text className="text-black text-base font-bold mb-3">
          Email Address
        </Text>
        <TextInput
          className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base mb-6"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Phone */}
        <Text className="text-black text-base font-bold mb-3">
          Phone Number
        </Text>
        <TextInput
          className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base mb-6"
          placeholder="Enter your phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        {/* Location */}
        <Text className="text-black text-base font-bold mb-3">
          Current Location
        </Text>
        <TextInput
          className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base mb-6"
          placeholder="Enter your location"
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
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            className="absolute right-4 top-4"
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff color="#6b7280" size={24} />
            ) : (
              <Eye color="#6b7280" size={24} />
            )}
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}
        <Text className="text-black text-base font-bold mb-3">
          Confirm Password
        </Text>
        <TextInput
          className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base mb-8"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
        />

        {/* Next Button */}
        <TouchableOpacity
          className="bg-blue-700 rounded-2xl py-4 items-center"
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
