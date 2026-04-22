import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomStatusBar from '../components/CustomStatusBar';
import { ArrowLeft, Mail, Phone, MapPin, Bell, Lock, Globe, User as UserIcon } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNav from 'app/main/bottom';
import ProfileCompleteBanner from './ProfileCompleteBanner';

// All fields that count toward completion
function getCompletionPercentage(data: Record<string, any>): number {
  const checks = [
    !!data.fullName,
    !!data.email,
    !!data.phone,
    !!data.location,
    !!data.education,
    Array.isArray(data.skills) && data.skills.length > 0,
    Array.isArray(data.interests) && data.interests.length > 0,
    !!data.dateOfBirth,
    !!data.gender,
    !!data.state,
    !!data.caste,
    !!data.religion,
    !!data.familyIncome,
    !!data.category,
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const res = await fetch(`https://govconnect-ad4s.onrender.com/api/auth/user/${userId}`);
      const data = await res.json();
      setUser(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch every time screen comes into focus (after EditProfile saves)
  useFocusEffect(useCallback(() => { loadUser(); }, []));

  const completionPercentage = getCompletionPercentage(user);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#1e3a8a" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <CustomStatusBar />

      {/* Header */}
      <View className="bg-blue-900 rounded-b-3xl px-6 py-6 mb-4">
        <TouchableOpacity className="mb-4" onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft color="#ffffff" size={24} strokeWidth={2} />
        </TouchableOpacity>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="w-20 h-20 rounded-full bg-gray-400 items-center justify-center mr-4">
              <UserIcon color="#ffffff" size={40} strokeWidth={2} />
            </View>
            <View className="flex-1">
              <Text className="text-white text-2xl font-bold mb-1">
                {user.fullName || 'Your Name'}
              </Text>
              <Text className="text-blue-200 text-sm">
                {user.location || 'Location not set'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            className="bg-white/20 rounded-full px-5 py-2"
            activeOpacity={0.7}
            onPress={() => router.push('/profile/edit')}
          >
            <Text className="text-white font-semibold text-sm">Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">

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

        {/* ✅ Real completion % from API data */}
        <ProfileCompleteBanner completionPercentage={completionPercentage} />

        {/* Contact Information */}
        <View className="px-6 mb-6">
          <Text className="text-black text-xl font-bold mb-4">Contact Information</Text>

          <View className="bg-gray-100 rounded-2xl p-4 mb-3 flex-row items-center">
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
              <Mail color="#1e3a8a" size={20} strokeWidth={2} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs mb-1">Email</Text>
              <Text className="text-black text-sm font-semibold">{user.email || '—'}</Text>
            </View>
          </View>

          <View className="bg-gray-100 rounded-2xl p-4 mb-3 flex-row items-center">
            <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
              <Phone color="#7c3aed" size={20} strokeWidth={2} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs mb-1">Phone</Text>
              <Text className="text-black text-sm font-semibold">{user.phone || '—'}</Text>
            </View>
          </View>

          <View className="bg-gray-100 rounded-2xl p-4 flex-row items-center">
            <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
              <MapPin color="#ef4444" size={20} strokeWidth={2} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs mb-1">Location</Text>
              <Text className="text-black text-sm font-semibold">{user.location || '—'}</Text>
            </View>
          </View>
        </View>

        {/* Education & Skills */}
        <View className="px-6 mb-6">
          <Text className="text-black text-xl font-bold mb-4">Education & Skills</Text>

          <View className="bg-gray-100 rounded-2xl p-4 mb-4">
            <Text className="text-gray-500 text-xs mb-2">Education</Text>
            <Text className="text-black text-base font-semibold">{user.education || '—'}</Text>
          </View>

          {user.skills?.length > 0 && (
            <>
              <Text className="text-gray-700 text-sm font-semibold mb-3">Skills</Text>
              <View className="flex-row flex-wrap mb-4">
                {user.skills.map((skill: string) => (
                  <View key={skill} className="bg-blue-100 rounded-full px-4 py-2 mr-2 mb-2">
                    <Text className="text-blue-900 text-sm font-semibold">{skill}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {user.interests?.length > 0 && (
            <>
              <Text className="text-gray-700 text-sm font-semibold mb-3">Interests</Text>
              <View className="flex-row flex-wrap">
                {user.interests.map((interest: string) => (
                  <View key={interest} className="bg-orange-100 rounded-full px-4 py-2 mr-2 mb-2">
                    <Text className="text-orange-700 text-sm font-semibold">{interest}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Settings */}
        <View className="px-6 mb-6">
          <Text className="text-black text-xl font-bold mb-4">Settings</Text>

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

          <TouchableOpacity className="bg-white rounded-2xl p-4 border-2 border-red-500" activeOpacity={0.7}>
            <Text className="text-red-600 text-center text-base font-bold">Logout</Text>
          </TouchableOpacity>
        </View>

        <View className="h-20" />
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}