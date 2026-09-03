import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { useTranslation, LANGUAGES, LanguageCode } from '../utils/i18n';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function LanguageSelectorModal({ visible, onClose }: Props) {
  const { language, setLanguage, t } = useTranslation();

  const handleSelect = async (code: LanguageCode) => {
    await setLanguage(code);
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end sm:justify-center items-center px-4 py-6">
        <View className="bg-white w-full max-w-md rounded-3xl p-6 shadow-xl">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <Text className="text-xl font-bold text-gray-900">
              🌐 {t('select_language')}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="p-1 rounded-full bg-gray-100"
              activeOpacity={0.7}
            >
              <X size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Languages list */}
          <ScrollView className="max-h-96" showsVerticalScrollIndicator={false}>
            {LANGUAGES.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  className={`flex-row items-center justify-between p-4 mb-2.5 rounded-2xl border ${
                    isSelected
                      ? 'bg-blue-50 border-blue-600'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                  onPress={() => handleSelect(lang.code)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-3">{lang.flag}</Text>
                    <View>
                      <Text className={`text-base font-bold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                        {lang.nativeName}
                      </Text>
                      <Text className="text-xs text-gray-500">{lang.label}</Text>
                    </View>
                  </View>

                  {isSelected && (
                    <View className="w-7 h-7 rounded-full bg-blue-600 items-center justify-center">
                      <Check size={16} color="#ffffff" strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
