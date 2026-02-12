import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Smartphone } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function PhoneInput() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    console.log('Sending OTP to:', phoneNumber);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Success', 'OTP sent to your phone number!');
      router.push('/auth/otp');
    }, 1500);
  };

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

        {/* Icon */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center">
            <Smartphone color="#1e3a8a" size={48} strokeWidth={2} />
          </View>
        </View>

        {/* Title */}
        <Text className="text-black text-3xl font-bold text-center mb-3">
          Enter Your Phone Number
        </Text>
        <Text className="text-gray-500 text-center mb-8 px-4">
          We'll send you a verification code to confirm your identity
        </Text>

        {/* Phone Number Input */}
        <Text className="text-black text-base font-bold mb-3">
          Phone Number
        </Text>
        <View className="flex-row items-center border-2 border-gray-800 rounded-2xl px-4 mb-8">
          <Text className="text-gray-600 text-lg mr-2">+91</Text>
          <View className="w-px h-8 bg-gray-300 mr-3" />
          <TextInput
            className="flex-1 py-4 text-base"
            placeholder="Enter your phone number"
            placeholderTextColor="#9ca3af"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        {/* Info Box */}
        <View className="bg-blue-50 rounded-2xl p-4 mb-8">
          <Text className="text-blue-800 text-sm leading-5">
            <Text className="font-bold">Note: </Text>
            You'll receive a 6-digit OTP on this number. Make sure the number is active and can receive SMS.
          </Text>
        </View>

        {/* Send OTP Button */}
        <TouchableOpacity 
          className={`bg-blue-700 rounded-2xl py-4 items-center mb-6 ${
            isLoading ? 'opacity-70' : ''
          }`}
          activeOpacity={0.8}
          onPress={handleSendOTP}
          disabled={isLoading}
        >
          <Text className="text-white text-xl font-bold">
            {isLoading ? 'Sending...' : 'Send OTP'}
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