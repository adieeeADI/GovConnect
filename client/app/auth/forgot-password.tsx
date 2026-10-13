import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomStatusBar from '../components/CustomStatusBar';
import { ArrowLeft, KeyRound, Globe, Eye, EyeOff, CheckCircle2 } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { API_ENDPOINTS, safeFetchJson } from '../../config/api.config';
import { useTranslation } from '../../utils/i18n';
import LanguageSelectorModal from '../../components/LanguageSelectorModal';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const initialEmail = (params.initialEmail as string) || '';

  const [step, setStep] = useState<1 | 2>(1); // 1 = Enter Identifier, 2 = Enter OTP & New Password
  const [identifier, setIdentifier] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [langModalVisible, setLangModalVisible] = useState(false);

  // Step 1: Send Reset OTP
  const handleSendResetOtp = async () => {
    setError('');
    setInfoMessage('');

    const cleanTarget = identifier.trim();
    if (!cleanTarget) {
      setError(t('enter_email_or_phone_error'));
      return;
    }

    setLoading(true);

    try {
      const data = await safeFetchJson(API_ENDPOINTS.FORGOT_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: cleanTarget,
        }),
      });

      setLoading(false);
      setStep(2);

      let msg = t('otp_sent');
      if (data?.phoneHint) {
        msg += ` (${data.phoneHint})`;
      } else if (data?.emailHint) {
        msg += ` (${data.emailHint})`;
      }
      if (data?.otp) {
        msg += `\n\n[Dev Code: ${data.otp}]`;
      }
      setInfoMessage(msg);
      Alert.alert(t('notice'), msg);

    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to send reset code. Please check your credentials.');
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async () => {
    setError('');

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError(t('enter_all_6_digits'));
      return;
    }

    if (!newPassword.trim()) {
      setError(t('enter_password'));
      return;
    }

    if (newPassword.length < 6) {
      setError(t('password_min_6'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('passwords_dont_match'));
      return;
    }

    setLoading(true);

    try {
      await safeFetchJson(API_ENDPOINTS.RESET_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: identifier.trim(),
          otp: cleanOtp,
          newPassword,
        }),
      });

      setLoading(false);
      Alert.alert(
        t('notice'),
        t('password_reset_success'),
        [
          {
            text: 'OK',
            onPress: () => router.replace('/auth/signin'),
          },
        ]
      );

    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to reset password. Please try again.');
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError('');
    setOtp('');
    setLoading(true);

    try {
      const data = await safeFetchJson(API_ENDPOINTS.FORGOT_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: identifier.trim(),
        }),
      });

      setLoading(false);
      let msg = t('otp_resent_success');
      if (data?.otp) {
        msg += `\n\n[Dev Code: ${data.otp}]`;
      }
      Alert.alert(t('notice'), msg);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to resend code.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <CustomStatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Row with Back and Language */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            className="flex-row items-center border border-gray-300 rounded-xl px-4 py-2.5"
            activeOpacity={0.7}
            onPress={() => {
              if (step === 2) {
                setStep(1);
                setError('');
              } else {
                router.back();
              }
            }}
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
        <View className="items-center mb-6">
          <View className="w-20 h-20 bg-blue-50 border border-blue-100 rounded-full items-center justify-center">
            <KeyRound color="#1e40af" size={38} strokeWidth={1.75} />
          </View>
        </View>

        {/* Title & Subtitle */}
        <Text className="text-black text-3xl font-bold text-center mb-2">
          {t('forgot_password_title')}
        </Text>
        <Text className="text-gray-500 text-center mb-8 px-2 text-base leading-5">
          {step === 1 ? t('forgot_password_subtitle') : t('enter_6_digit_otp')}
        </Text>

        {/* Status/Info message if step 2 */}
        {step === 2 && infoMessage ? (
          <View className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex-row items-center">
            <CheckCircle2 color="#2563eb" size={20} className="mr-2" />
            <Text className="text-blue-800 text-sm font-medium flex-1 ml-2">
              {infoMessage}
            </Text>
          </View>
        ) : null}

        {/* Error Banner */}
        {error ? (
          <View className="bg-red-50 border border-red-300 rounded-2xl p-4 mb-6">
            <Text className="text-red-700 text-sm font-semibold">{error}</Text>
          </View>
        ) : null}

        {/* STEP 1: Enter Registered Identifier */}
        {step === 1 ? (
          <View>
            <Text className="text-black text-base font-bold mb-3">
              {t('enter_email_or_phone')}
            </Text>
            <TextInput
              className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base mb-8"
              placeholder={t('enter_email_or_phone_placeholder')}
              placeholderTextColor="#9ca3af"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TouchableOpacity
              className={`rounded-2xl py-4 items-center mb-6 ${
                loading ? 'bg-blue-500' : 'bg-blue-700'
              }`}
              activeOpacity={0.8}
              onPress={handleSendResetOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white text-xl font-bold">
                  {t('send_reset_code')}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              className="items-center py-2"
              onPress={() => router.replace('/auth/signin')}
            >
              <Text className="text-blue-700 text-base font-semibold">
                {t('sign_in')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* STEP 2: Enter OTP & New Password */
          <View>
            {/* OTP Input */}
            <Text className="text-black text-base font-bold mb-3">
              {t('enter_reset_otp')}
            </Text>
            <TextInput
              className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-xl tracking-widest text-center mb-6 font-bold"
              placeholder="123456"
              placeholderTextColor="#9ca3af"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              maxLength={6}
            />

            {/* New Password */}
            <Text className="text-black text-base font-bold mb-3">
              {t('new_password')}
            </Text>
            <View className="relative mb-6">
              <TextInput
                className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base pr-12"
                placeholder={t('new_password')}
                placeholderTextColor="#9ca3af"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
              />
              <TouchableOpacity
                className="absolute right-4 top-4"
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff color="#6b7280" size={24} />
                ) : (
                  <Eye color="#6b7280" size={24} />
                )}
              </TouchableOpacity>
            </View>

            {/* Confirm New Password */}
            <Text className="text-black text-base font-bold mb-3">
              {t('confirm_new_password')}
            </Text>
            <View className="relative mb-8">
              <TextInput
                className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base pr-12"
                placeholder={t('confirm_new_password')}
                placeholderTextColor="#9ca3af"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                className="absolute right-4 top-4"
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff color="#6b7280" size={24} />
                ) : (
                  <Eye color="#6b7280" size={24} />
                )}
              </TouchableOpacity>
            </View>

            {/* Reset Password Button */}
            <TouchableOpacity
              className={`rounded-2xl py-4 items-center mb-6 ${
                loading ? 'bg-blue-500' : 'bg-blue-700'
              }`}
              activeOpacity={0.8}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white text-xl font-bold">
                  {t('reset_password_btn')}
                </Text>
              )}
            </TouchableOpacity>

            {/* Resend OTP Row */}
            <View className="flex-row items-center justify-between px-2">
              <TouchableOpacity
                onPress={() => {
                  setStep(1);
                  setError('');
                }}
              >
                <Text className="text-gray-600 text-sm font-semibold">
                  ← {t('back')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleResendOtp} disabled={loading}>
                <Text className="text-blue-700 text-sm font-bold">
                  {t('resend_otp')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
      />
    </SafeAreaView>
  );
}
