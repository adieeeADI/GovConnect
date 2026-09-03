import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, BackHandler, Alert } from 'react-native';
import { Sparkles, FolderOpen, Building2, GraduationCap, FileText, Award, ArrowRight, Globe } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNav from './bottom';
import { getUserEndpoint, safeFetchJson } from '../../config/api.config';
import { useTranslation } from '../../utils/i18n';
import LanguageSelectorModal from '../../components/LanguageSelectorModal';

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

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const [userName, setUserName] = useState('Guest');
  const [completionPercentage, setCompletionPercentage] = useState<number>(50);
  const [langModalVisible, setLangModalVisible] = useState(false);

  // Load user data and set back listener on home screen
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadUserData = async () => {
        try {
          const cachedUser = await AsyncStorage.getItem('userData');
          if (cachedUser) {
            const parsed = JSON.parse(cachedUser);
            if (isMounted) {
              setUserName(parsed.fullName || parsed.email || t('guest'));
              setCompletionPercentage(getCompletionPercentage(parsed));
            }
          }

          const userId = await AsyncStorage.getItem('userId');
          if (!userId) return;
          const data = await safeFetchJson(getUserEndpoint(userId));
          if (isMounted && data) {
            setUserName(data.fullName || data.email || t('guest'));
            setCompletionPercentage(getCompletionPercentage(data));
            await AsyncStorage.setItem('userData', JSON.stringify(data));
          }
        } catch (err) {
          console.log('Error loading user profile on home:', err);
        }
      };

      loadUserData();

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          Alert.alert(
            'Exit App',
            'Are you sure you want to exit the app?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Exit', style: 'destructive', onPress: () => BackHandler.exitApp() }
            ]
          );
          return true;
        }
      );

      return () => {
        isMounted = false;
        backHandler.remove();
      };
    }, [])
  );

  return (
    <View className="flex-1 bg-white">
      <ScrollView 
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header */}
        <View className="bg-blue-900 px-6 pt-12 pb-8 rounded-b-3xl mb-4 flex-row items-center justify-between">
          <View className="flex-1 mr-4">
            <Text className="text-blue-200 text-lg mb-1">{t('welcome_back')}</Text>
            <Text className="text-white text-3xl font-bold mb-2">{userName}</Text>
            <Text className="text-blue-100 text-sm">{t('ready_find_next')}</Text>
          </View>

          <TouchableOpacity
            className="w-12 h-12 rounded-2xl bg-white/10 items-center justify-center border border-white/20"
            activeOpacity={0.8}
            onPress={() => setLangModalVisible(true)}
          >
            <Globe color="#ffffff" size={24} />
          </TouchableOpacity>
        </View>

        {/* Profile Status Card */}
        {completionPercentage < 100 ? (
          <TouchableOpacity 
            className="mx-6 mb-6 bg-orange-500 rounded-2xl p-4"
            activeOpacity={0.8}
            onPress={() => router.push('/profile/complete-profile')}
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white text-base font-bold">
                {t('profile_completion')} ({completionPercentage}% Done)
              </Text>
              <ArrowRight color="#ffffff" size={20} />
            </View>
            <View className="h-2 bg-white/30 rounded-full overflow-hidden mb-2">
              <View className="h-full bg-white rounded-full" style={{ width: `${completionPercentage}%` }} />
            </View>
            <Text className="text-white text-xs">
              {t('tap_complete_profile')}
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="mx-6 mb-6">
            <View className="bg-emerald-600 rounded-2xl p-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-white text-base font-bold">
                  {t('profile_complete_100')}
                </Text>
              </View>
              <View className="h-2 bg-white/30 rounded-full overflow-hidden">
                <View className="h-full bg-white rounded-full" style={{ width: '100%' }} />
              </View>
              <Text className="text-white text-xs mt-2">
                {t('profile_optimized_msg')}
              </Text>
            </View>
          </View>
        )}

        {/* Stats Cards */}
        <View className="flex-row justify-between px-6 mb-6">
          <View className="flex-1 bg-blue-100 rounded-2xl p-4 mr-2 items-center">
            <Text className="text-blue-900 text-3xl font-bold">5</Text>
            <Text className="text-blue-900 text-xs font-semibold text-center">{t('stats_recommended')}</Text>
          </View>
          <View className="flex-1 bg-purple-100 rounded-2xl p-4 mx-2 items-center">
            <Text className="text-purple-900 text-3xl font-bold">12</Text>
            <Text className="text-purple-900 text-xs font-semibold text-center">{t('stats_opportunity')}</Text>
          </View>
          <View className="flex-1 bg-teal-100 rounded-2xl p-4 ml-2 items-center">
            <Text className="text-teal-900 text-3xl font-bold">8</Text>
            <Text className="text-teal-900 text-xs font-semibold text-center">{t('stats_applied')}</Text>
          </View>
        </View>

        {/* Find your Opportunity */}
        <Text className="text-black text-xl font-bold px-6 mb-4">
          {t('find_opportunity')}
        </Text>

        {/* AI Recommendation Card */}
        <TouchableOpacity 
          className="bg-blue-900 rounded-2xl p-5 mx-6 mb-4 flex-row items-center justify-between"
          activeOpacity={0.8}
          onPress={() => router.push('/main/recommendation')}
        >
          <View className="flex-1">
            <Text className="text-white text-xl font-bold mb-1">
              {t('ai_recommendation')}
            </Text>
            <Text className="text-white text-sm">
              {t('top_5_opportunities')}
            </Text>
          </View>
          <Sparkles color="#ffffff" size={48} strokeWidth={2} />
        </TouchableOpacity>

        {/* Browse all Opportunity Card */}
        <TouchableOpacity 
          className="bg-red-600 rounded-2xl p-5 mx-6 mb-6 flex-row items-center justify-between"
          activeOpacity={0.8}
          onPress={() => router.push('/main/browse?category=internships')}
        >
          <View className="flex-1">
            <Text className="text-white text-xl font-bold mb-1">
              {t('browse_all_opportunity')}
            </Text>
            <Text className="text-white text-sm">
              {t('search_by_category')}
            </Text>
          </View>
          <FolderOpen color="#ffffff" size={48} strokeWidth={2} />
        </TouchableOpacity>

        {/* Browse Categories */}
        <Text className="text-black text-xl font-bold px-6 mb-4">
          {t('browse_categories')}
        </Text>

        <View className="px-6 mb-6">
          <View className="flex-row mb-4">
            {/* Government Internship */}
            <TouchableOpacity 
              className="flex-1 bg-gray-100 rounded-2xl p-6 mr-2 items-center"
              activeOpacity={0.8}
              onPress={() => router.push('/main/browse?category=internships')}
            >
              <Building2 color="#ef4444" size={48} strokeWidth={1.5} />
              <Text className="text-black text-sm font-bold text-center mt-3">
                {t('govt_internship')}
              </Text>
            </TouchableOpacity>

            {/* Scholarship */}
            <TouchableOpacity 
              className="flex-1 bg-gray-100 rounded-2xl p-6 ml-2 items-center"
              activeOpacity={0.8}
              onPress={() => router.push('/main/browse?category=scholarships')}
            >
              <GraduationCap color="#000000" size={48} strokeWidth={1.5} />
              <Text className="text-black text-sm font-bold text-center mt-3">
                {t('scholarship')}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row mb-4">
            {/* Government Scheme */}
            <TouchableOpacity 
              className="flex-1 bg-gray-100 rounded-2xl p-6 mr-2 items-center"
              activeOpacity={0.8}
              onPress={() => router.push('/main/browse?category=schemes')}
            >
              <FileText color="#10b981" size={48} strokeWidth={1.5} />
              <Text className="text-black text-sm font-bold text-center mt-3">
                {t('govt_scheme')}
              </Text>
            </TouchableOpacity>

            {/* Training & Certification */}
            <TouchableOpacity 
              className="flex-1 bg-gray-100 rounded-2xl p-6 ml-2 items-center"
              activeOpacity={0.8}
              onPress={() => router.push('/main/browse?category=training')}
            >
              <Award color="#3b82f6" size={48} strokeWidth={1.5} />
              <Text className="text-black text-sm font-bold text-center mt-3">
                {t('training_certification')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* New Opportunity Alert */}
        <View className="bg-blue-100 rounded-2xl p-4 mx-6 mb-6">
          <Text className="text-blue-900 text-base font-bold mb-1">
            {t('new_opportunity_alert')}
          </Text>
          <Text className="text-blue-800 text-sm">
            {t('new_opportunity_msg')}
          </Text>
        </View>

        {/* Bottom padding for navigation bar */}
        <View className="h-32" />
      </ScrollView>

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
      />

      {/* Bottom Navigation */}
      <BottomNav />
    </View>
  );
}