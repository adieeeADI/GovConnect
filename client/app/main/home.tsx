import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Home as HomeIcon, Search, Star, User, Sparkles, FolderOpen, Building2, GraduationCap, FileText, Award } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import BottomNav from './bottom';

export default function Home() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <StatusBar style="light" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header */}
        <View className="bg-blue-900 rounded-b-3xl px-6 py-6 mb-4">
          <Text className="text-white text-lg mb-1">Welcome Back</Text>
          <Text className="text-white text-3xl font-bold mb-2">Soham Shelar</Text>
          <Text className="text-white text-sm">Ready to find out your next opportunity?</Text>
        </View>

        {/* Profile Status Card */}
        <View className="mx-6 mb-6">
          <View className="bg-red-600 rounded-2xl p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white text-base font-bold">
                Ready to find out your next opportunity?
              </Text>
            </View>
            <View className="h-2 bg-white rounded-full overflow-hidden">
              <View className="h-full bg-red-800 rounded-full" style={{ width: '100%' }} />
            </View>
            <Text className="text-white text-xs mt-2">
              Your profile is fully optimized for recommendation
            </Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View className="flex-row justify-between px-6 mb-6">
          <View className="flex-1 bg-blue-100 rounded-2xl p-4 mr-2 items-center">
            <Text className="text-blue-900 text-3xl font-bold">5</Text>
            <Text className="text-blue-900 text-xs font-semibold text-center">Recommendation</Text>
          </View>
          <View className="flex-1 bg-purple-100 rounded-2xl p-4 mx-2 items-center">
            <Text className="text-purple-900 text-3xl font-bold">12</Text>
            <Text className="text-purple-900 text-xs font-semibold text-center">Opportunity</Text>
          </View>
          <View className="flex-1 bg-teal-100 rounded-2xl p-4 ml-2 items-center">
            <Text className="text-teal-900 text-3xl font-bold">8</Text>
            <Text className="text-teal-900 text-xs font-semibold text-center">Applied</Text>
          </View>
        </View>

        {/* Find your Opportunity */}
        <Text className="text-black text-xl font-bold px-6 mb-4">
          Find your Opportunity
        </Text>

        {/* AI Recommendation Card */}
        <TouchableOpacity 
          className="bg-blue-900 rounded-2xl p-5 mx-6 mb-4 flex-row items-center justify-between"
          activeOpacity={0.8}
          // onPress={() => router.push('/main/recommendation')}
        >
          <View className="flex-1">
            <Text className="text-white text-xl font-bold mb-1">
              AI Recommendation
            </Text>
            <Text className="text-white text-sm">
              Top 5 Opportunities for you
            </Text>
          </View>
          <Sparkles color="#ffffff" size={48} strokeWidth={2} />
        </TouchableOpacity>

        {/* Browse all Opportunity Card */}
        <TouchableOpacity 
          className="bg-red-600 rounded-2xl p-5 mx-6 mb-6 flex-row items-center justify-between"
          activeOpacity={0.8}
          onPress={() => router.push('/main/browse?category=internships')}
        >
          <View className="flex-1">
            <Text className="text-white text-xl font-bold mb-1">
              Browse all Opportunity
            </Text>
            <Text className="text-white text-sm">
              Search By Category
            </Text>
          </View>
          <FolderOpen color="#ffffff" size={48} strokeWidth={2} />
        </TouchableOpacity>

        {/* Browse Categories */}
        <Text className="text-black text-xl font-bold px-6 mb-4">
          Browse Categories
        </Text>

        <View className="px-6 mb-6">
          <View className="flex-row mb-4">
            {/* Government Internship */}
            <TouchableOpacity 
              className="flex-1 bg-gray-100 rounded-2xl p-6 mr-2 items-center"
              activeOpacity={0.8}
              onPress={() => router.push('/main/browse?category=internships')}
            >
              <Building2 color="#ef4444" size={48} strokeWidth={1.5} />
              <Text className="text-black text-sm font-bold text-center mt-3">
                Government{'\n'}Internship
              </Text>
            </TouchableOpacity>

            {/* Scholarship */}
            <TouchableOpacity 
              className="flex-1 bg-gray-100 rounded-2xl p-6 ml-2 items-center"
              activeOpacity={0.8}
              onPress={() => router.push('/main/browse?category=scholarships')}
            >
              <GraduationCap color="#000000" size={48} strokeWidth={1.5} />
              <Text className="text-black text-sm font-bold text-center mt-3">
                Scholarship
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row mb-4">
            {/* Government Scheme */}
            <TouchableOpacity 
              className="flex-1 bg-gray-100 rounded-2xl p-6 mr-2 items-center"
              activeOpacity={0.8}
              onPress={() => router.push('/main/browse?category=schemes')}
            >
              <FileText color="#10b981" size={48} strokeWidth={1.5} />
              <Text className="text-black text-sm font-bold text-center mt-3">
                Government{'\n'}Scheme
              </Text>
            </TouchableOpacity>

            {/* Training & Certification */}
            <TouchableOpacity 
              className="flex-1 bg-gray-100 rounded-2xl p-6 ml-2 items-center"
              activeOpacity={0.8}
              onPress={() => router.push('/main/browse?category=training')}
            >
              <Award color="#3b82f6" size={48} strokeWidth={1.5} />
              <Text className="text-black text-sm font-bold text-center mt-3">
                Training &{'\n'}Certification
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* New Opportunity Alert */}
        <View className="bg-blue-100 rounded-2xl p-4 mx-6 mb-6">
          <Text className="text-blue-900 text-base font-bold mb-1">
            New Opportunity Alert
          </Text>
          <Text className="text-blue-800 text-sm">
            2 new internships matching your profile match. Check recommendations.
          </Text>
        </View>

        {/* Bottom padding for navigation bar */}
        <View className="h-20" />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav />
    </SafeAreaView>
  );
}