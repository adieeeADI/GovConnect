import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

const LanguagePreferences = () => {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState('GB');
  const [timeFormat, setTimeFormat] = useState('12');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');

  const languages = [
    { code: 'GB', name: 'English', native: 'English' },
    { code: 'IN', name: 'Hindi', native: 'हिंदी (Hindi)' },
    { code: 'ES', name: 'Spanish', native: 'Español (Spanish)' },
    { code: 'FR', name: 'French', native: 'Français (French)' },
    { code: 'DE', name: 'German', native: 'Deutsch (German)' },
    { code: 'PT', name: 'Portuguese', native: 'Português (Portuguese)' },
    { code: 'CN', name: 'Mandarin', native: '中文 (Mandarin)' },
    { code: 'JP', name: 'Japanese', native: '日本語 (Japanese)' },
  ];

  const getLanguageName = () => {
    const lang = languages.find(l => l.code === selectedLanguage);
    return lang ? lang.name : 'English';
  };

  const formatPreviewDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');

    let timeStr = '';
    if (timeFormat === '12') {
      const displayHours = hours % 12 || 12;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      timeStr = `${displayHours}:${minutes} ${ampm}`;
    } else {
      timeStr = `${String(hours).padStart(2, '0')}:${minutes}`;
    }

    let dateStr = '';
    if (dateFormat === 'DD/MM/YYYY') {
      dateStr = `${day}/${month}/${year}`;
    } else if (dateFormat === 'MM/DD/YYYY') {
      dateStr = `${month}/${day}/${year}`;
    } else {
      dateStr = `${year}-${month}-${day}`;
    }

    return `${dateStr} ${timeStr}`;
  };

  const handleSave = () => {
    console.log('Preferences saved:', { selectedLanguage, timeFormat, dateFormat });
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-blue-900 px-6 pt-12 pb-8 rounded-b-3xl">
          <TouchableOpacity className="mb-4" onPress={() => router.back()}>
            <ArrowLeft color="#ffffff" size={24} strokeWidth={2} />
          </TouchableOpacity>
          <Text className="text-white text-3xl font-bold mb-2">Language Preferences</Text>
          <Text className="text-blue-200 text-base">Choose your preferred language and format</Text>
        </View>

        {/* Select Language */}
        <View className="px-6 py-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Select Language</Text>
          
          <View className="flex-row flex-wrap justify-between">
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                onPress={() => setSelectedLanguage(lang.code)}
                className={`w-[48%] rounded-xl p-4 mb-3 ${
                  selectedLanguage === lang.code
                    ? 'bg-blue-900 border-2 border-blue-900'
                    : 'bg-gray-50 border-2 border-gray-50'
                }`}
              >
                <Text className={`text-lg font-bold text-center mb-1 ${
                  selectedLanguage === lang.code ? 'text-white' : 'text-gray-900'
                }`}>
                  {lang.code}
                </Text>
                <Text className={`text-sm text-center ${
                  selectedLanguage === lang.code ? 'text-blue-100' : 'text-gray-600'
                }`}>
                  {lang.native}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date & Time Format */}
        <View className="px-6 py-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Date & Time Format</Text>
          
          {/* Time Format */}
          <View className="bg-gray-50 rounded-xl p-4 mb-4">
            <Text className="text-base font-semibold text-gray-900 mb-3">Time Format</Text>
            <View className="bg-white rounded-lg border border-gray-200">
              <Picker
                selectedValue={timeFormat}
                onValueChange={setTimeFormat}
                className="text-base"
              >
                <Picker.Item label="12-hour (2:30 PM)" value="12" />
                <Picker.Item label="24-hour (14:30)" value="24" />
              </Picker>
            </View>
          </View>

          {/* Date Format */}
          <View className="bg-gray-50 rounded-xl p-4 mb-4">
            <Text className="text-base font-semibold text-gray-900 mb-3">Date Format</Text>
            <View className="bg-white rounded-lg border border-gray-200">
              <Picker
                selectedValue={dateFormat}
                onValueChange={setDateFormat}
                className="text-base"
              >
                <Picker.Item label="DD/MM/YYYY (15/12/2024)" value="DD/MM/YYYY" />
                <Picker.Item label="MM/DD/YYYY (12/15/2024)" value="MM/DD/YYYY" />
                <Picker.Item label="YYYY-MM-DD (2024-12-15)" value="YYYY-MM-DD" />
              </Picker>
            </View>
          </View>

          {/* Preview */}
          <View className="bg-orange-50 border-l-4 border-orange-400 rounded-xl p-4">
            <Text className="text-base font-semibold text-gray-900 mb-2">Preview</Text>
            <Text className="text-sm text-gray-600 mb-1">
              Language: <Text className="font-semibold text-gray-900">{getLanguageName()}</Text>
            </Text>
            <Text className="text-sm text-gray-600">
              Date & Time: <Text className="font-semibold text-gray-900">{formatPreviewDate()}</Text>
            </Text>
          </View>
        </View>

        {/* Save Button */}
        <View className="px-6 pb-8">
          <TouchableOpacity
            onPress={handleSave}
            className="bg-blue-900 rounded-xl py-4 items-center"
          >
            <Text className="text-white text-base font-semibold">Save Preferences</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default LanguagePreferences;