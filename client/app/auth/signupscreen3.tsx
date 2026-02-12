import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Upload } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';

export default function SignUpScreen3() {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [notifyOpportunities, setNotifyOpportunities] = useState(false);
  const [forgeryWarning, setForgeryWarning] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadedFile(result.assets[0].name);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
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

        {/* Section Title */}
        <Text className="text-black text-xl font-bold mb-6">
          Upload Documents
        </Text>

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

        {/* Info Box */}
        <View className="bg-blue-100 rounded-2xl p-4 mb-6">
          <Text className="text-blue-600 text-sm leading-5">
            Your information helps us find opportunities perfectly matched to your profile.
          </Text>
        </View>

        {/* Checkboxes */}
        <TouchableOpacity
          className="flex-row items-center mb-4"
          onPress={() => setAgreedToTerms(!agreedToTerms)}
          activeOpacity={0.7}
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
          activeOpacity={0.7}
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
          activeOpacity={0.7}
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

        {/* Start Exploring Button */}
        <TouchableOpacity 
        className="bg-blue-700 rounded-2xl py-4 items-center"
        activeOpacity={0.8}
        onPress={() => router.push("/main/home")}
        >
        <Text className="text-white text-xl font-bold">
            START EXPLORING
        </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}