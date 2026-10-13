import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomStatusBar from '../components/CustomStatusBar';
import Svg, { Rect, Circle, Path } from 'react-native-svg';
import { ArrowLeft, Globe } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '../../utils/i18n';
import LanguageSelectorModal from '../../components/LanguageSelectorModal';
import { API_ENDPOINTS, safeFetchJson } from '../../config/api.config';

const OTPVerification = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const phone = (params.phone as string) || '';
  const { t } = useTranslation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      Alert.alert(t('notice'), t('enter_all_6_digits'));
      return;
    }

    setIsLoading(true);
    console.log('Verifying OTP:', otpValue, 'for phone:', phone);

    try {
      const data = await safeFetchJson(API_ENDPOINTS.VERIFY_OTP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          otp: otpValue,
        }),
      });

      if (data && data.user && data.user.id) {
        await AsyncStorage.setItem('userId', data.user.id);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        setIsLoading(false);
        Alert.alert(t('notice'), t('otp_verified_success'));
        router.replace('/main/home');
      } else {
        setIsLoading(false);
        Alert.alert(t('notice'), data?.message || 'Verification failed. No registered account found.');
      }
    } catch (err: any) {
      setIsLoading(false);
      Alert.alert(t('notice'), err.message || 'OTP verification failed. Please try again.');
    }
  };

  const handleResend = async () => {
    console.log('Resending OTP to:', phone);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();

    if (!phone) {
      Alert.alert(t('notice'), t('otp_resent_success'));
      return;
    }

    try {
      const data = await safeFetchJson(API_ENDPOINTS.SEND_OTP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      if (data?.otp) {
        Alert.alert(
          t('notice'),
          `${t('otp_resent_success')}\n\n[Dev Code: ${data.otp}]`
        );
      } else {
        Alert.alert(t('notice'), t('otp_resent_success'));
      }
    } catch (err: any) {
      Alert.alert(t('notice'), err.message || 'Failed to resend OTP.');
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
          <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center">
            <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <Rect x="7" y="11" width="10" height="9" rx="2" fill="#F97316" />
              <Circle cx="12" cy="15" r="1.5" fill="#FFF" />
              <Rect x="11.25" y="15" width="1.5" height="2" fill="#FFF" />
              <Path 
                d="M8 11V8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8V11" 
                stroke="#9CA3AF" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
            </Svg>
          </View>
        </View>

        {/* Title */}
        <Text className="text-3xl font-bold text-gray-900 text-center mb-3">
          {t('verify_identity')}
        </Text>
        <Text className="text-gray-500 text-center mb-8">
          {t('enter_6_digit_otp')}
        </Text>

        {/* OTP Inputs */}
        <View className="flex-row justify-center gap-3 mb-6">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              keyboardType="numeric"
              maxLength={1}
              value={digit}
              onChangeText={(value) => handleChange(index, value)}
              onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(index, key)}
              className="w-14 h-14 text-center text-2xl font-semibold border-2 border-gray-200 rounded-lg"
              style={{ textAlign: 'center' }}
            />
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          onPress={handleVerify}
          disabled={isLoading}
          className={`bg-blue-700 rounded-2xl py-4 items-center mb-6 ${isLoading ? 'opacity-70' : ''}`}
        >
          <Text className="text-white text-xl font-bold">
            {isLoading ? t('verifying') : t('verify_otp')}
          </Text>
        </TouchableOpacity>

        {/* Resend OTP */}
        <View className="items-center mt-6">
          <Text className="text-gray-500 text-sm mb-2">{t('didnt_receive_code')}</Text>
          <TouchableOpacity onPress={handleResend}>
            <Text className="text-blue-900 font-semibold text-base">{t('resend_otp')}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default OTPVerification;
