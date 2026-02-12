import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Upload } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { router, useLocalSearchParams } from 'expo-router';

export default function SignUpScreen3() {
  const params = useLocalSearchParams();

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [notifyOpportunities, setNotifyOpportunities] = useState(false);
  const [forgeryWarning, setForgeryWarning] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        copyToCacheDirectory: true
      });

      if (!result.canceled && result.assets[0]) {
        setUploadedFile(result.assets[0].name);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleSubmit = async () => {
    if (!agreedToTerms) {
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
            fullName: params.fullName,
            email: params.email,
            phone: params.phone,
            location: params.location,
            password: params.password,
            education: params.education,
            skills: params.skills,
            interests: params.selectedInterests
              ? JSON.parse(params.selectedInterests as string)
              : [],
            agreedToTerms,
            notifyOpportunities,
            forgeryWarning
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.message || "Signup failed");
        setLoading(false);
        return;
      }

      Alert.alert("Success", "Account created successfully");
      router.replace("/main/home");

    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
    }

    setLoading(false);
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
            <Text className="text-gray-600 text-sm font-semibold">Step 3 of 3</Text>
            <Text className="text-gray-600 text-sm font-semibold">100%</Text>
          </View>
          <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <View className="h-full bg-blue-700 rounded-full" style={{ width: '100%' }} />
          </View>
        </View>

        {/* Upload Resume */}
        <TouchableOpacity
          className="bg-red-200 rounded-2xl py-12 items-center mb-4 border-2 border-red-300"
          activeOpacity={0.8}
          onPress={pickDocument}
        >
          <Upload color="#000000" size={40} strokeWidth={2} />
          <Text className="text-black text-2xl font-bold mt-4">
            Upload Resume
          </Text>
          <Text className="text-gray-500 text-sm mt-2">
            Click to upload PDF or DOC
          </Text>

          {uploadedFile && (
            <Text className="text-blue-700 text-sm mt-2 font-semibold">
              ✓ {uploadedFile}
            </Text>
          )}
        </TouchableOpacity>

        {/* Checkboxes */}
        <TouchableOpacity
          className="flex-row items-center mb-4"
          onPress={() => setAgreedToTerms(!agreedToTerms)}
        >
          <View className={`w-6 h-6 border-2 border-gray-800 rounded mr-3 items-center justify-center ${
            agreedToTerms ? 'bg-blue-700' : 'bg-white'
          }`}>
            {agreedToTerms && (
              <Text className="text-white text-sm font-bold">✓</Text>
            )}
          </View>
          <Text className="text-black text-base flex-1">
            I agree to terms and privacy policy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center mb-4"
          onPress={() => setNotifyOpportunities(!notifyOpportunities)}
        >
          <View className={`w-6 h-6 border-2 border-gray-800 rounded mr-3 items-center justify-center ${
            notifyOpportunities ? 'bg-blue-700' : 'bg-white'
          }`}>
            {notifyOpportunities && (
              <Text className="text-white text-sm font-bold">✓</Text>
            )}
          </View>
          <Text className="text-black text-base flex-1">
            Notify me about new opportunities
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center mb-8"
          onPress={() => setForgeryWarning(!forgeryWarning)}
        >
          <View className={`w-6 h-6 border-2 border-gray-800 rounded mr-3 items-center justify-center ${
            forgeryWarning ? 'bg-blue-700' : 'bg-white'
          }`}>
            {forgeryWarning && (
              <Text className="text-white text-sm font-bold">✓</Text>
            )}
          </View>
          <Text className="text-black text-base flex-1">
            Forgery will lead to cancellation
          </Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          className="bg-blue-700 rounded-2xl py-4 items-center"
          activeOpacity={0.8}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text className="text-white text-xl font-bold">
            {loading ? "CREATING ACCOUNT..." : "START EXPLORING"}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
