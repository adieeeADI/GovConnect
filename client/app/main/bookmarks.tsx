import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  BackHandler,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Bookmark,
  MapPin,
  Clock,
  Wallet,
  ArrowRight,
  Trash2,
  AlertCircle,
  Building2,
  Calendar,
} from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNav from './bottom';
import { useTranslation } from '../../utils/i18n';
import { goBackWithinApp } from '../../utils/navigation';
import TranslatedText from '../../components/TranslatedText';
import CustomStatusBar from '../components/CustomStatusBar';
import {
  getBookmarks,
  removeBookmark,
  getDeadlineInfo,
  isDeadlineExceeded,
} from '../../utils/bookmarkService';

export default function BookmarksScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removedCount, setRemovedCount] = useState<number>(0);

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

  const loadBookmarksData = async (isPullRefresh = false) => {
    if (!isPullRefresh) setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const activeBookmarks = await getBookmarks(userId);
      setBookmarks(activeBookmarks);
    } catch (err) {
      console.log('Error loading bookmarks:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBookmarksData();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadBookmarksData(true);
  };

  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case 'scholarships':
        return {
          label: t('scholarship') || 'Scholarship',
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-800',
        };
      case 'schemes':
        return {
          label: t('govt_scheme') || 'Govt Scheme',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-800',
        };
      case 'training':
        return {
          label: t('training') || 'Skill Training',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-800',
        };
      case 'internships':
      default:
        return {
          label: t('internships') || 'Internship',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-900',
        };
    }
  };

  const handleRemove = async (opportunityId: string | number, title: string, category?: string) => {
    Alert.alert(
      t('remove_bookmark') || 'Remove Bookmark',
      `Remove "${title}" from your bookmarks?`,
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('remove_bookmark') || 'Remove',
          style: 'destructive',
          onPress: async () => {
            const userId = await AsyncStorage.getItem('userId');
            // Optimistic update
            setBookmarks((prev) =>
              prev.filter((b) => {
                const bId = b.opportunityId || b.internshipId || b._id;
                return String(bId) !== String(opportunityId);
              })
            );
            await removeBookmark(userId, opportunityId, category);
          },
        },
      ]
    );
  };

  const formatDeadline = (dateStr?: string | Date) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return null;
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

          <View className="flex-row items-center bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
            <Bookmark color="#fbbf24" size={16} fill="#fbbf24" />
            <Text className="text-white text-xs font-bold ml-1.5">
              {bookmarks.length} {t('bookmarked') || 'Saved'}
            </Text>
          </View>
        </View>

        <Text className="text-white text-2xl font-bold mb-1">
          {t('bookmarks')}
        </Text>
        <Text className="text-blue-200 text-xs leading-relaxed">
          {t('deadline_auto_removed_notice')}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text className="text-gray-500 text-sm mt-3">Loading bookmarks...</Text>
        </View>
      ) : bookmarks.length === 0 ? (
        /* Empty State */
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center mb-4 border border-blue-100">
            <Bookmark color="#1e3a8a" size={38} strokeWidth={1.5} />
          </View>

          <Text className="text-gray-900 text-xl font-bold text-center mb-2">
            {t('no_bookmarks')}
          </Text>

          <Text className="text-gray-500 text-sm text-center mb-6 leading-relaxed">
            {t('no_bookmarks_desc')}
          </Text>

          <TouchableOpacity
            className="bg-blue-900 px-6 py-3.5 rounded-2xl flex-row items-center"
            activeOpacity={0.8}
            onPress={() => router.push('/main/browse?category=all')}
          >
            <Building2 color="#ffffff" size={18} className="mr-2" />
            <Text className="text-white font-bold text-sm ml-2">
              {t('explore_opportunities')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Bookmarks List */
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
          {/* Notice banner */}
          <View className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 mb-4 flex-row items-start">
            <AlertCircle color="#d97706" size={18} strokeWidth={2} className="mr-2 mt-0.5" />
            <Text className="text-amber-900 text-xs ml-2 flex-1 leading-snug">
              {t('deadline_auto_removed_notice')}. Keep track of closing dates below.
            </Text>
          </View>

          {bookmarks.map((item) => {
            const cat = item.category || 'internships';
            const rawId = item.opportunityId || item.internshipId || item._id;
            const cleanId = String(rawId).replace(/^(internships|scholarships|schemes|training)_/, '');
            const badge = getCategoryBadge(cat);
            const endDate = item.applicationDetails?.endDate || item.endDate;
            const deadlineInfo = getDeadlineInfo(endDate);
            const formattedDeadline = formatDeadline(endDate);

            return (
              <View
                key={`bm-${cat}-${cleanId}`}
                className="bg-white rounded-2xl p-4 mb-4 border border-gray-200 shadow-sm"
              >
                {/* Header row: category + deadline badge */}
                <View className="flex-row items-center justify-between mb-2">
                  <View className={`${badge.bg} border ${badge.border} rounded-lg px-2.5 py-1`}>
                    <Text className={`${badge.text} text-xs font-bold`}>
                      {badge.label}
                    </Text>
                  </View>

                  {/* Deadline countdown badge */}
                  {deadlineInfo.days !== null && (
                    <View
                      className={`flex-row items-center rounded-lg px-2.5 py-1 border ${
                        deadlineInfo.days <= 1
                          ? 'bg-red-50 border-red-200'
                          : deadlineInfo.days <= 3
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-emerald-50 border-emerald-200'
                      }`}
                    >
                      <Clock
                        size={12}
                        color={
                          deadlineInfo.days <= 1
                            ? '#dc2626'
                            : deadlineInfo.days <= 3
                            ? '#d97706'
                            : '#059669'
                        }
                        strokeWidth={2.2}
                      />
                      <Text
                        className={`text-xs font-bold ml-1 ${
                          deadlineInfo.days <= 1
                            ? 'text-red-700'
                            : deadlineInfo.days <= 3
                            ? 'text-amber-800'
                            : 'text-emerald-700'
                        }`}
                      >
                        {deadlineInfo.text}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Title */}
                <TranslatedText
                  text={item.title || 'Government Opportunity'}
                  className="text-gray-900 text-base font-bold leading-snug mb-1"
                />

                {/* Provider */}
                <TranslatedText
                  text={item.providerName || 'Government of India'}
                  className="text-gray-500 text-xs mb-3 font-medium"
                />

                {/* Pills Row: Location, Stipend/Benefit, Duration */}
                <View className="flex-row flex-wrap gap-2 mb-3">
                  <View className="bg-gray-100 rounded-lg px-2.5 py-1 flex-row items-center">
                    <MapPin color="#4b5563" size={13} strokeWidth={2} />
                    <TranslatedText
                      text={Array.isArray(item.location) ? item.location[0] : item.location || 'India'}
                      className="text-gray-700 text-xs ml-1"
                    />
                  </View>

                  {item.stipend ? (
                    <View className="bg-gray-100 rounded-lg px-2.5 py-1 flex-row items-center">
                      <Wallet color="#4b5563" size={13} strokeWidth={2} />
                      <TranslatedText
                        text={item.stipend}
                        className="text-gray-700 text-xs ml-1"
                      />
                    </View>
                  ) : null}

                  {item.duration ? (
                    <View className="bg-gray-100 rounded-lg px-2.5 py-1 flex-row items-center">
                      <Clock color="#4b5563" size={13} strokeWidth={2} />
                      <TranslatedText
                        text={item.duration}
                        className="text-gray-700 text-xs ml-1"
                      />
                    </View>
                  ) : null}
                </View>

                {/* Application deadline date banner */}
                {formattedDeadline && (
                  <View className="bg-gray-50 rounded-xl p-2.5 mb-3 flex-row items-center justify-between border border-gray-100">
                    <View className="flex-row items-center">
                      <Calendar color="#6b7280" size={14} strokeWidth={2} />
                      <Text className="text-gray-600 text-xs ml-1.5 font-medium">
                        {t('deadline')}:
                      </Text>
                    </View>
                    <Text className="text-gray-900 text-xs font-bold">
                      {formattedDeadline}
                    </Text>
                  </View>
                )}

                {/* Card Action Buttons */}
                <View className="flex-row items-center gap-2 pt-1 border-t border-gray-100">
                  <TouchableOpacity
                    className="flex-1 bg-blue-900 rounded-xl py-2.5 px-4 flex-row items-center justify-center active:opacity-80"
                    activeOpacity={0.8}
                    onPress={() => {
                      router.push({
                        pathname: '/main/details/[id]',
                        params: { id: `${cat}_${cleanId}`, category: cat },
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
                    onPress={() => handleRemove(cleanId, item.title || 'Opportunity', cat)}
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
