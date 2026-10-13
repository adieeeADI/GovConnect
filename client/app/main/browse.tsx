import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, BackHandler } from 'react-native';
import { ArrowLeft, MapPin, Clock, ArrowRight } from 'lucide-react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { API_ENDPOINTS, getDataCategoryEndpoint } from '../../config/api.config';
import BottomNav from './bottom';
import { useTranslation } from '../../utils/i18n';
import { goBackWithinApp } from '../../utils/navigation';
import TranslatedText from '../../components/TranslatedText';

type Category = 'internships' | 'scholarships' | 'schemes' | 'training';

export default function Browse() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t, language } = useTranslation();

  const [activeCategory, setActiveCategory] = useState<Category>(
    (params.category as Category) || 'internships'
  );
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getCategoryTitle = (cat: Category) => {
    switch (cat) {
      case 'internships': return t('internships');
      case 'scholarships': return t('scholarships');
      case 'schemes': return t('schemes');
      case 'training': return t('training');
      default: return t('internships');
    }
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch(getDataCategoryEndpoint(activeCategory, language))
      .then((res) => res.json())
      .then((json) => {
        if (isMounted) {
          setData(Array.isArray(json) ? json : []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setData([]);
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [activeCategory, language]);

  // Prevent back navigation
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

  const filterAndSearchData = () => {
    let filtered = [...data];

    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.basicInfo?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.basicInfo?.providerName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const displayData = filterAndSearchData();

  const handleCategoryChange = (cat: Category) => {
    if (activeCategory !== cat) {
      setLoading(true);
      setActiveCategory(cat);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-blue-900 rounded-b-3xl px-6 pt-12 pb-8 mb-4">
          <TouchableOpacity 
            className="mb-4"
            onPress={() => goBackWithinApp(router)}
            activeOpacity={0.7}
          >
            <ArrowLeft color="#ffffff" size={24} strokeWidth={2} />
          </TouchableOpacity>
          <Text className="text-white text-base mb-1">{t('nav_browse')}</Text>
          <Text className="text-white text-2xl font-bold">{getCategoryTitle(activeCategory)}</Text>
        </View>

        {/* Category Tabs */}
        <View className="mb-4">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingRight: 24 }}
          >
            <TouchableOpacity
              className={`px-4 py-2 rounded-full mr-2 ${
                activeCategory === 'internships' ? 'bg-blue-900' : 'bg-gray-200'
              }`}
              onPress={() => handleCategoryChange('internships')}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-semibold ${
                activeCategory === 'internships' ? 'text-white' : 'text-gray-700'
              }`}>
                {t('internships')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`px-4 py-2 rounded-full mr-2 ${
                activeCategory === 'scholarships' ? 'bg-blue-900' : 'bg-gray-200'
              }`}
              onPress={() => handleCategoryChange('scholarships')}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-semibold ${
                activeCategory === 'scholarships' ? 'text-white' : 'text-gray-700'
              }`}>
                {t('scholarships')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`px-4 py-2 rounded-full mr-2 ${
                activeCategory === 'schemes' ? 'bg-blue-900' : 'bg-gray-200'
              }`}
              onPress={() => handleCategoryChange('schemes')}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-semibold ${
                activeCategory === 'schemes' ? 'text-white' : 'text-gray-700'
              }`}>
                {t('schemes')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`px-4 py-2 rounded-full ${
                activeCategory === 'training' ? 'bg-blue-900' : 'bg-gray-200'
              }`}
              onPress={() => handleCategoryChange('training')}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-semibold ${
                activeCategory === 'training' ? 'text-white' : 'text-gray-700'
              }`}>
                {t('training')}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Search Bar */}
        <View className="px-6 mb-4">
          <TextInput
            className="bg-white border border-gray-300 rounded-2xl px-4 py-3 text-base"
            placeholder={t('search_placeholder')}
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
                activeFilter === 'All' ? 'bg-blue-900' : 'bg-gray-200'
              }`}
              onPress={() => setActiveFilter('All')}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-semibold ${
                activeFilter === 'All' ? 'text-white' : 'text-gray-700'
              }`}>
                {t('all')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`px-4 py-2 rounded-full mr-2 ${
                activeFilter === 'Nearby' ? 'bg-blue-900' : 'bg-gray-200'
              }`}
              onPress={() => setActiveFilter('Nearby')}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-semibold ${
                activeFilter === 'Nearby' ? 'text-white' : 'text-gray-700'
              }`}>
                {t('nearby')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`px-4 py-2 rounded-full ${
                activeFilter === 'Trending' ? 'bg-blue-900' : 'bg-gray-200'
              }`}
              onPress={() => setActiveFilter('Trending')}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-semibold ${
                activeFilter === 'Trending' ? 'text-white' : 'text-gray-700'
              }`}>
                {t('trending')}
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
              const itemId = item._id ? item._id.toString() : `temp-${index}`;
              return (
              <TouchableOpacity
                key={itemId}
                className="bg-white rounded-2xl p-4 mb-4 border border-gray-200"
                activeOpacity={0.8}
                onPress={() => {
                  router.push({
                    pathname: '/main/details/[id]',
                    params: { id: itemId, category: activeCategory }
                  });
                }}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <TranslatedText 
                    text={item.basicInfo?.title || t('opportunity')} 
                    className="text-black text-lg font-bold flex-1" 
                  />
                  <ArrowRight color="#000000" size={24} strokeWidth={2} />
                </View>

                <TranslatedText 
                  text={item.basicInfo?.providerName || t('provider')} 
                  className="text-gray-600 text-sm mb-3" 
                />

                <View className="flex-row items-center mb-2">
                  <MapPin color="#6b7280" size={16} strokeWidth={2} />
                  <TranslatedText 
                    text={item.internshipDetails?.location?.[0] || item.benefits?.covers?.[0] || t('location')} 
                    className="text-gray-600 text-sm ml-1" 
                  />
                  <View className="mx-3 w-1 h-1 bg-gray-400 rounded-full" />
                  <Clock color="#6b7280" size={16} strokeWidth={2} />
                  <TranslatedText 
                    text={item.internshipDetails?.duration || item.applicationDetails?.endDate || t('duration')} 
                    className="text-gray-600 text-sm ml-1" 
                  />
                </View>

                <View className={`self-start px-3 py-1 rounded-full bg-green-100`}>
                  <TranslatedText 
                    text={item.internshipDetails?.stipend || item.benefits?.scholarshipAmount || t('amount')} 
                    className="text-sm font-semibold text-green-700" 
                  />
                </View>
              </TouchableOpacity>
            );
            })
          ) : (
            <View className="items-center py-12">
              <Text className="text-gray-500 text-base">{t('no_opportunities_found')}</Text>
            </View>
          )}
        </View>

        {/* Bottom padding for navigation bar */}
        <View className="h-20" />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav />
    </View>
  );
}