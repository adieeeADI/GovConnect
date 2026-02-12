import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';

const ChangePassword = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [validation, setValidation] = useState({
    length: false,
    mixedCase: false,
    number: false,
    special: false,
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Validate new password
    if (field === 'newPassword') {
      setValidation({
        length: value.length >= 8,
        mixedCase: /[a-z]/.test(value) && /[A-Z]/.test(value),
        number: /\d/.test(value),
        special: /[@#$%^&*]/.test(value),
      });
    }
  };

  const toggleShowPassword = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleCancel = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setValidation({
      length: false,
      mixedCase: false,
      number: false,
      special: false,
    });
    console.log('Password change cancelled');
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.currentPassword) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }

    if (!formData.newPassword) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (!validation.length || !validation.mixedCase || !validation.number || !validation.special) {
      Alert.alert('Error', 'Please ensure your new password meets all requirements');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    console.log('Updating password...');
    Alert.alert('Success', 'Password updated successfully!');
    handleCancel();
  };

  const handleBack = () => {
    console.log('Going back');
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-blue-900 px-6 pt-12 pb-8 rounded-b-3xl">
          <TouchableOpacity className="mb-4" onPress={() => router.back()}>
            <ArrowLeft color="#ffffff" size={24} strokeWidth={2} />
          </TouchableOpacity>
          <Text className="text-white text-3xl font-bold mb-2">Change Password</Text>
          <Text className="text-blue-200 text-base">Update your account password</Text>
        </View>

        <View className="px-6 py-6">
          {/* Current Password */}
          <View className="mb-6">
            <Text className="text-gray-900 font-semibold text-base mb-2">
              Current Password
            </Text>
            <View className="relative">
              <TextInput
                secureTextEntry={!showPassword.current}
                value={formData.currentPassword}
                onChangeText={(value) => handleInputChange('currentPassword', value)}
                placeholder="Enter your current password"
                className="w-full px-4 py-3 pr-20 rounded-lg border border-gray-300 text-gray-900 text-base"
              />
              <TouchableOpacity
                onPress={() => toggleShowPassword('current')}
                className="absolute right-4 top-3"
              >
                <Text className="text-gray-500 text-sm font-medium">
                  {showPassword.current ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View className="mb-6">
            <Text className="text-gray-900 font-semibold text-base mb-2">
              New Password
            </Text>
            <View className="relative">
              <TextInput
                secureTextEntry={!showPassword.new}
                value={formData.newPassword}
                onChangeText={(value) => handleInputChange('newPassword', value)}
                placeholder="Enter your new password"
                className="w-full px-4 py-3 pr-20 rounded-lg border border-gray-300 text-gray-900 text-base"
              />
              <TouchableOpacity
                onPress={() => toggleShowPassword('new')}
                className="absolute right-4 top-3"
              >
                <Text className="text-gray-500 text-sm font-medium">
                  {showPassword.new ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View className="mb-6">
            <Text className="text-gray-900 font-semibold text-base mb-2">
              Confirm Password
            </Text>
            <View className="relative">
              <TextInput
                secureTextEntry={!showPassword.confirm}
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                placeholder="Confirm your new password"
                className="w-full px-4 py-3 pr-20 rounded-lg border border-gray-300 text-gray-900 text-base"
              />
              <TouchableOpacity
                onPress={() => toggleShowPassword('confirm')}
                className="absolute right-4 top-3"
              >
                <Text className="text-gray-500 text-sm font-medium">
                  {showPassword.confirm ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Password Requirements */}
          <View className="bg-gray-50 rounded-lg p-4 mb-6">
            <Text className="text-gray-900 font-semibold text-base mb-3">Password Requirements:</Text>
            <View className="gap-2">
              <Text className={`text-sm ${validation.length ? 'text-green-600' : 'text-gray-500'}`}>
                ✓ At least 8 characters long
              </Text>
              <Text className={`text-sm ${validation.mixedCase ? 'text-green-600' : 'text-gray-500'}`}>
                ✓ Mix of uppercase and lowercase letters
              </Text>
              <Text className={`text-sm ${validation.number ? 'text-green-600' : 'text-gray-500'}`}>
                ✓ At least one number
              </Text>
              <Text className={`text-sm ${validation.special ? 'text-green-600' : 'text-gray-500'}`}>
                ✓ At least one special character (@#$%^&*)
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleCancel}
              className="flex-1 bg-white border-2 border-gray-300 rounded-lg py-3 items-center"
            >
              <Text className="text-gray-900 text-base font-semibold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              className="flex-1 bg-blue-900 rounded-lg py-3 items-center"
            >
              <Text className="text-white text-base font-semibold">Update Password</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ChangePassword;