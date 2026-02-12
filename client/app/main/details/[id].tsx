import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Clock, Wallet, Check, Gift, ExternalLink } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Sample detailed data - in production, this would come from an API
const opportunityDetails: Record<string, any> = {
  '1_internships': {
    description: 'Join our AI research team to work on cutting-edge machine learning projects that impact government services.',
    matchReason: 'Your Python skills and interest in AI align perfectly with this role. High priority match!',
    matchPercentage: 95,
    highlights: [
      'Work with leading AI researchers',
      'Certificate upon completion',
      'Mentorship from industry experts',
      'Potential for permanent role',
    ],
    requirements: [
      'Bachelor\'s degree in Computer Science or related field',
      'Knowledge of Python and ML libraries',
      'Strong problem-solving skills',
      'Good communication abilities',
    ],
    benefits: [
      'Monthly stipend of ₹10,000',
      'Free skill development courses',
      'Industry recognition certificate',
      'Networking opportunities',
    ],
    eligibility: {
      age: '18-28 years',
      education: 'Bachelor\'s degree',
      location: 'Delhi',
      category: 'Technology',
    },
    posted: '2 days ago',
    applications: '234+',
  },
  '2_internships': {
    description: 'Work on India\'s digital transformation initiatives and contribute to building citizen-centric digital solutions.',
    matchReason: 'Your web development skills match perfectly with our requirements!',
    matchPercentage: 88,
    highlights: [
      'Work on national-level projects',
      'Hands-on experience with modern tech stack',
      'Direct impact on millions of citizens',
      'PPO opportunities available',
    ],
    requirements: [
      'Knowledge of web technologies (React, Node.js)',
      'Understanding of APIs and databases',
      'Team collaboration skills',
      'Passion for civic tech',
    ],
    benefits: [
      'Monthly stipend of ₹12,000',
      'Flexible work hours',
      'Certificate of completion',
      'Career guidance sessions',
    ],
    eligibility: {
      age: '18-30 years',
      education: 'Any degree',
      location: 'Bangalore',
      category: 'Technology',
    },
    posted: '5 days ago',
    applications: '189+',
  },
  // Add more details for other categories as needed
  '1_scholarships': {
    description: 'Financial assistance for meritorious students to pursue higher education without financial constraints.',
    matchReason: 'Your academic performance qualifies you for this merit-based scholarship!',
    matchPercentage: 92,
    highlights: [
      'Full tuition coverage',
      'Living expenses included',
      'Books and study materials',
      'Mentorship program access',
    ],
    requirements: [
      'Minimum 80% marks in previous degree',
      'Enrolled in recognized institution',
      'Annual family income below ₹8 lakhs',
      'Indian citizenship required',
    ],
    benefits: [
      'Annual scholarship of ₹50,000',
      'One-time book allowance',
      'Access to career counseling',
      'Priority for government jobs',
    ],
    eligibility: {
      age: '18-25 years',
      education: 'Undergraduate/Graduate',
      location: 'All India',
      category: 'Education',
    },
    posted: '1 week ago',
    applications: '567+',
  },
};

export default function Individual() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const {
    id,
    category,
    title,
    organization,
    location,
    duration,
    stipend,
  } = params;

  // Get detailed data based on id and category
  const detailKey = `${id}_${category}`;
  const details = opportunityDetails[detailKey] || opportunityDetails['1_internships'];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-blue-900 rounded-b-3xl px-6 py-6 mb-6">
          <TouchableOpacity 
            className="mb-4"
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft color="#ffffff" size={24} strokeWidth={2} />
          </TouchableOpacity>

          <View className="flex-row items-start justify-between mb-4">
            <View className="flex-1">
              <Text className="text-white text-3xl font-bold mb-2">
                {title}
              </Text>
              <Text className="text-white text-base opacity-90">
                {organization}
              </Text>
            </View>

            <View className="bg-white/20 rounded-2xl px-4 py-3 items-center">
              <Text className="text-white text-2xl font-bold">{details.matchPercentage}%</Text>
              <Text className="text-white text-xs">Match</Text>
            </View>
          </View>

          {/* Info Pills */}
          <View className="flex-row flex-wrap gap-2">
            <View className="bg-white/20 rounded-full px-4 py-2 flex-row items-center">
              <MapPin color="#ffffff" size={16} strokeWidth={2} />
              <Text className="text-white text-sm ml-1">{location}</Text>
            </View>

            <View className="bg-white/20 rounded-full px-4 py-2 flex-row items-center">
              <Clock color="#ffffff" size={16} strokeWidth={2} />
              <Text className="text-white text-sm ml-1">{duration}</Text>
            </View>

            <View className="bg-white/20 rounded-full px-4 py-2 flex-row items-center">
              <Wallet color="#ffffff" size={16} strokeWidth={2} />
              <Text className="text-white text-sm ml-1">{stipend}</Text>
            </View>
          </View>
        </View>

        <View className="px-6">
          {/* About This Opportunity */}
          <Text className="text-black text-xl font-bold mb-3">
            About This Opportunity
          </Text>
          <Text className="text-gray-600 text-base leading-6 mb-6">
            {details.description}
          </Text>

          {/* Why You're Matched */}
          <View className="bg-green-50 border-l-4 border-green-600 rounded-lg p-4 mb-6">
            <Text className="text-green-900 text-base font-bold mb-2">
              Why You're Matched
            </Text>
            <Text className="text-green-800 text-sm leading-5">
              {details.matchReason}
            </Text>
          </View>

          {/* Key Highlights */}
          <Text className="text-black text-xl font-bold mb-3">
            Key Highlights
          </Text>
          <View className="mb-6">
            {details.highlights.map((highlight: string, index: number) => (
              <View key={index} className="flex-row items-start mb-3">
                <Check color="#10b981" size={20} strokeWidth={2} />
                <Text className="text-gray-700 text-base ml-3 flex-1">
                  {highlight}
                </Text>
              </View>
            ))}
          </View>

          {/* Requirements */}
          <Text className="text-black text-xl font-bold mb-3">
            Requirements
          </Text>
          <View className="mb-6">
            {details.requirements.map((requirement: string, index: number) => (
              <View key={index} className="flex-row items-start mb-2">
                <Text className="text-gray-700 text-base">• </Text>
                <Text className="text-gray-700 text-base flex-1">
                  {requirement}
                </Text>
              </View>
            ))}
          </View>

          {/* Benefits & Perks */}
          <Text className="text-black text-xl font-bold mb-3">
            Benefits & Perks
          </Text>
          <View className="mb-6">
            {details.benefits.map((benefit: string, index: number) => (
              <View key={index} className="bg-blue-50 rounded-xl p-4 flex-row items-center mb-3">
                <Gift color="#3b82f6" size={24} strokeWidth={2} />
                <Text className="text-gray-800 text-base ml-3 flex-1">
                  {benefit}
                </Text>
              </View>
            ))}
          </View>

          {/* Eligibility */}
          <Text className="text-black text-xl font-bold mb-3">
            Eligibility
          </Text>
          <View className="flex-row flex-wrap mb-6">
            <View className="w-[48%] bg-gray-100 rounded-xl p-4 mr-[4%] mb-3">
              <Text className="text-gray-500 text-sm mb-1">AGE</Text>
              <Text className="text-black text-base font-semibold">{details.eligibility.age}</Text>
            </View>
            <View className="w-[48%] bg-gray-100 rounded-xl p-4 mb-3">
              <Text className="text-gray-500 text-sm mb-1">EDUCATION</Text>
              <Text className="text-black text-base font-semibold">{details.eligibility.education}</Text>
            </View>
            <View className="w-[48%] bg-gray-100 rounded-xl p-4 mr-[4%]">
              <Text className="text-gray-500 text-sm mb-1">LOCATION</Text>
              <Text className="text-black text-base font-semibold">{details.eligibility.location}</Text>
            </View>
            <View className="w-[48%] bg-gray-100 rounded-xl p-4">
              <Text className="text-gray-500 text-sm mb-1">CATEGORY</Text>
              <Text className="text-black text-base font-semibold">{details.eligibility.category}</Text>
            </View>
          </View>

          {/* Application Info */}
          <View className="mb-6">
            <Text className="text-gray-500 text-sm mb-1">Posted: {details.posted}</Text>
            <Text className="text-gray-500 text-sm">Applications: {details.applications}</Text>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity 
            className="bg-blue-900 rounded-2xl py-4 items-center mb-3"
            activeOpacity={0.8}
          >
            <Text className="text-white text-lg font-bold">
              Apply
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-white border-2 border-blue-900 rounded-2xl py-4 items-center mb-8 flex-row justify-center"
            activeOpacity={0.8}
          >
            <Text className="text-blue-900 text-lg font-semibold mr-2">
              View on Official Portal
            </Text>
            <ExternalLink color="#1e3a8a" size={20} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}