import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, BackHandler, ActivityIndicator } from 'react-native';
import { ArrowLeft, MapPin, Lightbulb, Home as HomeIcon, Search, Star, User } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError('');

      // Get user data from AsyncStorage
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        setError('User data not found. Please login again.');
        setLoading(false);
        return;
      }

      const user = JSON.parse(userData);
      const userId = user.id || user._id;  // Try both field names

      if (!userId) {
        setError('User ID not found. Please login again.');
        setLoading(false);
        return;
      }

      // Fetch recommendations from Gemini service
      const response = await fetch(
        `https://govconnect-ad4s.onrender.com/api/recommend/${userId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setRecommendations(data);
      } else if (data.recommendations && Array.isArray(data.recommendations)) {
        setRecommendations(data.recommendations);
      } else {
        console.log('Unexpected API response format:', data);
        setRecommendations([]);
      }
    } catch (err) {
      console.log('Error fetching recommendations:', err);
      setError('Could not load recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Prevent back navigation
  useFocusEffect(
    React.useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          router.replace('/main/home');
          return true;
        }
      );
      return () => backHandler.remove();
    }, [])
  );

  // Ensure recommendations is always an array
  const safeRecommendations = Array.isArray(recommendations) ? recommendations : [];
  
  console.log('Render state:', { loading, error, recCount: safeRecommendations.length, recExists: !!safeRecommendations });

  const renderRecommendationsList = () => {
    if (loading) return null;
    if (error) return null;
    
    if (!safeRecommendations || safeRecommendations.length === 0) {
      return (
        <View className="py-12 items-center">
          <Text className="text-gray-600 text-center text-base">
            No recommendations available at the moment.
          </Text>
          <Text className="text-gray-500 text-center text-sm mt-2">
            Complete your profile to get personalized recommendations.
          </Text>
        </View>
      );
    }

    return safeRecommendations.map((item, index) => (
      <TouchableOpacity
        key={`${item.category}-${item.id}-${index}`}
        className={`bg-white rounded-xl p-4 mb-4 ${
          item.highlighted ? 'border-2 border-blue-500' : 'border border-gray-200'
        }`}
        activeOpacity={0.8}
        onPress={() => {
          const numericId = item.id.split('_')[1] || item.id;
          router.push({
            pathname: '/main/details/[id]' as any,
            params: {
              id: numericId,
              category: item.category
            }
          });
        }}
      >
        {/* Header */}
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-row items-start flex-1">
            <View className="bg-blue-900 rounded-full w-10 h-10 items-center justify-center mr-3">
              <Text className="text-white font-bold text-base">{index + 1}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-lg font-bold mb-1">
                {item.title}
              </Text>
              <Text className="text-gray-500 text-sm">{item.organization}</Text>
            </View>
          </View>
          <View className="items-end ml-2">
            <Text className={`text-2xl font-bold ${getMatchColor(item.match)}`}>
              {item.match}%
            </Text>
            <Text className="text-gray-400 text-xs">Match</Text>
          </View>
        </View>

        {/* Location */}
        <View className="flex-row items-center mb-3">
          <MapPin color="#ef4444" size={16} strokeWidth={2} />
          <Text className="text-gray-700 text-sm ml-1">{item.location}</Text>
        </View>

        {/* Reason */}
        <View className="bg-blue-50 rounded-lg p-3 mb-3">
          <Text className="text-blue-900 text-sm">{item.reason}</Text>
        </View>

        {/* Tags */}
        <View className="flex-row flex-wrap">
          {item.tags && Array.isArray(item.tags) && item.tags.map((tag, tagIndex) => (
            <View
              key={tagIndex}
              className="bg-gray-100 rounded-full px-3 py-1.5 mr-2 mb-2"
            >
              <Text className="text-gray-700 text-xs font-medium">{tag}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    ));
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        {/* Header */}
        <View className="bg-blue-900 rounded-b-3xl px-6 pt-12 pb-8 mb-4">
          <TouchableOpacity 
            className="mb-4"
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft color="#ffffff" size={24} strokeWidth={2} />
          </TouchableOpacity>
          
          <Text className="text-white text-3xl font-bold mb-2">
            Recommended For You
          </Text>
          <Text className="text-blue-200 text-base">
            Based on your profile and interests
          </Text>
        </View>

        <View className="px-6">
        {/* Tip Box */}
        <View className="bg-orange-50 border-l-4 border-orange-400 rounded-lg p-4 mb-5">
          <View className="flex-row items-start">
            <Lightbulb color="#f97316" size={20} strokeWidth={2} />
            <View className="flex-1 ml-2">
              <Text className="text-orange-900 font-semibold mb-1">Tip:</Text>
              <Text className="text-orange-800 text-sm">
                AI analyzed your profile and found these top matches for you.
              </Text>
            </View>
          </View>
        </View>

        {/* Loading State */}
        {loading && (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#1e3a8a" />
            <Text className="text-gray-600 mt-4">Finding your perfect matches...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-5">
            <Text className="text-red-900 font-semibold">Error</Text>
            <Text className="text-red-700 text-sm mt-1">{error}</Text>
            <TouchableOpacity 
              className="mt-3 bg-red-600 rounded-lg px-4 py-2"
              onPress={fetchRecommendations}
            >
              <Text className="text-white font-semibold text-center">Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Recommendations List */}
        {renderRecommendationsList()}

        {/* Action Buttons */}
        <View className="mb-6">
          <TouchableOpacity 
            className="bg-white border border-gray-300 rounded-xl py-4 mb-20"
            activeOpacity={0.8}
            onPress={() => router.push('/main/browse?category=internships')}
          >
            <Text className="text-gray-700 text-center font-semibold text-base">
              Browse All
            </Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav />
    </View>
  );
}