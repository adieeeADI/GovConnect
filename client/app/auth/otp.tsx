import { useRouter } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect, Circle, Path } from 'react-native-svg';

const OTPVerification = () => {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index, key) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      Alert.alert('Error', 'Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    console.log('Verifying OTP:', otpValue);

    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Success', 'OTP verified successfully!');
    }, 1500);
  };

  const handleResend = () => {
    console.log('Resending OTP...');
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    Alert.alert('Success', 'OTP has been resent to your phone');
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      >

        {/* Back Button - Same style as phone.tsx */}
        <TouchableOpacity 
          className="flex-row items-center mb-8 border border-gray-300 rounded-xl px-4 py-3 self-start"
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Text className="text-black text-2xl font-bold">←</Text>
          <Text className="text-black text-base font-semibold ml-2">Back</Text>
        </TouchableOpacity>

        {/* Icon */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center">
            <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <Rect x="7" y="11" width="10" height="9" rx="2" fill="#F97316" />
              <Circle cx="12" cy="15" r="1.5" fill="#FFF" />
              <Rect x="11.25" y="15" width="1.5" height="2" fill="#FFF" />
              <Path 
                d="M8 11V8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8V11" 
                stroke="#9CA3AF" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
            </Svg>
          </View>
        </View>

        {/* Title */}
        <Text className="text-3xl font-bold text-gray-900 text-center mb-3">
          Verify Your Identity
        </Text>
        <Text className="text-gray-500 text-center mb-8">
          Enter the 6-digit OTP sent to your phone
        </Text>

        {/* OTP Inputs */}
        <View className="flex-row justify-center gap-3 mb-6">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              keyboardType="numeric"
              maxLength={1}
              value={digit}
              onChangeText={(value) => handleChange(index, value)}
              onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(index, key)}
              className="w-14 h-14 text-center text-2xl font-semibold border-2 border-gray-200 rounded-lg"
              style={{ textAlign: 'center' }}
            />
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          onPress={handleVerify}
          disabled={isLoading}
          className={`bg-gray-400 rounded-lg py-4 items-center ${isLoading ? 'opacity-70' : ''}`}
        >
          <Text className="text-white text-base font-semibold">
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </Text>
        </TouchableOpacity>

        {/* Resend OTP */}
        <View className="items-center mt-6">
          <Text className="text-gray-500 text-sm mb-2">Didn't receive the code?</Text>
          <TouchableOpacity onPress={handleResend}>
            <Text className="text-blue-900 font-semibold text-base">Resend OTP</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default OTPVerification;
