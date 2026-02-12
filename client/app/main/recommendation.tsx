import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Lightbulb, Home as HomeIcon, Search, Star, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import BottomNav from './bottom';

const recommendations = [
  {
    id: 1,
    title: 'AI Research Internship',
    organization: 'Ministry of Science & Technology',
    location: 'Delhi',
    duration: '6 Months',
    stipend: '₹10,000/month',
    match: 95,
    reason: 'Matches your Python skills and AI interests',
    tags: ['AI', 'Research', 'Delhi'],
    category: 'internships',
  },
  {
    id: 2,
    title: 'Digital India Development Program',
    organization: 'Ministry of Electronics & IT',
    location: 'Bangalore',
    duration: '3 Months',
    stipend: '₹12,000/month',
    match: 88,
    reason: 'Aligns with your tech background',
    tags: ['Tech', 'Development', 'Bangalore'],
    category: 'internships',
  },
  {
    id: 1,
    title: 'Data Science Scholarship',
    organization: 'Ministry of Education',
    location: 'Online',
    duration: '6 Months',
    stipend: '₹50,000/year',
    match: 85,
    reason: 'Perfect for your analytical skills',
    tags: ['Data Science', 'Scholarship', 'Online'],
    category: 'scholarships',
  },
  {
    id: 4,
    title: 'Skill India Certification - ML',
    organization: 'Skill India (NSDC)',
    location: 'Online',
    duration: '3 Months',
    stipend: 'Free',
    match: 82,
    reason: 'Enhances career prospects',
    tags: ['ML', 'Certification', 'Free'],
    highlighted: true,
    category: 'training',
  },
  {
    id: 5,
    title: 'Government Tech Trainee',
    organization: 'NIC - Digital Initiative',
    location: 'Delhi',
    duration: '6 Months',
    stipend: '₹8,000/month',
    match: 78,
    reason: 'Requires your core skills',
    tags: ['Training', 'Government', 'Delhi'],
    category: 'training',
  },
];

const getMatchColor = (match: number) => {
  if (match >= 90) return 'text-green-500';
  if (match >= 85) return 'text-blue-500';
  if (match >= 80) return 'text-blue-600';
  return 'text-orange-500';
};

export default function Recommendation() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'bottom']}>
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
        
        <Text className="text-white text-3xl font-bold mb-2">
          Recommended For You
        </Text>
        <Text className="text-blue-200 text-base">
          Based on your profile and interests
        </Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        className="flex-1 px-6"
      >
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

        {/* Recommendations List */}
        {recommendations.map((item, index) => (
          <TouchableOpacity
            key={`${item.category}-${item.id}-${index}`}
            className={`bg-white rounded-xl p-4 mb-4 ${
              item.highlighted ? 'border-2 border-blue-500' : 'border border-gray-200'
            }`}
            activeOpacity={0.8}
            onPress={() => {
              router.push({
                pathname: '/main/details/[id]' as any,
                params: {
                  id: item.id,
                  category: item.category,
                  title: item.title,
                  organization: item.organization,
                  location: item.location,
                  duration: item.duration,
                  stipend: item.stipend,
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
              {item.tags.map((tag, tagIndex) => (
                <View
                  key={tagIndex}
                  className="bg-gray-100 rounded-full px-3 py-1.5 mr-2 mb-2"
                >
                  <Text className="text-gray-700 text-xs font-medium">{tag}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}

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
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav />
    </SafeAreaView>
  );
}