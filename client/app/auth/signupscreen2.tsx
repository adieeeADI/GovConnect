import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomStatusBar from '../components/CustomStatusBar';
import { ArrowLeft, Globe } from 'lucide-react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useTranslation } from '../../utils/i18n';
import LanguageSelectorModal from '../../components/LanguageSelectorModal';

export default function SignUpScreen2() {
  const params = useLocalSearchParams();
  const { t } = useTranslation();

  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const interests = ['Technology', 'Finance', 'Healthcare', 'Agriculture', 'Education'];

  const handleBackConfirm = () => {
    Alert.alert(
      t('leave_page'),
      'Are you sure you want to go back to the previous step?',
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('back'), style: 'destructive', onPress: () => router.back() }
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        handleBackConfirm();
        return true;
      });
      return () => backHandler.remove();
    }, [])
  );

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleNext = () => {
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
      <CustomStatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity 
            className="border border-gray-300 rounded-xl px-3 py-2"
            activeOpacity={0.7}
            onPress={handleBackConfirm}
          >
            <View className="flex-row items-center">
              <ArrowLeft color="#000000" size={18} strokeWidth={2} />
              <Text className="text-black text-sm font-semibold ml-1">{t('back')}</Text>
            </View>
          </TouchableOpacity>

          <Text className="text-black text-xl font-bold">
            {t('education_skills')}
          </Text>

          <TouchableOpacity
            className="flex-row items-center bg-gray-100 border border-gray-200 px-3 py-2 rounded-xl"
            activeOpacity={0.8}
            onPress={() => setLangModalVisible(true)}
          >
            <Globe color="#1e40af" size={18} />
          </TouchableOpacity>
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
          {t('highest_education')}
        </Text>
        <TextInput
          className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base mb-6"
          placeholder={t('highest_education')}
          placeholderTextColor="#9ca3af"
          value={education}
          onChangeText={setEducation}
        />

        {/* Skills */}
        <Text className="text-black text-base font-bold mb-3">
          {t('skills_comma')}
        </Text>
        <TextInput
          className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base mb-6"
          placeholder={t('skills_comma')}
          placeholderTextColor="#9ca3af"
          value={skills}
          onChangeText={setSkills}
          multiline
        />

        {/* Interests */}
        <Text className="text-black text-base font-bold mb-4">
          {t('areas_of_interest')}
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
            {t('next')}
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
      />
    </SafeAreaView>
  );
}
