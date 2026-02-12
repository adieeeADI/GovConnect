import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';

export default function SignUpScreen2() {
  const params = useLocalSearchParams();

  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const interests = ['Technology', 'Finance', 'Healthcare', 'Agriculture', 'Education'];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleNext = () => {
    // Optional validation
    if (!education) {
      Alert.alert("Error", "Please enter your education.");
      return;
    }

    router.push({
      pathname: "/auth/signupscreen3",
      params: {
        ...params,
        education,
        skills,
        selectedInterests: JSON.stringify(selectedInterests)
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

        {/* Progress Bar */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-600 text-sm font-semibold">Step 2 of 3</Text>
            <Text className="text-gray-600 text-sm font-semibold">66%</Text>
          </View>
          <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <View className="h-full bg-blue-700 rounded-full" style={{ width: '66%' }} />
          </View>
        </View>

        {/* Education */}
        <Text className="text-black text-base font-bold mb-3">
          Highest Education
        </Text>
        <TextInput
          className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base mb-6"
          placeholder="Highest Education"
          placeholderTextColor="#9ca3af"
          value={education}
          onChangeText={setEducation}
        />

        {/* Skills */}
        <Text className="text-black text-base font-bold mb-3">
          Skills (Comma Separated)
        </Text>
        <TextInput
          className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base mb-6"
          placeholder="Skills (Comma Separated)"
          placeholderTextColor="#9ca3af"
          value={skills}
          onChangeText={setSkills}
          multiline
        />

        {/* Interests */}
        <Text className="text-black text-base font-bold mb-4">
          Areas of Interest
        </Text>

        {interests.map((interest) => (
          <TouchableOpacity
            key={interest}
            className="flex-row items-center mb-4"
            onPress={() => toggleInterest(interest)}
            activeOpacity={0.7}
          >
            <View className={`w-6 h-6 border-2 border-gray-800 rounded mr-3 items-center justify-center ${
              selectedInterests.includes(interest) ? 'bg-blue-700' : 'bg-white'
            }`}>
              {selectedInterests.includes(interest) && (
                <Text className="text-white text-sm font-bold">✓</Text>
              )}
            </View>
            <Text className="text-black text-base">{interest}</Text>
          </TouchableOpacity>
        ))}

        {/* Next Button */}
        <TouchableOpacity 
          className="bg-blue-700 rounded-2xl py-4 items-center mt-6"
          activeOpacity={0.8}
          onPress={handleNext}
        >
          <Text className="text-white text-xl font-bold">
            NEXT
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
