import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, BackHandler, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomStatusBar from '../components/CustomStatusBar';
import { ArrowLeft, MapPin, RefreshCw, Bookmark } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, logApiConfig, safeFetchJson } from '../../config/api.config';
import BottomNav from './bottom';
import { goBackWithinApp } from '../../utils/navigation';
import {
  addBookmark,
  removeBookmark,
  getBookmarks,
  cleanOpportunityId,
} from '../../utils/bookmarkService';

import { useTranslation } from '../../utils/i18n';
import TranslatedText from '../../components/TranslatedText';

const getMatchColor = (match: number) => {
  if (match >= 90) return 'text-green-500';
  if (match >= 85) return 'text-blue-500';
  if (match >= 80) return 'text-blue-600';
  return 'text-orange-500';
};

export const getRecommendationsCacheKey = (userId: string, language: string) =>
  `recommendations:${userId}:${language}`;

export default function Recommendation() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkedKeys, setBookmarkedKeys] = useState<Set<string>>(new Set());

  const refreshBookmarks = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const list = await getBookmarks(userId);
      const keys = new Set<string>(
        list.map((b) => {
          const cat = b.category || 'internships';
          const id = cleanOpportunityId(b.opportunityId || b.internshipId || b._id || b.id);
          return `${cat}_${id}`;
        })
      );
      setBookmarkedKeys(keys);
    } catch {}
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshBookmarks();
    }, [refreshBookmarks])
  );

  const handleBookmarkToggle = async (item: any) => {
    const rawId = item.id || item._id;
    const cleanId = cleanOpportunityId(rawId);
    const cat = item.category || 'internships';
    const key = `${cat}_${cleanId}`;
    const userId = await AsyncStorage.getItem('userId');

    if (bookmarkedKeys.has(key)) {
      setBookmarkedKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      await removeBookmark(userId, cleanId, cat);
    } else {
      setBookmarkedKeys((prev) => new Set(prev).add(key));
      const res = await addBookmark(userId, {
        _id: cleanId,
        id: cleanId,
        category: cat,
        basicInfo: {
          title: item.title,
          providerName: item.organization,
        },
        location: item.location ? [item.location] : ['India'],
        endDate: item.endDate || item.applicationDetails?.endDate,
      });
      if (!res.success) {
        setBookmarkedKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          goBackWithinApp(router);
          return true;
        }
      );
      return () => backHandler.remove();
    }, [router])
  );

  useEffect(() => {
    let isMounted = true;

    const loadRecommendations = async () => {
      try {
        logApiConfig();
        const userId = await AsyncStorage.getItem('userId');
        
        if (!userId) {
          if (isMounted) {
            setError('User not authenticated. Please sign in again.');
            setLoading(false);
          }
          return;
        }

        const cacheKey = getRecommendationsCacheKey(userId, language);
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const cachedRecommendations = JSON.parse(cached);
          if (Array.isArray(cachedRecommendations)) {
            if (isMounted) {
              console.log('📦 Recommendations loaded from cache for userId:', userId);
              setRecommendations(cachedRecommendations);
              setError(null);
              setLoading(false);
            }
            return;
          }
        }

        console.log('📍 Fetching recommendations from API for userId:', userId, 'language:', language);
        const endpoint = `${API_ENDPOINTS.RECOMMEND}/${userId}?lang=${language}`;
        console.log('🔗 API Endpoint:', endpoint);

        const data = await safeFetchJson(endpoint);
        console.log('✅ Recommendations fetched:', Array.isArray(data) ? data.length : 0);

        if (isMounted) {
          if (Array.isArray(data)) {
            setRecommendations(data);
            setError(null);
            await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
          } else {
            setRecommendations([]);
            setError(data?.message || null);
          }
        }
      } catch (err: any) {
        console.error('❌ Error fetching recommendations:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load recommendations');
          setRecommendations([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadRecommendations();
    return () => {
      isMounted = false;
    };
  }, [language]);

  const refreshRecommendations = async () => {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      setError('User not authenticated. Please sign in again.');
      return;
    }

    setRefreshing(true);
    setError(null);
    try {
      const cacheKey = getRecommendationsCacheKey(userId, language);
      await AsyncStorage.removeItem(cacheKey);

      const endpoint = `${API_ENDPOINTS.RECOMMEND}/${userId}?lang=${encodeURIComponent(language)}&refresh=${Date.now()}`;
      console.log('🔄 Refreshing recommendations from API:', endpoint);
      const data = await safeFetchJson(endpoint, {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!Array.isArray(data)) {
        throw new Error(data?.message || 'Failed to refresh recommendations');
      }
      setRecommendations(data);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
      console.log('✅ Fresh recommendations saved to local cache:', data.length);
    } catch (err: any) {
      setError(err.message || 'Failed to refresh recommendations');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <CustomStatusBar />

      <View className="bg-blue-900 rounded-b-3xl px-6 py-6 mb-4">
        <TouchableOpacity onPress={() => goBackWithinApp(router)}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>

        <View className="flex-row items-center justify-between mt-3">
          <Text className="text-white text-3xl font-bold flex-1">
            {t('recommended_for_you')}
          </Text>
          <TouchableOpacity
            className="ml-3 p-2"
            onPress={refreshRecommendations}
            disabled={refreshing}
            accessibilityLabel="Refresh recommendations"
          >
            {refreshing ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <RefreshCw color="#ffffff" size={24} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1e40af" />
          <Text className="mt-4 text-gray-600">{t('loading_recommendations')}</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-red-50 border-l-4 border-red-400 p-4 mb-5">
            <Text className="text-red-900 font-semibold">{t('error')}</Text>
            <Text className="text-red-800">{error}</Text>
          </View>
        </View>
      ) : recommendations.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-5">
            <Text className="text-blue-900 font-semibold">{t('no_recommendations')}</Text>
            <Text className="text-blue-800">{t('no_recommendations_desc')}</Text>
          </View>
        </View>
      ) : (
        <ScrollView
          className="px-6"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshRecommendations}
              colors={['#1e40af']}
              tintColor="#1e40af"
            />
          }
        >

          <View className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-5">
            <Text className="text-orange-900 font-semibold">{t('ai_match_badge')}</Text>
            <Text className="text-orange-800 text-xs">{t('ai_match_desc')}</Text>
          </View>

          {recommendations.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              className="bg-white rounded-xl p-4 mb-4 border border-gray-200"
              onPress={() => {
                router.push({
                  pathname: '/main/details/[id]' as any,
                  params: {
                    id: item.id,
                    category: item.category
                  }
                });
              }}
            >
              <View className="flex-row justify-between items-start mb-1">
                <TranslatedText text={item.title} className="font-bold text-lg flex-1 mr-2" />
                <View className="flex-row items-center gap-2">
                  <Text className={`font-bold text-base ${getMatchColor(item.match)}`}>
                    {item.match}% {t('match_score')}
                  </Text>
                  <TouchableOpacity
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    onPress={(e: any) => {
                      e?.stopPropagation?.();
                      handleBookmarkToggle(item);
                    }}
                    className={`w-8 h-8 rounded-full items-center justify-center border ${
                      bookmarkedKeys.has(`${item.category || 'internships'}_${cleanOpportunityId(item.id || item._id)}`)
                        ? 'bg-amber-100 border-amber-300'
                        : 'bg-gray-100 border-gray-200'
                    }`}
                  >
                    <Bookmark
                      size={15}
                      color={
                        bookmarkedKeys.has(`${item.category || 'internships'}_${cleanOpportunityId(item.id || item._id)}`)
                          ? '#d97706'
                          : '#6b7280'
                      }
                      fill={
                        bookmarkedKeys.has(`${item.category || 'internships'}_${cleanOpportunityId(item.id || item._id)}`)
                          ? '#d97706'
                          : 'none'
                      }
                      strokeWidth={2.2}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TranslatedText text={item.organization} className="text-gray-500 text-sm mb-2" />

              <View className="flex-row items-center mb-3">
                <MapPin size={14} color="#6b7280" />
                <TranslatedText text={item.location} className="ml-1 text-gray-600 text-xs" />
              </View>

              <View className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <Text className="text-blue-900 text-xs font-semibold mb-1">{t('reason')}:</Text>
                <TranslatedText text={item.reason} className="text-blue-800 text-xs" />
              </View>

            </TouchableOpacity>
          ))}

        </ScrollView>
      )}

      <BottomNav />
    </SafeAreaView>
  );
}