import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomStatusBar from '../components/CustomStatusBar';
import { ArrowLeft, Eye, EyeOff, Globe } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import { useTranslation } from '../../utils/i18n';
import LanguageSelectorModal from '../../components/LanguageSelectorModal';

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

  const handleBackConfirm = () => {
    Alert.alert(
      t('leave_page'),
      'Are you sure you want to go back? Entered details will not be saved.',
      [
        { text: 'Continue Registration', style: 'cancel' },
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

  const validateAndProceed = () => {
    if (!fullName || !email || !phone || !location || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    router.push({
      pathname: "/auth/signupscreen2",
      params: {
        fullName,
        email,
        phone,
        location,
        password
      }
    });
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
        <TextInput
          className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base mb-6"
          placeholder={t('phone')}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

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
          {t('password')}
        </Text>
        <View className="relative mb-8">
          <TextInput
            className="border-2 border-gray-800 rounded-2xl px-4 py-4 text-base pr-12"
            placeholder={t('password')}
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
          className="bg-blue-700 rounded-2xl py-4 items-center"
          onPress={validateAndProceed}
        >
          <Text className="text-white text-xl font-bold">
            {t('next')}
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