import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomStatusBar from '../components/CustomStatusBar';
import { ArrowLeft, Globe } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, safeFetchJson } from '../../config/api.config';
import { useTranslation } from '../../utils/i18n';
import LanguageSelectorModal from '../../components/LanguageSelectorModal';

export default function SignIn() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [langModalVisible, setLangModalVisible] = useState(false);

  const handleSignIn = async () => {
    setError('');

    // Validation
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const data = await safeFetchJson(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (data && data.user) {
        await AsyncStorage.setItem('userId', data.user.id);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
      }

      setLoading(false);
      router.replace('/main/home');

    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
      console.log('Login error:', err);
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

        {/* Title */}
        <Text className="text-black text-3xl font-bold mb-8">
          {t('sign_in')}
        </Text>

        {/* Email */}
        <Text className="text-black text-base font-bold mb-3">
          {t('email')}
        </Text>
        <TextInput
          className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base mb-6"
          placeholder={t('email')}
          placeholderTextColor="#9ca3af"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Password */}
        <Text className="text-black text-base font-bold mb-3">
          {t('password')}
        </Text>
        <TextInput
          className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base mb-3"
          placeholder={t('password')}
          placeholderTextColor="#9ca3af"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Forget Password */}
        <TouchableOpacity activeOpacity={0.7} className="mb-8">
          <Text className="text-blue-600 text-base font-semibold">
            Forget Password?
          </Text>
        </TouchableOpacity>

        {/* Error Message */}
        {error ? (
          <View className="bg-red-100 border border-red-400 rounded-xl p-3 mb-6">
            <Text className="text-red-700 text-sm font-semibold">
              {error}
            </Text>
          </View>
        ) : null}

        {/* Sign In Button */}
        <TouchableOpacity 
          className={`rounded-2xl py-4 items-center mb-6 ${loading ? 'bg-blue-500' : 'bg-blue-700'}`}
          activeOpacity={0.8}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white text-xl font-bold">
              {t('sign_in')}
            </Text>
          )}
        </TouchableOpacity>

        {/* OR Divider */}
        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="text-black text-lg font-bold mx-4">OR</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        {/* Continue With OTP */}
        <TouchableOpacity 
          className="border-2 border-gray-800 rounded-2xl py-4 items-center mb-6"
          activeOpacity={0.8}
          onPress={() => router.push("/auth/phone")}
        >
          <Text className="text-black text-lg font-semibold">
            Continue With OTP
          </Text>
        </TouchableOpacity>

        {/* Terms */}
        <Text className="text-black text-sm text-center leading-5">
          By continuing, you agree to our{' '}
          <Text className="font-bold">Terms of Service</Text>
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