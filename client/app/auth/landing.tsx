import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomStatusBar from '../components/CustomStatusBar';
import { Briefcase, Globe } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTranslation } from '../../utils/i18n';
import LanguageSelectorModal from '../../components/LanguageSelectorModal';

export default function Landing() {
  const { t } = useTranslation();
  const [langModalVisible, setLangModalVisible] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-blue-900" edges={['top', 'bottom']}>
      <CustomStatusBar />
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Globe Language Selector Button at top right */}
        <TouchableOpacity
          className="flex-row items-center self-end bg-white/10 px-4 py-2 rounded-2xl border border-white/20 mb-4"
          activeOpacity={0.8}
          onPress={() => setLangModalVisible(true)}
        >
          <Globe color="#ffffff" size={20} />
          <Text className="text-white text-sm font-semibold ml-2">{t('language')}</Text>
        </TouchableOpacity>

        {/* Logo Icon */}
        <View className="w-32 h-32 rounded-full bg-white/10 items-center justify-center self-center mb-6 border-2 border-white/20">
          <Briefcase color="#ffffff" size={70} strokeWidth={1.5} />
        </View>
        
        {/* Title */}
        <Text className="text-white text-4xl font-bold text-center mb-1">
          Government
        </Text>
        <Text className="text-white text-4xl font-bold text-center mb-3">
          Opportunities
        </Text>
        
        {/* Subtitle */}
        <Text className="text-white text-base text-center mb-6 leading-6 px-2">
          {t('landing_subtitle')}
        </Text>
        
        {/* Features Card */}
        <View className="bg-blue-800/80 rounded-2xl p-5 w-full mb-6 border border-blue-700">
          {/* Feature 1 */}
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-orange-500 rounded-full items-center justify-center mr-3">
              <Text className="text-white text-base font-bold">✓</Text>
            </View>
            <Text className="text-white text-sm font-semibold flex-1 leading-5">
              {t('feature_1')}
            </Text>
          </View>
          
          {/* Feature 2 */}
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-orange-500 rounded-full items-center justify-center mr-3">
              <Text className="text-white text-base font-bold">✓</Text>
            </View>
            <Text className="text-white text-sm font-semibold flex-1 leading-5">
              {t('feature_2')}
            </Text>
          </View>
          
          {/* Feature 3 */}
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-orange-500 rounded-full items-center justify-center mr-3">
              <Text className="text-white text-base font-bold">✓</Text>
            </View>
            <Text className="text-white text-sm font-semibold flex-1 leading-5">
              {t('feature_3')}
            </Text>
          </View>
        </View>
        
        {/* Sign Up Button */}
        <TouchableOpacity 
          className="bg-orange-500 rounded-2xl w-full py-4 mb-3 items-center shadow-lg"
          activeOpacity={0.8}
          onPress={() => router.push("/auth/signupscreen1")}
        >
          <Text className="text-white text-lg font-bold">
            {t('sign_up')}
          </Text>
        </TouchableOpacity>
        
        {/* Sign In Button */}
        <TouchableOpacity 
          className="bg-white/15 rounded-2xl w-full py-4 items-center border border-white/20"
          activeOpacity={0.8}
          onPress={() => router.push("/auth/signin")}
        >
          <Text className="text-white text-lg font-bold">
            {t('sign_in')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
      />
    </SafeAreaView>
  );
}