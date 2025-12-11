import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Pressable } from 'react-native';
import { X } from 'lucide-react-native';

interface DeleteProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function Delete({ visible, onClose, onConfirm }: DeleteProps) {
  const [confirmText, setConfirmText] = useState('');
  const isConfirmValid = confirmText === 'DELETE MY ACCOUNT';

  const handleDelete = () => {
    if (isConfirmValid) {
      onConfirm();
      setConfirmText('');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable 
        className="flex-1 bg-black/50 justify-end"
        onPress={onClose}
      >
        <Pressable 
          className="bg-white rounded-t-3xl"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View className="px-6 pt-6 pb-4 border-b border-gray-200">
            <TouchableOpacity 
              className="flex-row items-center mb-4"
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X color="#000000" size={20} strokeWidth={2} />
              <Text className="text-black text-base font-semibold ml-2">Close</Text>
            </TouchableOpacity>

            <Text className="text-red-600 text-2xl font-bold mb-1">
              Delete Account
            </Text>
            <Text className="text-gray-500 text-sm">
              This action cannot be undone
            </Text>
          </View>

          {/* Content */}
          <View className="px-6 py-6">
            {/* Warning Box */}
            <View className="bg-red-50 border-l-4 border-red-600 rounded-lg p-4 mb-6">
              <Text className="text-red-900 text-base font-bold mb-3">
                Warning
              </Text>
              <Text className="text-red-800 text-sm mb-3">
                Deleting your account will permanently remove all your data including:
              </Text>
              <View className="ml-2">
                <View className="flex-row items-start mb-2">
                  <Text className="text-red-800 text-sm">• </Text>
                  <Text className="text-red-800 text-sm flex-1">
                    Profile information and resume
                  </Text>
                </View>
                <View className="flex-row items-start mb-2">
                  <Text className="text-red-800 text-sm">• </Text>
                  <Text className="text-red-800 text-sm flex-1">
                    All saved internship opportunities
                  </Text>
                </View>
                <View className="flex-row items-start mb-2">
                  <Text className="text-red-800 text-sm">• </Text>
                  <Text className="text-red-800 text-sm flex-1">
                    Application history and recommendations
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <Text className="text-red-800 text-sm">• </Text>
                  <Text className="text-red-800 text-sm flex-1">
                    Settings and preferences
                  </Text>
                </View>
              </View>
            </View>

            {/* Recovery Notice */}
            <View className="bg-gray-100 rounded-lg p-4 mb-6">
              <Text className="text-gray-700 text-sm">
                <Text className="font-bold">Account Recovery: </Text>
                You won't be able to recover your account once deleted.
              </Text>
            </View>

            {/* Confirmation Input */}
            <View className="mb-6">
              <Text className="text-black text-sm mb-2">
                Type <Text className="text-red-600 font-bold">"DELETE MY ACCOUNT"</Text> to confirm
              </Text>
              <TextInput
                className="bg-white border-2 border-gray-300 rounded-xl px-4 py-3 text-base"
                placeholder="Type here..."
                placeholderTextColor="#9ca3af"
                value={confirmText}
                onChangeText={setConfirmText}
                autoCapitalize="characters"
              />
            </View>

            {/* Action Buttons */}
            <TouchableOpacity 
              className={`rounded-2xl py-4 items-center mb-3 ${
                isConfirmValid ? 'bg-red-600' : 'bg-gray-300'
              }`}
              activeOpacity={0.8}
              onPress={handleDelete}
              disabled={!isConfirmValid}
            >
              <Text className={`text-lg font-bold ${
                isConfirmValid ? 'text-white' : 'text-gray-500'
              }`}>
                Delete My Account
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white border-2 border-gray-300 rounded-2xl py-4 items-center mb-6"
              activeOpacity={0.8}
              onPress={onClose}
            >
              <Text className="text-gray-700 text-lg font-semibold">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}