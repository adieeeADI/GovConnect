import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomStatusBar from '../components/CustomStatusBar';
import { ArrowLeft, MapPin, Clock, ArrowRight, Home as HomeIcon, Search, Star, User } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BottomNav from './bottom';

type Category = 'internships' | 'scholarships' | 'schemes' | 'training';

const categoryTitles = {
  internships: 'Government Internships',
  scholarships: 'Government Scholarships',
  schemes: 'Government Schemes',
  training: 'Training & Certification',
};

const categoryEndpoints = {
  internships: 'https://govconnect-ad4s.onrender.com/api/data/internships',
  scholarships: 'https://govconnect-ad4s.onrender.com/api/data/scholarships',
  schemes: 'https://govconnect-ad4s.onrender.com/api/data/schemes',
  training: 'https://govconnect-ad4s.onrender.com/api/data/training',
};

export default function Browse() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeCategory, setActiveCategory] = useState<Category>(
    (params.category as Category) || 'internships'
  );
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryData(activeCategory);
  }, [activeCategory]);

  const fetchCategoryData = async (category: Category) => {
    setLoading(true);
    try {
      const response = await fetch(categoryEndpoints[category]);
      const json = await response.json();
      setData(json);
    } catch (err) {
      console.log('Error fetching data:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSearchData = () => {
    let filtered = [...data];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.basicInfo?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.basicInfo?.providerName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const displayData = filterAndSearchData();
  const currentTitle = categoryTitles[activeCategory];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <CustomStatusBar />
      
      {/* Header */}
      <View className="bg-blue-900 rounded-b-3xl px-6 py-6 mb-4">
        <TouchableOpacity 
          className="mb-4"
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft color="#ffffff" size={24} strokeWidth={2} />
        </TouchableOpacity>
        <Text className="text-white text-base mb-1">Browse Opportunities</Text>
        <Text className="text-white text-2xl font-bold">{currentTitle}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Category Tabs */}
        <View className="mb-4">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingRight: 24 }}
          >
            <TouchableOpacity
              className={`px-4 py-2 rounded-full mr-2 ${
                activeCategory === 'internships' ? 'bg-blue-900' : 'bg-gray-300'
              }`}
              onPress={() => setActiveCategory('internships')}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-semibold ${
                activeCategory === 'internships' ? 'text-white' : 'text-gray-700'
              }`}>
                Internships
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`px-4 py-2 rounded-full mr-2 ${
                activeCategory === 'scholarships' ? 'bg-blue-900' : 'bg-gray-300'
              }`}
              onPress={() => setActiveCategory('scholarships')}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-semibold ${
                activeCategory === 'scholarships' ? 'text-white' : 'text-gray-700'
              }`}>
                Scholarships
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`px-4 py-2 rounded-full mr-2 ${
                activeCategory === 'schemes' ? 'bg-blue-900' : 'bg-gray-300'
              }`}
              onPress={() => setActiveCategory('schemes')}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-semibold ${
                activeCategory === 'schemes' ? 'text-white' : 'text-gray-700'
              }`}>
                Schemes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`px-4 py-2 rounded-full ${
                activeCategory === 'training' ? 'bg-blue-900' : 'bg-gray-300'
              }`}
              onPress={() => setActiveCategory('training')}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-semibold ${
                activeCategory === 'training' ? 'text-white' : 'text-gray-700'
              }`}>
                Training
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Search Bar */}
        <View className="px-6 mb-4">
          <TextInput
            className="bg-white border border-gray-300 rounded-2xl px-4 py-3 text-base"
            placeholder="Search Opportunities..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Tabs */}
        <View className="mb-4">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingRight: 24 }}
          >
            <TouchableOpacity
              className={`px-4 py-2 rounded-full mr-2 ${
                activeFilter === 'All' ? 'bg-blue-900' : 'bg-gray-300'
              }`}
              onPress={() => setActiveFilter('All')}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-semibold ${
                activeFilter === 'All' ? 'text-white' : 'text-gray-700'
              }`}>
                All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`px-4 py-2 rounded-full mr-2 ${
                activeFilter === 'Nearby' ? 'bg-blue-900' : 'bg-gray-300'
              }`}
              onPress={() => setActiveFilter('Nearby')}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-semibold ${
                activeFilter === 'Nearby' ? 'text-white' : 'text-gray-700'
              }`}>
                Nearby
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`px-4 py-2 rounded-full ${
                activeFilter === 'Trending' ? 'bg-blue-900' : 'bg-gray-300'
              }`}
              onPress={() => setActiveFilter('Trending')}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-semibold ${
                activeFilter === 'Trending' ? 'text-white' : 'text-gray-700'
              }`}>
                Trending
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Opportunity Cards */}
        <View className="px-6 mb-20">
          {loading ? (
            <View className="items-center py-12">
              <ActivityIndicator size="large" color="#1e3a8a" />
            </View>
          ) : displayData.length > 0 ? (
            displayData.map((item, index) => {
              const itemId = item._id ? item._id.toString() : (item.basicInfo?.title || `item-${index}`);
              return (
              <TouchableOpacity
                key={itemId}
                className="bg-white rounded-2xl p-4 mb-4 border border-gray-200"
                activeOpacity={0.8}
                onPress={() => {
                  console.log('Navigating with ID:', itemId);
                  router.push({
                    pathname: '/main/details/[id]',
                    params: { id: itemId }
                  });
                }}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <Text className="text-black text-lg font-bold flex-1">
                    {item.basicInfo?.title || 'Opportunity'}
                  </Text>
                  <ArrowRight color="#000000" size={24} strokeWidth={2} />
                </View>

                <Text className="text-gray-600 text-sm mb-3">
                  {item.basicInfo?.providerName || 'Provider'}
                </Text>

                <View className="flex-row items-center mb-2">
                  <MapPin color="#6b7280" size={16} strokeWidth={2} />
                  <Text className="text-gray-600 text-sm ml-1">
                    {item.internshipDetails?.location?.[0] || item.benefits?.covers?.[0] || 'Location'}
                  </Text>
                  <View className="mx-3 w-1 h-1 bg-gray-400 rounded-full" />
                  <Clock color="#6b7280" size={16} strokeWidth={2} />
                  <Text className="text-gray-600 text-sm ml-1">
                    {item.internshipDetails?.duration || item.applicationDetails?.endDate || 'Duration'}
                  </Text>
                </View>

                <View className={`self-start px-3 py-1 rounded-full bg-green-100`}>
                  <Text className="text-sm font-semibold text-green-700">
                    {item.internshipDetails?.stipend || item.benefits?.scholarshipAmount || 'Amount'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
            })
          ) : (
            <View className="items-center py-12">
              <Text className="text-gray-500 text-base">No opportunities found</Text>
            </View>
          )}
        </View>

        {/* Bottom padding for navigation bar */}
        <View className="h-20" />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav />
    </SafeAreaView>
  );
}