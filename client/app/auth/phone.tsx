import { AppText as Text, AppTextInput as TextInput } from '../../components/ScaledText';
import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomStatusBar from '../components/CustomStatusBar';
import { ArrowLeft, Smartphone, Globe } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from '../../utils/i18n';
import LanguageSelectorModal from '../../components/LanguageSelectorModal';
import { API_ENDPOINTS, safeFetchJson } from '../../config/api.config';

export default function PhoneInput() {
  const router = useRouter();
  const { t } = useTranslation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const handleSendOTP = async () => {
    const cleanPhone = phoneNumber.trim().replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      Alert.alert(t('notice'), t('enter_valid_phone'));
      return;
    }

    setIsLoading(true);
    console.log('Sending OTP to:', cleanPhone);

    try {
      const data = await safeFetchJson(API_ENDPOINTS.SEND_OTP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      setIsLoading(false);

      if (data?.otp) {
        Alert.alert(
          t('notice'),
          `${t('otp_sent')}\n\n[Dev Code: ${data.otp}]`
        );
      } else {
        Alert.alert(t('notice'), t('otp_sent'));
      }

      router.push({
        pathname: '/auth/otp',
        params: { phone: cleanPhone },
      });
    } catch (err: any) {
      setIsLoading(false);
      const isNotRegistered = err.message && err.message.toLowerCase().includes('sign up');
      if (isNotRegistered) {
        Alert.alert(
          t('notice'),
          err.message,
          [
            { text: t('cancel'), style: 'cancel' },
            { 
              text: t('sign_up'), 
              onPress: () => router.push('/auth/signupscreen1') 
            }
          ]
        );
      } else {
        Alert.alert(t('notice'), err.message || 'Failed to send OTP. Please check backend connection.');
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <CustomStatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Row with Back and Language */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity 
            className="flex-row items-center border border-gray-300 rounded-xl px-4 py-2.5"
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <ArrowLeft color="#000000" size={20} strokeWidth={2} />
            <Text className="text-black text-sm font-semibold ml-2">{t('back')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center bg-gray-100 border border-gray-200 px-3.5 py-2.5 rounded-xl"
            activeOpacity={0.8}
            onPress={() => setLangModalVisible(true)}
          >
            <Globe color="#1e40af" size={18} />
            <Text className="text-blue-900 text-xs font-bold ml-1.5">{t('language')}</Text>
          </TouchableOpacity>
        </View>

        {/* Icon */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center">
            <Smartphone color="#1e3a8a" size={48} strokeWidth={2} />
          </View>
        </View>

        {/* Title */}
        <Text className="text-black text-3xl font-bold text-center mb-3">
          {t('enter_phone_title')}
        </Text>
        <Text className="text-gray-500 text-center mb-8 px-4 leading-5">
          {t('phone_subtitle')}
        </Text>

        {/* Phone Number Input */}
        <Text className="text-black text-base font-bold mb-3">
          {t('phone_number_label')}
        </Text>
        <View className="flex-row items-center border-2 border-gray-800 rounded-2xl px-4 mb-8">
          <Text className="text-gray-600 text-lg mr-2">+91</Text>
          <View className="w-px h-8 bg-gray-300 mr-3" />
          <TextInput
            className="flex-1 py-4 text-base"
            placeholder={t('enter_phone_placeholder')}
            placeholderTextColor="#9ca3af"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        {/* Info Box */}
        <View className="bg-blue-50 rounded-2xl p-4 mb-8">
          <Text className="text-blue-800 text-sm leading-5">
            {t('otp_note')}
          </Text>
        </View>

        {/* Send OTP Button */}
        <TouchableOpacity 
          className={`bg-blue-700 rounded-2xl py-4 items-center mb-6 ${
            isLoading ? 'opacity-70' : ''
          }`}
          activeOpacity={0.8}
          onPress={handleSendOTP}
          disabled={isLoading}
        >
          <Text className="text-white text-xl font-bold">
            {isLoading ? t('sending') : t('send_otp')}
          </Text>
        </TouchableOpacity>

        {/* Terms of Service */}
        <Text className="text-black text-sm text-center leading-5">
          {t('terms_agreement_notice')}
        </Text>
      </ScrollView>

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
      />
    </SafeAreaView>
  );
}