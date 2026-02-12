import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, X, FileText } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';

export default function EditProfile() {
  const router = useRouter();

  // Personal Information
  const [fullName, setFullName] = useState('Rajesh Kumar');
  const [email, setEmail] = useState('rajesh.kumar@email.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [location, setLocation] = useState('Mumbai, Maharashtra');
  const [education, setEducation] = useState('Bachelor\'s in Computer Science');

  // Skills
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState(['Python', 'Data Analysis', 'Machine Learning', 'Communication']);

  // Interests
  const [interestInput, setInterestInput] = useState('');
  const [interests, setInterests] = useState(['Technology', 'AI/ML', 'Finance']);

  // Resume
  const [resumeFile, setResumeFile] = useState<any>({
    name: 'resume_rajesh_kumar.pdf',
    size: '2.3 MB',
  });

  const addSkill = () => {
    if (skillInput.trim()) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addInterest = () => {
    if (interestInput.trim()) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const removeInterest = (index: number) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  const pickResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setResumeFile({
          name: result.assets[0].name,
          size: `${(result.assets[0].size! / (1024 * 1024)).toFixed(1)} MB`,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleSave = () => {
    Alert.alert('Success', 'Profile updated successfully!');
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View className="bg-blue-900 rounded-b-3xl px-6 py-6 mb-6">
        <TouchableOpacity 
          className="mb-4"
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft color="#ffffff" size={24} strokeWidth={2} />
        </TouchableOpacity>

        <Text className="text-white text-3xl font-bold mb-2">
          Edit Profile
        </Text>
        <Text className="text-white text-base opacity-90">
          Update your personal information
        </Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
      >
        {/* Personal Information */}
        <Text className="text-black text-xl font-bold mb-4">
          Personal Information
        </Text>

        <Text className="text-black text-sm font-semibold mb-2">Full Name</Text>
        <TextInput
          className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base mb-4"
          value={fullName}
          onChangeText={setFullName}
        />

        <Text className="text-black text-sm font-semibold mb-2">Email</Text>
        <TextInput
          className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base mb-4"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text className="text-black text-sm font-semibold mb-2">Phone</Text>
        <TextInput
          className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base mb-4"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text className="text-black text-sm font-semibold mb-2">Location</Text>
        <TextInput
          className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base mb-4"
          value={location}
          onChangeText={setLocation}
        />

        <Text className="text-black text-sm font-semibold mb-2">Education</Text>
        <TextInput
          className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base mb-6"
          value={education}
          onChangeText={setEducation}
        />

        {/* Skills */}
        <Text className="text-black text-xl font-bold mb-4">
          Skills
        </Text>

        <View className="flex-row mb-4">
          <TextInput
            className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-base mr-2"
            placeholder="Add a skill"
            placeholderTextColor="#9ca3af"
            value={skillInput}
            onChangeText={setSkillInput}
          />
          <TouchableOpacity
            className="bg-blue-900 rounded-xl px-6 py-3 justify-center"
            onPress={addSkill}
            activeOpacity={0.8}
          >
            <Text className="text-white text-base font-bold">Add</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row flex-wrap mb-6">
          {skills.map((skill, index) => (
            <View
              key={index}
              className="bg-blue-100 rounded-full px-4 py-2 flex-row items-center mr-2 mb-2"
            >
              <Text className="text-blue-900 text-sm font-semibold mr-2">
                {skill}
              </Text>
              <TouchableOpacity onPress={() => removeSkill(index)}>
                <X color="#1e3a8a" size={16} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Interests */}
        <Text className="text-black text-xl font-bold mb-4">
          Interests
        </Text>

        <View className="flex-row mb-4">
          <TextInput
            className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-base mr-2"
            placeholder="Add an interest"
            placeholderTextColor="#9ca3af"
            value={interestInput}
            onChangeText={setInterestInput}
          />
          <TouchableOpacity
            className="bg-red-600 rounded-xl px-6 py-3 justify-center"
            onPress={addInterest}
            activeOpacity={0.8}
          >
            <Text className="text-white text-base font-bold">Add</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row flex-wrap mb-6">
          {interests.map((interest, index) => (
            <View
              key={index}
              className="bg-red-100 rounded-full px-4 py-2 flex-row items-center mr-2 mb-2"
            >
              <Text className="text-red-700 text-sm font-semibold mr-2">
                {interest}
              </Text>
              <TouchableOpacity onPress={() => removeInterest(index)}>
                <X color="#b91c1c" size={16} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Resume */}
        <Text className="text-black text-xl font-bold mb-4">
          Resume
        </Text>

        <TouchableOpacity
          className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl py-8 items-center mb-4"
          onPress={pickResume}
          activeOpacity={0.8}
        >
          <FileText color="#6b7280" size={40} strokeWidth={1.5} />
          <Text className="text-black text-lg font-bold mt-3">
            Upload Resume
          </Text>
          <Text className="text-gray-500 text-sm mt-1">
            Supported formats: PDF, DOC, DOCX (Max 5MB)
          </Text>
        </TouchableOpacity>

        {resumeFile && (
          <View className="bg-gray-100 rounded-2xl p-4 flex-row items-center justify-between mb-6">
            <View className="flex-row items-center flex-1">
              <View className="bg-red-600 rounded px-2 py-1 mr-3">
                <Text className="text-white text-xs font-bold">PDF</Text>
              </View>
              <View className="flex-1">
                <Text className="text-black text-sm font-semibold">
                  {resumeFile.name}
                </Text>
                <Text className="text-gray-500 text-xs">{resumeFile.size}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setResumeFile(null)}>
              <X color="#ef4444" size={20} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons */}
        <TouchableOpacity 
          className="bg-blue-900 rounded-2xl py-4 items-center mb-3"
          activeOpacity={0.8}
          onPress={handleSave}
        >
          <Text className="text-white text-lg font-bold">
            Save Changes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-white border-2 border-gray-300 rounded-2xl py-4 items-center mb-6"
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Text className="text-gray-700 text-lg font-semibold">
            Cancel
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}