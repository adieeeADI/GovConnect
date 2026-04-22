import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomStatusBar from '../components/CustomStatusBar';
import { ArrowLeft, MapPin, Lightbulb } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, logApiConfig } from '../../config/api.config';
import BottomNav from './bottom';

const getMatchColor = (match: number) => {
  if (match >= 90) return 'text-green-500';
  if (match >= 85) return 'text-blue-500';
  if (match >= 80) return 'text-blue-600';
  return 'text-orange-500';
};

export default function Recommendation() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        logApiConfig(); // Log which API environment is being used
        
        // Get userId from AsyncStorage
        const userId = await AsyncStorage.getItem('userId');
        
        if (!userId) {
          setError('User not authenticated. Please sign in again.');
          setLoading(false);
          return;
        }

        console.log('📍 Fetching recommendations for userId:', userId);
        
        const endpoint = `${API_ENDPOINTS.RECOMMEND}/${userId}`;
        console.log('🔗 API Endpoint:', endpoint);
        
        const res = await fetch(endpoint);
        
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('✅ Recommendations fetched:', data.length);

        setRecommendations(data);
        setError(null);
      } catch (err: any) {
        console.error('❌ Error fetching recommendations:', err);
        setError(err.message || 'Failed to load recommendations');
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <CustomStatusBar />

      <View className="bg-blue-900 rounded-b-3xl px-6 py-6 mb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>

        <Text className="text-white text-3xl font-bold mt-3">
          Recommended For You
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1e40af" />
          <Text className="mt-4 text-gray-600">Loading recommendations...</Text>
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
            <Text className="text-orange-900 font-semibold">Tip:</Text>
            <Text>AI analyzed your profile</Text>
          </View>

          {recommendations.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              className="bg-white rounded-xl p-4 mb-4 border"
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
              <View className="flex-row justify-between">
                <Text className="font-bold text-lg">{item.title}</Text>
                <Text className={getMatchColor(item.match)}>
                  {item.match}%
                </Text>
              </View>

              <Text className="text-gray-500">{item.organization}</Text>

              <View className="flex-row items-center mt-2">
                <MapPin size={14} />
                <Text className="ml-1">{item.location}</Text>
              </View>

              <View className="bg-blue-50 p-2 mt-2">
                <Text>{item.reason}</Text>
              </View>

            </TouchableOpacity>
          ))}

        </ScrollView>
      )}

      <BottomNav />
    </SafeAreaView>
  );
}