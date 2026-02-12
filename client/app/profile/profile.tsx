import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mail, Phone, MapPin, Bell, Lock, Globe, Home as HomeIcon, Search, Star, User as UserIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import BottomNav from 'app/main/bottom';

export default function Profile() {
  const router = useRouter();

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

        {/* Profile Header */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            {/* Avatar */}
            <View className="w-20 h-20 rounded-full bg-gray-400 items-center justify-center mr-4">
              <UserIcon color="#ffffff" size={40} strokeWidth={2} />
            </View>
            
            {/* Name and Location */}
            <View className="flex-1">
              <Text className="text-white text-2xl font-bold mb-1">
                Soham Shelar
              </Text>
              <Text className="text-blue-200 text-sm">
                Mumbai, Maharashtra
              </Text>
            </View>
          </View>

          {/* Edit Button */}
          <TouchableOpacity 
            className="bg-white/20 rounded-full px-5 py-2"
            activeOpacity={0.7}
            onPress={() => router.push('/profile/edit')}
          >
            <Text className="text-white font-semibold text-sm">Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        {/* Stats Cards */}
        <View className="flex-row justify-between px-6 mb-6">
          <View className="flex-1 bg-blue-100 rounded-2xl p-4 mr-2 items-center">
            <Text className="text-blue-900 text-3xl font-bold">3</Text>
            <Text className="text-blue-900 text-xs font-semibold text-center">Applied</Text>
          </View>
          <View className="flex-1 bg-purple-100 rounded-2xl p-4 mx-2 items-center">
            <Text className="text-purple-900 text-3xl font-bold">8</Text>
            <Text className="text-purple-900 text-xs font-semibold text-center">Saved</Text>
          </View>
          <View className="flex-1 bg-green-100 rounded-2xl p-4 ml-2 items-center">
            <Text className="text-green-900 text-3xl font-bold">5</Text>
            <Text className="text-green-900 text-xs font-semibold text-center">For You</Text>
          </View>
        </View>

        {/* Contact Information */}
        <View className="px-6 mb-6">
          <Text className="text-black text-xl font-bold mb-4">
            Contact Information
          </Text>

          {/* Email */}
          <View className="bg-gray-100 rounded-2xl p-4 mb-3 flex-row items-center">
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
              <Mail color="#1e3a8a" size={20} strokeWidth={2} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs mb-1">Email</Text>
              <Text className="text-black text-sm font-semibold">
                rajesh.kumar@email.com
              </Text>
            </View>
          </View>

          {/* Phone */}
          <View className="bg-gray-100 rounded-2xl p-4 mb-3 flex-row items-center">
            <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
              <Phone color="#7c3aed" size={20} strokeWidth={2} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs mb-1">Phone</Text>
              <Text className="text-black text-sm font-semibold">
                +91 98765 43210
              </Text>
            </View>
          </View>

          {/* Location */}
          <View className="bg-gray-100 rounded-2xl p-4 flex-row items-center">
            <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
              <MapPin color="#ef4444" size={20} strokeWidth={2} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs mb-1">Location</Text>
              <Text className="text-black text-sm font-semibold">
                Mumbai, Maharashtra
              </Text>
            </View>
          </View>
        </View>

        {/* Education & Skills */}
        <View className="px-6 mb-6">
          <Text className="text-black text-xl font-bold mb-4">
            Education & Skills
          </Text>

          {/* Education */}
          <View className="bg-gray-100 rounded-2xl p-4 mb-4">
            <Text className="text-gray-500 text-xs mb-2">Education</Text>
            <Text className="text-black text-base font-semibold">
              Bachelor's in Computer Science
            </Text>
          </View>

          {/* Skills */}
          <Text className="text-gray-700 text-sm font-semibold mb-3">Skills</Text>
          <View className="flex-row flex-wrap mb-4">
            <View className="bg-blue-100 rounded-full px-4 py-2 mr-2 mb-2">
              <Text className="text-blue-900 text-sm font-semibold">Python</Text>
            </View>
            <View className="bg-blue-100 rounded-full px-4 py-2 mr-2 mb-2">
              <Text className="text-blue-900 text-sm font-semibold">Data Analysis</Text>
            </View>
            <View className="bg-blue-100 rounded-full px-4 py-2 mr-2 mb-2">
              <Text className="text-blue-900 text-sm font-semibold">Machine Learning</Text>
            </View>
            <View className="bg-blue-100 rounded-full px-4 py-2 mb-2">
              <Text className="text-blue-900 text-sm font-semibold">Communication</Text>
            </View>
          </View>

          {/* Interests */}
          <Text className="text-gray-700 text-sm font-semibold mb-3">Interests</Text>
          <View className="flex-row flex-wrap">
            <View className="bg-orange-100 rounded-full px-4 py-2 mr-2 mb-2">
              <Text className="text-orange-700 text-sm font-semibold">Technology</Text>
            </View>
            <View className="bg-orange-100 rounded-full px-4 py-2 mr-2 mb-2">
              <Text className="text-orange-700 text-sm font-semibold">AI/ML</Text>
            </View>
            <View className="bg-orange-100 rounded-full px-4 py-2 mb-2">
              <Text className="text-orange-700 text-sm font-semibold">Finance</Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View className="px-6 mb-6">
          <Text className="text-black text-xl font-bold mb-4">
            Settings
          </Text>

          {/* Notifications */}
          <TouchableOpacity 
            className="bg-white rounded-2xl p-4 mb-3 flex-row items-center justify-between border border-gray-200"
            activeOpacity={0.7}
            onPress={() => router.push('/profile/notifications')}
          >
            <Text className="text-black text-base font-semibold">Notifications</Text>
            <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center">
              <Bell color="#f97316" size={20} strokeWidth={2} />
            </View>
          </TouchableOpacity>

          {/* Privacy & Security */}
          <TouchableOpacity 
            className="bg-white rounded-2xl p-4 mb-3 flex-row items-center justify-between border border-gray-200"
            activeOpacity={0.7}
            onPress={() => router.push('/profile/privacy')}
          >
            <Text className="text-black text-base font-semibold">Privacy & Security</Text>
            <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center">
              <Lock color="#f97316" size={20} strokeWidth={2} />
            </View>
          </TouchableOpacity>

          {/* Language Preferences */}
          <TouchableOpacity 
            className="bg-white rounded-2xl p-4 mb-4 flex-row items-center justify-between border border-gray-200"
            activeOpacity={0.7}
            onPress={() => router.push('/profile/language')}
          >
            <Text className="text-black text-base font-semibold">Language Preferences</Text>
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
              <Globe color="#3b82f6" size={20} strokeWidth={2} />
            </View>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity 
            className="bg-white rounded-2xl p-4 border-2 border-red-500"
            activeOpacity={0.7}
          >
            <Text className="text-red-600 text-center text-base font-bold">
              Logout
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom padding for navigation bar */}
        <View className="h-20" />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav />
    </SafeAreaView>
  );
}