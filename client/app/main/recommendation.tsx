import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomStatusBar from '../components/CustomStatusBar';
import { ArrowLeft, MapPin, Lightbulb } from 'lucide-react-native';
import { useRouter } from 'expo-router';
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

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch("http://192.168.1.100:5000/api/recommend/YOUR_USER_ID");
        const data = await res.json();

        setRecommendations(data);
      } catch (err) {
        console.log(err);
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
        <ActivityIndicator size="large" />
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