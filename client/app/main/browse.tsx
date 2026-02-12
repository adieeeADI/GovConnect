import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Clock, ArrowRight, Home as HomeIcon, Search, Star, User } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BottomNav from './bottom';

type Category = 'internships' | 'scholarships' | 'schemes' | 'training';

const categoryData = {
  internships: {
    title: 'Government Internships',
    items: [
      {
        id: 1,
        title: 'AI Research Internship',
        organization: 'Ministry of Science and Technology',
        location: 'Delhi',
        duration: '6 Months',
        stipend: '₹10,000/month',
      },
      {
        id: 2,
        title: 'Digital India Internship',
        organization: 'Ministry of IT',
        location: 'Bangalore',
        duration: '3 Months',
        stipend: '₹12,000/month',
      },
    ],
  },
  scholarships: {
    title: 'Government Scholarships',
    items: [
      {
        id: 1,
        title: 'Merit Scholarships',
        organization: 'Ministry of Education',
        location: 'All India',
        duration: '6 Months',
        stipend: '₹50,000/year',
      },
      {
        id: 2,
        title: 'SC/ST Scholarship',
        organization: 'Ministry of Social Justice',
        location: 'All India',
        duration: '3 Months',
        stipend: '₹75,000/year',
      },
    ],
  },
  schemes: {
    title: 'Government Schemes',
    items: [
      {
        id: 1,
        title: 'Startup India Scheme',
        organization: 'Ministry of Commerce',
        location: 'All India',
        duration: '12 Months',
        stipend: 'Funding Available',
      },
      {
        id: 2,
        title: 'Skill Development Scheme',
        organization: 'Ministry of Skill Development',
        location: 'All India',
        duration: '6 Months',
        stipend: 'Free Training',
      },
    ],
  },
  training: {
    title: 'Training & Certification',
    items: [
      {
        id: 1,
        title: 'Digital Marketing Certification',
        organization: 'NIELIT',
        location: 'Online',
        duration: '3 Months',
        stipend: 'Free',
      },
      {
        id: 2,
        title: 'Data Science Training',
        organization: 'NPTEL',
        location: 'Online',
        duration: '4 Months',
        stipend: 'Free',
      },
    ],
  },
};

export default function Browse() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeCategory, setActiveCategory] = useState<Category>(
    (params.category as Category) || 'internships'
  );
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const currentData = categoryData[activeCategory];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <StatusBar style="light" />
      
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
        <Text className="text-white text-2xl font-bold">{currentData.title}</Text>
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
          {currentData.items.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="bg-white rounded-2xl p-4 mb-4 border border-gray-200"
              activeOpacity={0.8}
              // onPress={() => {
              //   router.push({
              //     pathname: '/main/details/[id]' as any,
              //     params: {
              //       id: item.id,
              //       category: activeCategory,
              //       title: item.title,
              //       organization: item.organization,
              //       location: item.location,
              //       duration: item.duration,
              //       stipend: item.stipend,
              //     }
              //   });
              // }}
            >
              <View className="flex-row items-start justify-between mb-2">
                <Text className="text-black text-lg font-bold flex-1">
                  {item.title}
                </Text>
                <ArrowRight color="#000000" size={24} strokeWidth={2} />
              </View>

              <Text className="text-gray-600 text-sm mb-3">
                {item.organization}
              </Text>

              <View className="flex-row items-center mb-2">
                <MapPin color="#6b7280" size={16} strokeWidth={2} />
                <Text className="text-gray-600 text-sm ml-1">{item.location}</Text>
                <View className="mx-3 w-1 h-1 bg-gray-400 rounded-full" />
                <Clock color="#6b7280" size={16} strokeWidth={2} />
                <Text className="text-gray-600 text-sm ml-1">{item.duration}</Text>
              </View>

              <View className={`self-start px-3 py-1 rounded-full ${
                activeCategory === 'scholarships' ? 'bg-blue-100' : 'bg-green-100'
              }`}>
                <Text className={`text-sm font-semibold ${
                  activeCategory === 'scholarships' ? 'text-blue-700' : 'text-green-700'
                }`}>
                  {item.stipend}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom padding for navigation bar */}
        <View className="h-20" />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav />
    </SafeAreaView>
  );
}