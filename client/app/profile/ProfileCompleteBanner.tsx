import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertCircle, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from '../../utils/i18n';

interface ProfileCompleteBannerProps {
  completionPercentage?: number;
}

export default function ProfileCompleteBanner({ 
  completionPercentage = 20 
}: ProfileCompleteBannerProps) {

  const router = useRouter();
  const { t } = useTranslation();

  // 🔥 Hide if 100% complete
  if (completionPercentage >= 100) return null;

  return (
    <TouchableOpacity 
      className="mx-6 mb-6 rounded-2xl p-5"
      style={{ backgroundColor: '#f97316' }}
      activeOpacity={0.8}
      onPress={() => router.push('/profile/complete-profile')}
    >
      {/* Header */}
      <View className="flex-row items-start mb-3">
        <View className="bg-white/20 rounded-full p-2 mr-3">
          <AlertCircle color="#ffffff" size={24} strokeWidth={2} />
        </View>

        <View className="flex-1">
          <Text className="text-white text-lg font-bold mb-1">
            {t('profile_completion')}
          </Text>
          <Text className="text-white/90 text-sm">
            {t('profile_complete_subtitle')}
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
          {t('tap_complete_profile')}
        </Text>
        <ArrowRight color="#ffffff" size={20} strokeWidth={2} />
      </View>
    </TouchableOpacity>
  );
}