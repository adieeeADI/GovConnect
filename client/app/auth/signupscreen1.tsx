import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomStatusBar from '../components/CustomStatusBar';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { router } from 'expo-router';

export default function SignUpScreen1() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔥 REF to avoid stale state issue
  const agreedRef = useRef(false);

  const validateAndSubmit = async () => {
    if (loading) return;

    if (!fullName || !email || !password || !confirmPassword) {
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

    // ✅ Use ref instead of state (fix)
    if (!agreedRef.current) {
      Alert.alert("Error", "You must agree to terms and privacy policy.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://govconnect-ad4s.onrender.com/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            fullName,
            email,
            password,
            profileComplete: false
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.message || "Signup failed");
        setLoading(false);
        return;
      }

      Alert.alert(
        "Success",
        "Account created! Complete your profile for better recommendations.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/main/home")
          }
        ]
      );

    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <CustomStatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <TouchableOpacity
            className="border border-gray-300 rounded-xl px-4 py-3 mr-4"
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <ArrowLeft color="#000000" size={20} strokeWidth={2} />
          </TouchableOpacity>

          <Text className="text-black text-2xl font-bold">
            Create Account
          </Text>
        </View>

        <Text className="text-gray-600 text-base mb-8">
          Sign up to discover government opportunities tailored for you
        </Text>

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

        {/* Password */}
        <Text className="text-black text-base font-bold mb-3">
          Password
        </Text>
        <View className="relative mb-6">
          <TextInput
            className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base pr-12"
            placeholder="Create a password (min 8 characters)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            className="absolute right-4 top-4"
            onPress={() => setShowPassword(prev => !prev)}
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
        <View className="relative mb-6">
          <TextInput
            className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base pr-12"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            className="absolute right-4 top-4"
            onPress={() => setShowConfirmPassword(prev => !prev)}
          >
            {showConfirmPassword ? (
              <EyeOff color="#6b7280" size={24} />
            ) : (
              <Eye color="#6b7280" size={24} />
            )}
          </TouchableOpacity>
        </View>

        {/* Terms Checkbox */}
        <TouchableOpacity
          className="flex-row items-start mb-8"
          onPress={() => {
            setAgreedToTerms(prev => {
              const newValue = !prev;
              agreedRef.current = newValue; // 🔥 sync ref
              return newValue;
            });
          }}
        >
          <View className={`w-6 h-6 border-2 border-gray-800 rounded mr-3 items-center justify-center ${
            agreedToTerms ? 'bg-blue-700' : 'bg-white'
          }`}>
            {agreedToTerms && (
              <Text className="text-white text-sm font-bold">✓</Text>
            )}
          </View>
          <Text className="text-black text-sm flex-1">
            I agree to the{' '}
            <Text className="text-blue-700 font-semibold">Terms & Conditions</Text>
            {' '}and{' '}
            <Text className="text-blue-700 font-semibold">Privacy Policy</Text>
          </Text>
        </TouchableOpacity>

        {/* Create Account Button */}
        <TouchableOpacity
          className={`rounded-2xl py-4 items-center mb-4 ${
            loading ? 'bg-gray-400' : 'bg-blue-700'
          }`}
          onPress={validateAndSubmit}
          activeOpacity={loading ? 1 : 0.7}
          disabled={loading}
        >
          <Text className="text-white text-xl font-bold">
            {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
          </Text>
        </TouchableOpacity>

        {/* Sign In Link */}
        <View className="flex-row justify-center items-center">
          <Text className="text-gray-600 text-sm">
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/auth/signin')}>
            <Text className="text-blue-700 text-sm font-bold">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}