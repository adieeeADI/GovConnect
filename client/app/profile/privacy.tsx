import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import Delete from './delete';
import { ArrowLeft } from 'lucide-react-native';

const PrivacySecurity = () => {
  const router = useRouter();
  
  const [settings, setSettings] = useState({
    profileVisibility: 'public',
    showEmailPublicly: false,
    showPhonePublicly: false,
    twoFactorAuth: false,
    sessionTimeout: '30',
    loginAlerts: true,
  });

  // Add this state for the modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const Toggle = ({ checked }) => (
    <View className={`w-12 h-7 rounded-full justify-center ${checked ? 'bg-blue-900' : 'bg-gray-300'}`}>
      <View className={`w-5 h-5 rounded-full bg-white shadow-sm ${checked ? 'ml-6' : 'ml-1'}`} />
    </View>
  );

  const handleSave = () => {
    Alert.alert('Success', 'Settings saved successfully!');
  };

  const handleChangePassword = () => {
    router.push('/profile/password');
  };

  // Update this function to show the modal
  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  // Add this function to handle actual deletion
  const handleConfirmDelete = () => {
    Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
    setShowDeleteModal(false);
    // Navigate back to landing/login
    router.replace('/auth/landing');
  };

  const handleManageDevices = () => {
    console.log('Manage devices clicked');
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-blue-900 px-6 pt-12 pb-8 rounded-b-3xl">
          <TouchableOpacity className="mb-4" onPress={() => router.back()}>
            <ArrowLeft color="#ffffff" size={24} strokeWidth={2} />
          </TouchableOpacity>
          <Text className="text-white text-3xl font-bold mb-2">Privacy & Security</Text>
          <Text className="text-blue-200 text-base">Control your privacy and security settings</Text>
        </View>

        {/* Privacy Settings */}
        <View className="px-6 py-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Privacy Settings</Text>
          
          {/* Profile Visibility */}
          <View className="bg-gray-50 rounded-xl p-4 mb-3">
            <Text className="text-base font-semibold text-gray-900 mb-3">Profile Visibility</Text>
            <View className="bg-white rounded-lg border border-gray-200">
              <Picker
                selectedValue={settings.profileVisibility}
                onValueChange={(value) => updateSetting('profileVisibility', value)}
                className="text-base"
              >
                <Picker.Item label="Public" value="public" />
                <Picker.Item label="Private" value="private" />
                <Picker.Item label="Contacts Only" value="contacts" />
              </Picker>
            </View>
            <Text className="text-sm text-gray-500 mt-2">Who can see your profile information</Text>
          </View>

          {/* Show Email Publicly */}
          <View className="bg-gray-50 rounded-xl p-4 mb-3">
            <View className="flex-row justify-between items-center">
              <View className="flex-1 pr-4">
                <Text className="text-base font-semibold text-gray-900 mb-1">Show Email Publicly</Text>
                <Text className="text-sm text-gray-500">Allow others to see your email</Text>
              </View>
              <TouchableOpacity onPress={() => toggleSetting('showEmailPublicly')}>
                <Toggle checked={settings.showEmailPublicly} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Show Phone Publicly */}
          <View className="bg-gray-50 rounded-xl p-4 mb-3">
            <View className="flex-row justify-between items-center">
              <View className="flex-1 pr-4">
                <Text className="text-base font-semibold text-gray-900 mb-1">Show Phone Publicly</Text>
                <Text className="text-sm text-gray-500">Allow others to see your phone</Text>
              </View>
              <TouchableOpacity onPress={() => toggleSetting('showPhonePublicly')}>
                <Toggle checked={settings.showPhonePublicly} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Security Settings */}
        <View className="px-6 py-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Security Settings</Text>
          
          {/* Two-Factor Authentication */}
          <View className="bg-gray-50 rounded-xl p-4 mb-3">
            <View className="flex-row justify-between items-center">
              <View className="flex-1 pr-4">
                <Text className="text-base font-semibold text-gray-900 mb-1">Two-Factor Authentication</Text>
                <Text className="text-sm text-gray-500">Add extra security to your account</Text>
              </View>
              <TouchableOpacity onPress={() => toggleSetting('twoFactorAuth')}>
                <Toggle checked={settings.twoFactorAuth} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Session Timeout */}
          <View className="bg-gray-50 rounded-xl p-4 mb-3">
            <Text className="text-base font-semibold text-gray-900 mb-3">Session Timeout</Text>
            <View className="bg-white rounded-lg border border-gray-200">
              <Picker
                selectedValue={settings.sessionTimeout}
                onValueChange={(value) => updateSetting('sessionTimeout', value)}
                className="text-base"
              >
                <Picker.Item label="15 minutes" value="15" />
                <Picker.Item label="30 minutes" value="30" />
                <Picker.Item label="1 hour" value="60" />
                <Picker.Item label="2 hours" value="120" />
                <Picker.Item label="Never" value="never" />
              </Picker>
            </View>
            <Text className="text-sm text-gray-500 mt-2">Auto-logout after inactivity</Text>
          </View>

          {/* Login Alerts */}
          <View className="bg-gray-50 rounded-xl p-4 mb-3">
            <View className="flex-row justify-between items-center">
              <View className="flex-1 pr-4">
                <Text className="text-base font-semibold text-gray-900 mb-1">Login Alerts</Text>
                <Text className="text-sm text-gray-500">Get notified of new logins</Text>
              </View>
              <TouchableOpacity onPress={() => toggleSetting('loginAlerts')}>
                <Toggle checked={settings.loginAlerts} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Device Management */}
          <View className="bg-gray-50 rounded-xl p-4 mb-3">
            <View className="flex-row justify-between items-center">
              <View className="flex-1 pr-4">
                <Text className="text-base font-semibold text-gray-900 mb-1">Device Management</Text>
                <Text className="text-sm text-gray-500">View and manage connected devices</Text>
              </View>
              <TouchableOpacity onPress={handleManageDevices}>
                <Text className="text-blue-900 font-semibold text-base">Manage</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View className="px-6 py-6">
          <Text className="text-xl font-bold text-red-600 mb-4">Danger Zone</Text>
          
          <TouchableOpacity
            onPress={handleChangePassword}
            className="border-2 border-red-600 rounded-xl py-4 mb-3 items-center"
          >
            <Text className="text-red-600 text-base font-semibold">Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDeleteAccount}
            className="border-2 border-red-600 rounded-xl py-4 items-center"
          >
            <Text className="text-red-600 text-base font-semibold">Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <View className="px-6 pb-8">
          <TouchableOpacity
            onPress={handleSave}
            className="bg-blue-900 rounded-xl py-4 items-center"
          >
            <Text className="text-white text-base font-semibold">Save Settings</Text>
          </TouchableOpacity>

          <Delete
          visible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
         />
        </View>
      </ScrollView>
    </View>
  );
};

export default PrivacySecurity;