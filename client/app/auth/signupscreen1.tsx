import { AppText as Text, AppTextInput as TextInput } from '../../components/ScaledText';
import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, ScrollView, Alert, BackHandler, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomStatusBar from '../components/CustomStatusBar';
import { ArrowLeft, Eye, EyeOff, Globe } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import { useTranslation } from '../../utils/i18n';
import LanguageSelectorModal from '../../components/LanguageSelectorModal';
import { API_ENDPOINTS, safeFetchJson } from '../../config/api.config';

export default function SignUpScreen1() {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleBackConfirm = () => {
    Alert.alert(
      t('leave_page'),
      t('unsaved_changes_warning'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('back'), style: 'destructive', onPress: () => router.back() }
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        handleBackConfirm();
        return true;
      });
      return () => backHandler.remove();
    }, [])
  );

  const validateAndProceed = async () => {
    const trimmedName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);
    const trimmedLocation = location.trim();

    if (!trimmedName || !cleanEmail || !cleanPhone || !trimmedLocation || !password || !confirmPassword) {
      Alert.alert(t('notice'), t('fill_all_fields'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      Alert.alert(t('notice'), 'Please enter a valid email address');
      return;
    }

    if (cleanPhone.length !== 10) {
      Alert.alert(t('notice'), t('enter_valid_phone'));
      return;
    }

    if (password.length < 8) {
      Alert.alert(t('notice'), t('password_min_8'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('notice'), t('passwords_dont_match'));
      return;
    }

    setChecking(true);
    try {
      const res = await safeFetchJson(API_ENDPOINTS.CHECK_AVAILABILITY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, phone: cleanPhone })
      });

      setChecking(false);

      if (res && res.available) {
        router.push({
          pathname: "/auth/signupscreen2",
          params: {
            fullName: trimmedName,
            email: cleanEmail,
            phone: cleanPhone,
            location: trimmedLocation,
            password
          }
        });
      }
    } catch (err: any) {
      setChecking(false);
      Alert.alert(t('notice'), err.message || 'Verification failed. Please try again.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <CustomStatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            className="border border-gray-300 rounded-xl px-3 py-2"
            activeOpacity={0.7}
            onPress={handleBackConfirm}
          >
            <View className="flex-row items-center">
              <ArrowLeft color="#000000" size={18} strokeWidth={2} />
              <Text className="text-black text-sm font-semibold ml-1">{t('back')}</Text>
            </View>
          </TouchableOpacity>

          <Text className="text-black text-xl font-bold">
            {t('basic_info')}
          </Text>

          <TouchableOpacity
            className="flex-row items-center bg-gray-100 border border-gray-200 px-3 py-2 rounded-xl"
            activeOpacity={0.8}
            onPress={() => setLangModalVisible(true)}
          >
            <Globe color="#1e40af" size={18} />
          </TouchableOpacity>
        </View>

        {/* Full Name */}
        <Text className="text-black text-base font-bold mb-3">
          {t('full_name')}
        </Text>
        <TextInput
          className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base mb-6"
          placeholder={t('full_name')}
          value={fullName}
          onChangeText={setFullName}
        />

        {/* Email */}
        <Text className="text-black text-base font-bold mb-3">
          {t('email')}
        </Text>
        <TextInput
          className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base mb-6"
          placeholder={t('email')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Phone */}
        <Text className="text-black text-base font-bold mb-3">
          {t('phone')}
        </Text>
        <View className="flex-row items-center border-2 border-gray-800 rounded-2xl px-4 mb-6">
          <Text className="text-gray-600 text-lg mr-2 font-semibold">+91</Text>
          <View className="w-px h-8 bg-gray-300 mr-3" />
          <TextInput
            className="flex-1 py-4 text-base"
            placeholder={t('enter_phone_placeholder')}
            placeholderTextColor="#9ca3af"
            value={phone}
            onChangeText={(val) => setPhone(val.replace(/\D/g, ''))}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        {/* Location */}
        <Text className="text-black text-base font-bold mb-3">
          {t('location')}
        </Text>
        <TextInput
          className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base mb-6"
          placeholder={t('location')}
          value={location}
          onChangeText={setLocation}
        />

        {/* Password */}
        <Text className="text-black text-base font-bold mb-3">
          {t('password')}
        </Text>
        <View className="relative mb-6">
          <TextInput
            className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base pr-12"
            placeholder={t('password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            className="absolute right-4 top-4"
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff color="#6b7280" size={24} />
            ) : (
              <Eye color="#6b7280" size={24} />
            )}
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}
        <Text className="text-black text-base font-bold mb-3">
          {t('confirm_password')}
        </Text>
        <View className="relative mb-8">
          <TextInput
            className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base pr-12"
            placeholder={t('confirm_password')}
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

        {/* Next Button */}
        <TouchableOpacity
          className={`rounded-2xl py-4 items-center flex-row justify-center ${
            checking ? 'bg-blue-800' : 'bg-blue-700'
          }`}
          onPress={validateAndProceed}
          disabled={checking}
          activeOpacity={0.8}
        >
          {checking ? (
            <>
              <ActivityIndicator color="#ffffff" size="small" style={{ marginRight: 8 }} />
              <Text className="text-white text-xl font-bold">
                Checking...
              </Text>
            </>
          ) : (
            <Text className="text-white text-xl font-bold">
              {t('next')}
            </Text>
          )}
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