import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomStatusBar from '../components/CustomStatusBar';
import { ArrowLeft, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, logApiConfig, safeFetchJson } from '../../config/api.config';
import BottomNav from './bottom';

import { useTranslation } from '../../utils/i18n';

const getMatchColor = (match: number) => {
  if (match >= 90) return 'text-green-500';
  if (match >= 85) return 'text-blue-500';
  if (match >= 80) return 'text-blue-600';
  return 'text-orange-500';
};

export default function Recommendation() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchRecommendations = async () => {
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

        console.log('📍 Fetching recommendations for userId:', userId, 'language:', language);
        const endpoint = `${API_ENDPOINTS.RECOMMEND}/${userId}?lang=${language}`;
        console.log('🔗 API Endpoint:', endpoint);

        const data = await safeFetchJson(endpoint);
        console.log('✅ Recommendations fetched:', Array.isArray(data) ? data.length : 0);

        if (isMounted) {
          if (Array.isArray(data)) {
            setRecommendations(data);
            setError(null);
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

    fetchRecommendations();
    return () => {
      isMounted = false;
    };
  }, [language]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <CustomStatusBar />

      <View className="bg-blue-900 rounded-b-3xl px-6 py-6 mb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>

        <Text className="text-white text-3xl font-bold mt-3">
          {t('recommended_for_you')}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1e40af" />
          <Text className="mt-4 text-gray-600">{t('loading_recommendations')}</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-red-50 border-l-4 border-red-400 p-4 mb-5">
            <Text className="text-red-900 font-semibold">Error</Text>
            <Text className="text-red-800">{error}</Text>
          </View>
        </View>
      ) : recommendations.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-5">
            <Text className="text-blue-900 font-semibold">No Recommendations</Text>
            <Text className="text-blue-800">Complete your profile to get personalized recommendations.</Text>
          </View>
        </View>
      ) : (
        <ScrollView className="px-6">

          <View className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-5">
            <Text className="text-orange-900 font-semibold">✨ AI Match:</Text>
            <Text className="text-orange-800 text-xs">Recommendations generated dynamically based on your profile skills & interests.</Text>
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
                <Text className="font-bold text-lg flex-1 mr-2">{item.title}</Text>
                <Text className={`font-bold text-base ${getMatchColor(item.match)}`}>
                  {item.match}% {t('match_score')}
                </Text>
              </View>

              <Text className="text-gray-500 text-sm mb-2">{item.organization}</Text>

              <View className="flex-row items-center mb-3">
                <MapPin size={14} color="#6b7280" />
                <Text className="ml-1 text-gray-600 text-xs">{item.location}</Text>
              </View>

              <View className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <Text className="text-blue-900 text-xs font-semibold mb-1">{t('reason')}:</Text>
                <Text className="text-blue-800 text-xs">{item.reason}</Text>
              </View>

            </TouchableOpacity>
          ))}

        </ScrollView>
      )}

      <BottomNav />
    </SafeAreaView>
  );
}