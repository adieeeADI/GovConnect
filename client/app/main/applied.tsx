import { AppText as Text } from '../../components/ScaledText';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, BackHandler, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Clock,
  ArrowRight,
  Trash2,
  Building2,
  Calendar,
  FolderOpen,
} from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNav from './bottom';
import { useTranslation } from '../../utils/i18n';
import { goBackWithinApp } from '../../utils/navigation';
import TranslatedText from '../../components/TranslatedText';
import CustomStatusBar from '../components/CustomStatusBar';
import { getApplied, removeApplied } from '../../utils/bookmarkService';

export default function AppliedScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  // Redirect to Bookmarks since application tracking is deprecated
  useEffect(() => {
    router.replace('/main/bookmarks');
  }, [router]);

  const [appliedList, setAppliedList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Handle hardware back press
  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        goBackWithinApp(router);
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => backHandler.remove();
    }, [router])
  );

  const loadAppliedData = async (isPullRefresh = false) => {
    if (!isPullRefresh) setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const list = await getApplied(userId);
      setAppliedList(list);
    } catch (err) {
      console.log('Error loading applied opportunities:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAppliedData();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadAppliedData(true);
  };

  const handleRemove = async (opportunityId: string, title: string) => {
    Alert.alert(
      'Remove Application',
      `Remove "${title}" from your applied list?`,
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const userId = await AsyncStorage.getItem('userId');
            // Optimistic update
            setAppliedList((prev) =>
              prev.filter((a) => String(a.opportunityId) !== String(opportunityId))
            );
            await removeApplied(userId, opportunityId);
          },
        },
      ]
    );
  };

  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Recently';
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'internships':
        return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', label: 'Internship' };
      case 'scholarships':
        return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', label: 'Scholarship' };
      case 'schemes':
        return { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900', label: 'Scheme' };
      case 'training':
        return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', label: 'Training' };
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-900', label: 'Opportunity' };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <CustomStatusBar />

      {/* Header */}
      <View className="bg-blue-900 rounded-b-3xl px-6 pt-6 pb-6 mb-4">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => goBackWithinApp(router)}
            activeOpacity={0.7}
            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/20"
          >
            <ArrowLeft color="#ffffff" size={22} strokeWidth={2.2} />
          </TouchableOpacity>

          <View className="flex-row items-center bg-teal-500/20 px-3 py-1.5 rounded-full border border-teal-300/30">
            <CheckCircle2 color="#2dd4bf" size={16} />
            <Text className="text-white text-xs font-bold ml-1.5">
              {appliedList.length} {t('stats_applied')}
            </Text>
          </View>
        </View>

        <Text className="text-white text-2xl font-bold mb-1">
          {t('applied_opportunities')}
        </Text>
        <Text className="text-blue-200 text-xs">
          Track all your government internships and opportunities applied
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text className="text-gray-500 text-sm mt-3">Loading applications...</Text>
        </View>
      ) : appliedList.length === 0 ? (
        /* Empty State */
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 bg-teal-50 rounded-full items-center justify-center mb-4 border border-teal-100">
            <CheckCircle2 color="#0d9488" size={38} strokeWidth={1.5} />
          </View>

          <Text className="text-gray-900 text-xl font-bold text-center mb-2">
            {t('no_applied')}
          </Text>

          <Text className="text-gray-500 text-sm text-center mb-6 leading-relaxed">
            {t('no_applied_desc')}
          </Text>

          <TouchableOpacity
            className="bg-blue-900 px-6 py-3.5 rounded-2xl flex-row items-center"
            activeOpacity={0.8}
            onPress={() => router.push('/main/browse?category=all')}
          >
            <FolderOpen color="#ffffff" size={18} />
            <Text className="text-white font-bold text-sm ml-2">
              {t('explore_opportunities')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Applied List */
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#1e3a8a']}
              tintColor="#1e3a8a"
            />
          }
        >
          {appliedList.map((item) => {
            const oppId = item.opportunityId;
            const category = item.category || 'internships';
            const catStyle = getCategoryColor(category);

            return (
              <View
                key={`applied-${oppId}`}
                className="bg-white rounded-2xl p-4 mb-4 border border-gray-200 shadow-sm"
              >
                {/* Header row: Category Badge & Applied Tag */}
                <View className="flex-row items-center justify-between mb-2">
                  <View className={`rounded-lg px-2.5 py-1 border ${catStyle.bg} ${catStyle.border}`}>
                    <Text className={`text-xs font-bold ${catStyle.text}`}>
                      {catStyle.label}
                    </Text>
                  </View>

                  <View className="flex-row items-center bg-teal-50 border border-teal-200 rounded-lg px-2.5 py-1">
                    <CheckCircle2 color="#0d9488" size={12} strokeWidth={2.2} />
                    <Text className="text-teal-800 text-xs font-bold ml-1">
                      {t('already_applied')}
                    </Text>
                  </View>
                </View>

                {/* Title */}
                <TranslatedText
                  text={item.title || 'Government Opportunity'}
                  className="text-gray-900 text-base font-bold leading-snug mb-1"
                />

                {/* Provider */}
                {item.providerName ? (
                  <TranslatedText
                    text={item.providerName}
                    className="text-gray-500 text-xs mb-3 font-medium"
                  />
                ) : null}

                {/* Applied Date Banner */}
                <View className="bg-gray-50 rounded-xl p-2.5 mb-3 flex-row items-center justify-between border border-gray-100">
                  <View className="flex-row items-center">
                    <Calendar color="#6b7280" size={14} strokeWidth={2} />
                    <Text className="text-gray-600 text-xs ml-1.5 font-medium">
                      Applied on:
                    </Text>
                  </View>
                  <Text className="text-gray-900 text-xs font-bold">
                    {formatDate(item.appliedAt)}
                  </Text>
                </View>

                {/* Card Action Buttons */}
                <View className="flex-row items-center gap-2 pt-1 border-t border-gray-100">
                  <TouchableOpacity
                    className="flex-1 bg-blue-900 rounded-xl py-2.5 px-4 flex-row items-center justify-center active:opacity-80"
                    activeOpacity={0.8}
                    onPress={() => {
                      router.push({
                        pathname: '/main/details/[id]',
                        params: { id: oppId, category: category },
                      });
                    }}
                  >
                    <Text className="text-white text-xs font-bold mr-1">
                      {t('view_details')}
                    </Text>
                    <ArrowRight color="#ffffff" size={14} strokeWidth={2.2} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 items-center justify-center active:opacity-70"
                    activeOpacity={0.7}
                    onPress={() => handleRemove(oppId, item.title || 'Opportunity')}
                  >
                    <Trash2 color="#ef4444" size={16} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </SafeAreaView>
  );
}
