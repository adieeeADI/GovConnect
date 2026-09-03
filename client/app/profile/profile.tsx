import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomStatusBar from '../components/CustomStatusBar';
import { ArrowLeft, Mail, Phone, MapPin, Edit3, Globe, User as UserIcon, Bell, ShieldCheck } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNav from '../main/bottom';
import ProfileCompleteBanner from './ProfileCompleteBanner';
import { getUserEndpoint, safeFetchJson } from '../../config/api.config';
import { useTranslation, LANGUAGES } from '../../utils/i18n';
import LanguageSelectorModal from '../../components/LanguageSelectorModal';
import { goBackWithinApp } from '../../utils/navigation';

function getCompletionPercentage(data: Record<string, any>): number {
  const checks = [
    !!data.fullName,
    !!data.email,
    !!data.phone,
    !!data.location,
    !!data.education,
    Array.isArray(data.skills) && data.skills.length > 0,
    Array.isArray(data.interests) && data.interests.length > 0,
    !!data.dateOfBirth,
    !!data.gender,
    !!data.state,
    !!data.caste,
    !!data.religion,
    data.familyIncome !== undefined && data.familyIncome !== null,
    !!data.category,
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

export default function Profile() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [user, setUser] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const currentLangObj = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  const loadUser = async () => {
    try {
      const cached = await AsyncStorage.getItem('userData');
      if (cached) {
        setUser(JSON.parse(cached));
        setLoading(false);
      }
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setLoading(false);
        return;
      }
      const data = await safeFetchJson(getUserEndpoint(userId));
      if (data) {
        setUser(data);
        await AsyncStorage.setItem('userData', JSON.stringify(data));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      t('confirm_logout'),
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userId');
              await AsyncStorage.removeItem('userData');
              router.replace('/auth/landing');
            } catch (err) {
              console.error('Logout error:', err);
            }
          }
        }
      ]
    );
  };

  useFocusEffect(useCallback(() => {
    loadUser();
    return undefined;
  }, []));

  const completionPercentage = getCompletionPercentage(user);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#1e3a8a" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <CustomStatusBar />

      {/* Header */}
      <View className="bg-blue-900 rounded-b-3xl px-6 py-6 mb-4">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => goBackWithinApp(router)} activeOpacity={0.7}>
            <ArrowLeft color="#ffffff" size={24} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center bg-white/20 px-3 py-1.5 rounded-full"
            activeOpacity={0.8}
            onPress={() => setLangModalVisible(true)}
          >
            <Text className="text-sm mr-1.5">{currentLangObj.flag}</Text>
            <Text className="text-white text-xs font-bold">{currentLangObj.nativeName}</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="w-20 h-20 rounded-full bg-blue-700 border-2 border-white/40 items-center justify-center mr-4">
              <UserIcon color="#ffffff" size={40} strokeWidth={2} />
            </View>
            <View className="flex-1">
              <Text className="text-white text-2xl font-bold mb-1">
                {user.fullName || t('guest')}
              </Text>
              <Text className="text-blue-200 text-sm">
                {user.location || 'Location not set'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            className="bg-white/20 rounded-full px-5 py-2 flex-row items-center"
            activeOpacity={0.7}
            onPress={() => router.push('/profile/edit')}
          >
            <Edit3 color="#ffffff" size={16} />
            <Text className="text-white font-semibold text-sm ml-1.5">{t('edit_profile')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">

        {/* Real completion % from API data */}
        <ProfileCompleteBanner completionPercentage={completionPercentage} />

        {/* Contact Information */}
        <View className="px-6 mb-6">
          <Text className="text-black text-xl font-bold mb-4">{t('contact_info')}</Text>

          <View className="bg-gray-100 rounded-2xl p-4 mb-3 flex-row items-center">
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
              <Mail color="#2563eb" size={20} strokeWidth={2} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs mb-1">{t('email')}</Text>
              <Text className="text-black text-sm font-semibold">{user.email || '—'}</Text>
            </View>
          </View>

          <View className="bg-gray-100 rounded-2xl p-4 mb-3 flex-row items-center">
            <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
              <Phone color="#7c3aed" size={20} strokeWidth={2} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs mb-1">{t('phone')}</Text>
              <Text className="text-black text-sm font-semibold">{user.phone || '—'}</Text>
            </View>
          </View>

          <View className="bg-gray-100 rounded-2xl p-4 flex-row items-center">
            <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
              <MapPin color="#ef4444" size={20} strokeWidth={2} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs mb-1">{t('location')}</Text>
              <Text className="text-black text-sm font-semibold">{user.location || '—'}</Text>
            </View>
          </View>
        </View>

        {/* Education & Skills */}
        {(() => {
          const userSkills: string[] = Array.isArray(user.skills)
            ? user.skills
            : typeof user.skills === 'string'
            ? (user.skills as string).split(',').map(s => s.trim()).filter(Boolean)
            : [];

          const userInterests: string[] = Array.isArray(user.interests)
            ? user.interests
            : typeof user.interests === 'string'
            ? (user.interests as string).split(',').map(i => i.trim()).filter(Boolean)
            : [];

          return (
            <View className="px-6 mb-6">
              <Text className="text-black text-xl font-bold mb-4">{t('education_skills')}</Text>

              <View className="bg-gray-100 rounded-2xl p-4 mb-4">
                <Text className="text-gray-500 text-xs mb-2">{t('education')}</Text>
                <Text className="text-black text-base font-semibold">{user.education || '—'}</Text>
              </View>

              <Text className="text-gray-700 text-sm font-semibold mb-3">{t('skills')}</Text>
              {userSkills.length > 0 ? (
                <View className="flex-row flex-wrap mb-4">
                  {userSkills.map((skill: string, idx: number) => (
                    <View key={`${skill}-${idx}`} className="bg-blue-100 rounded-full px-4 py-2 mr-2 mb-2">
                      <Text className="text-blue-900 text-sm font-semibold">{skill}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4 flex-row items-center justify-between">
                  <View className="flex-1 mr-2">
                    <Text className="text-blue-900 text-sm font-bold">{t('no_skills_added')}</Text>
                    <Text className="text-blue-700 text-xs mt-0.5">{t('add_skills_desc')}</Text>
                  </View>
                  <TouchableOpacity
                    className="bg-blue-700 px-3 py-1.5 rounded-xl"
                    onPress={() => router.push('/profile/edit')}
                  >
                    <Text className="text-white text-xs font-bold">{t('add_skills')}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {userInterests.length > 0 && (
                <>
                  <Text className="text-gray-700 text-sm font-semibold mb-3">{t('interests')}</Text>
                  <View className="flex-row flex-wrap">
                    {userInterests.map((interest: string, idx: number) => (
                      <View key={`${interest}-${idx}`} className="bg-orange-100 rounded-full px-4 py-2 mr-2 mb-2">
                        <Text className="text-orange-700 text-sm font-semibold">{interest}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          );
        })()}

        {/* Settings */}
        <View className="px-6 mb-6">
          <Text className="text-black text-xl font-bold mb-4">{t('settings')}</Text>

          <TouchableOpacity
            className="bg-white rounded-2xl p-4 mb-3 flex-row items-center justify-between border border-blue-200 bg-blue-50/50"
            activeOpacity={0.7}
            onPress={() => setLangModalVisible(true)}
          >
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">{currentLangObj.flag}</Text>
              <View>
                <Text className="text-black text-base font-semibold">{t('language')}</Text>
                <Text className="text-blue-700 text-xs font-bold">{currentLangObj.nativeName} ({currentLangObj.label})</Text>
              </View>
            </View>
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
              <Globe color="#2563eb" size={20} strokeWidth={2} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white rounded-2xl p-4 border-2 border-red-500" activeOpacity={0.7} onPress={handleLogout}>
            <Text className="text-red-600 text-center text-base font-bold">{t('logout')}</Text>
          </TouchableOpacity>
        </View>

        <View className="h-20" />
      </ScrollView>

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
      />

      <BottomNav />
    </SafeAreaView>
  );
}