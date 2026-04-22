import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertCircle, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface ProfileCompleteBannerProps {
  completionPercentage?: number;
}

export default function ProfileCompleteBanner({ 
  completionPercentage = 20 
}: ProfileCompleteBannerProps) {

  const router = useRouter();

  // 🔥 Hide if mostly complete
  if (completionPercentage >= 80) return null;

  return (
    <TouchableOpacity 
      className="mx-6 mb-6 rounded-2xl p-5"
      style={{ backgroundColor: '#f97316' }}
      activeOpacity={0.8}
      onPress={() => router.push('/profile/complete-profile')} // ✅ FIXED
    >
      {/* Header */}
      <View className="flex-row items-start mb-3">
        <View className="bg-white/20 rounded-full p-2 mr-3">
          <AlertCircle color="#ffffff" size={24} strokeWidth={2} />
        </View>

        <View className="flex-1">
          <Text className="text-white text-lg font-bold mb-1">
            Complete Your Profile
          </Text>
          <Text className="text-white/90 text-sm">
            Get better recommendations for schemes, internships & scholarships
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="mb-3">
        <View className="h-2 bg-white/30 rounded-full overflow-hidden">
          <View 
            className="h-full bg-white rounded-full" 
            style={{ width: `${completionPercentage}%` }} 
          />
        </View>

        <Text className="text-white text-xs mt-1">
          {completionPercentage}% Complete
        </Text>
      </View>

      {/* CTA */}
      <View className="flex-row items-center justify-between">
        <Text className="text-white font-semibold">
          Complete now to unlock recommendations
        </Text>
        <ArrowRight color="#ffffff" size={20} strokeWidth={2} />
      </View>
    </TouchableOpacity>
  );
}