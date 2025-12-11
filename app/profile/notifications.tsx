import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

const NotificationSettings = () => {
  const router = useRouter();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    newOpportunityAlerts: true,
    applicationStatusUpdates: true,
    weeklyDigest: false,
    newsAndUpdates: true,
    marketingEmails: false,
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const Toggle = ({ checked }) => (
    <View className={`w-12 h-7 rounded-full justify-center ${checked ? 'bg-blue-900' : 'bg-gray-300'}`}>
      <View className={`w-5 h-5 rounded-full bg-white shadow-sm ${checked ? 'ml-6' : 'ml-1'}`} />
    </View>
  );

  const NotificationItem = ({ title, description, settingKey }) => (
    <View className="bg-gray-50 rounded-xl p-4 mb-3">
      <View className="flex-row justify-between items-center">
        <View className="flex-1 pr-4">
          <Text className="text-base font-semibold text-gray-900 mb-1">{title}</Text>
          <Text className="text-sm text-gray-500">{description}</Text>
        </View>
        <TouchableOpacity onPress={() => toggleSetting(settingKey)}>
          <Toggle checked={settings[settingKey]} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleSave = () => {
    console.log('Settings saved:', settings);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-blue-900 px-6 pt-12 pb-8 rounded-b-3xl">
          <TouchableOpacity className="mb-4" onPress={() => router.back()}>
            <ArrowLeft color="#ffffff" size={24} strokeWidth={2} />
          </TouchableOpacity>
          <Text className="text-white text-3xl font-bold mb-2">Notification Settings</Text>
          <Text className="text-blue-200 text-base">Manage how you receive updates</Text>
        </View>

        {/* Notification Channels */}
        <View className="px-6 py-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Notification Channels</Text>
          
          <NotificationItem
            title="Email Notifications"
            description="Receive updates via email"
            settingKey="emailNotifications"
          />
          
          <NotificationItem
            title="SMS Notifications"
            description="Receive updates via SMS"
            settingKey="smsNotifications"
          />
          
          <NotificationItem
            title="Push Notifications"
            description="Receive app notifications"
            settingKey="pushNotifications"
          />
        </View>

        {/* Opportunity & Application Updates */}
        <View className="px-6 py-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Opportunity & Application Updates</Text>
          
          <NotificationItem
            title="New Opportunity Alerts"
            description="Get notified about new opportunities"
            settingKey="newOpportunityAlerts"
          />
          
          <NotificationItem
            title="Application Status Updates"
            description="Updates on your applications"
            settingKey="applicationStatusUpdates"
          />
          
          <NotificationItem
            title="Weekly Digest"
            description="Summary of weekly opportunities"
            settingKey="weeklyDigest"
          />
        </View>

        {/* Marketing & News */}
        <View className="px-6 py-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Marketing & News</Text>
          
          <NotificationItem
            title="News and Updates"
            description="Stay informed about platform updates"
            settingKey="newsAndUpdates"
          />
          
          <NotificationItem
            title="Marketing Emails"
            description="Receive promotional content"
            settingKey="marketingEmails"
          />
        </View>

        {/* Save Button */}
        <View className="px-6 pb-8">
          <TouchableOpacity 
            onPress={handleSave}
            className="bg-blue-900 rounded-xl py-4 items-center"
          >
            <Text className="text-white text-base font-semibold">Save Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationSettings;