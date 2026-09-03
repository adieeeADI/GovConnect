import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, BackHandler, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomStatusBar from '../components/CustomStatusBar';
import { ArrowLeft, Upload, CheckCircle2, Globe } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, safeFetchJson } from '../../config/api.config';
import { useTranslation } from '../../utils/i18n';
import LanguageSelectorModal from '../../components/LanguageSelectorModal';

export default function SignUpScreen3() {
  const params = useLocalSearchParams();
  const { t } = useTranslation();

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [notifyOpportunities, setNotifyOpportunities] = useState(true);
  const [forgeryWarning, setForgeryWarning] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [uploadedAsset, setUploadedAsset] = useState<any>(null);
  const [parsingResume, setParsingResume] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const handleBackConfirm = () => {
    Alert.alert(
      t('leave_page'),
      t('unsaved_changes_warning'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('yes'), onPress: () => router.back() }
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

  function uint8ArrayToBase64(bytes: Uint8Array): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let base64 = '';
    const len = bytes.length;
    for (let i = 0; i < len; i += 3) {
      const b1 = bytes[i];
      const b2 = i + 1 < len ? bytes[i + 1] : 0;
      const b3 = i + 2 < len ? bytes[i + 2] : 0;

      const c1 = b1 >> 2;
      const c2 = ((b1 & 3) << 4) | (b2 >> 4);
      const c3 = ((b2 & 15) << 2) | (b3 >> 6);
      const c4 = b3 & 63;

      base64 += chars[c1] + chars[c2] +
        (i + 1 < len ? chars[c3] : '=') +
        (i + 2 < len ? chars[c4] : '=');
    }
    return base64;
  }

  const readAssetBase64 = async (asset: any): Promise<string> => {
    if (!asset || !asset.uri) return '';
    try {
      const response = await fetch(asset.uri);
      const arrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      return uint8ArrayToBase64(bytes);
    } catch (err: any) {
      console.log('Error converting asset URI to Base64:', err);
      throw err;
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain'
        ],
        copyToCacheDirectory: true
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setUploadedFile(asset.name);
        setUploadedAsset(asset);
        setParsingResume(true);

        try {
          const base64Data = await readAssetBase64(asset);

          const parseRes = await safeFetchJson(API_ENDPOINTS.PARSE_RESUME, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              base64: base64Data,
              fileName: asset.name
            })
          });

          if (parseRes && parseRes.parsed) {
            setParsedData(parseRes.parsed);
            Alert.alert(
              t('ai_resume_parsed'),
              `${t('extracted_info')}:\n• ${t('education')}: ${parseRes.parsed.education || 'N/A'}\n• ${t('skills')} (${parseRes.parsed.skills?.length || 0}): ${parseRes.parsed.skills?.slice(0, 4).join(', ') || 'N/A'}\n• ${t('category')}: ${parseRes.parsed.category || 'N/A'}\n\n${t('profile_customized')}`
            );
          }
        } catch (err: any) {
          console.log('Resume parsing error:', err);
          Alert.alert(t('notice'), t('file_uploaded_parsing_retry'));
        } finally {
          setParsingResume(false);
        }
      }
    } catch {
      Alert.alert(t('error'), t('failed_to_pick_document'));
    }
  };

  const handleSubmit = async () => {
    if (!agreedToTerms) {
      Alert.alert(t('error'), t('must_agree_to_terms'));
      return;
    }

    setLoading(true);

    try {
      let activeParsedData = parsedData;
      if (!activeParsedData && uploadedAsset) {
        setParsingResume(true);
        try {
          const base64Data = await readAssetBase64(uploadedAsset);
          const parseRes = await safeFetchJson(API_ENDPOINTS.PARSE_RESUME, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              base64: base64Data,
              fileName: uploadedAsset.name
            })
          });
          if (parseRes && parseRes.parsed) {
            activeParsedData = parseRes.parsed;
            setParsedData(parseRes.parsed);
          }
        } catch (err) {
          console.log('Fallback parsing error in handleSubmit:', err);
        } finally {
          setParsingResume(false);
        }
      }

      // 1. Extract skills from step inputs
      let stepSkills: string[] = [];
      if (params.skills) {
        if (typeof params.skills === 'string' && (params.skills as string).trim()) {
          stepSkills = (params.skills as string).split(',').map(s => s.trim()).filter(Boolean);
        } else if (Array.isArray(params.skills)) {
          stepSkills = params.skills;
        }
      }

      // Merge stepSkills with AI parsed resume skills
      const resumeSkills: string[] = Array.isArray(activeParsedData?.skills) ? activeParsedData.skills : [];
      const combinedSkills = Array.from(new Set([...stepSkills, ...resumeSkills]));

      // 2. Extract interests from step inputs
      let stepInterests: string[] = [];
      if (params.selectedInterests) {
        try {
          const parsed = typeof params.selectedInterests === 'string'
            ? JSON.parse(params.selectedInterests as string)
            : params.selectedInterests;
          if (Array.isArray(parsed)) stepInterests = parsed;
        } catch (e) {
          console.log('Error parsing selectedInterests:', e);
        }
      }

      // Merge stepInterests with AI parsed resume interests
      const resumeInterests: string[] = Array.isArray(activeParsedData?.interests) ? activeParsedData.interests : [];
      const combinedInterests = Array.from(new Set([...stepInterests, ...resumeInterests]));

      const data = await safeFetchJson(
        API_ENDPOINTS.SIGNUP,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            fullName: params.fullName || activeParsedData?.fullName || "",
            email: params.email,
            phone: params.phone || activeParsedData?.phone || "",
            location: params.location || activeParsedData?.location || "",
            password: params.password,
            education: params.education || activeParsedData?.education || "",
            skills: combinedSkills,
            interests: combinedInterests,
            category: activeParsedData?.category || "Job Seeker",
            agreedToTerms,
            notifyOpportunities,
            forgeryWarning
          })
        }
      );

      if (data && data.user) {
        await AsyncStorage.setItem('userId', data.user.id);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
      }

      Alert.alert("Success", "Account created successfully! Welcome to GovConnect.");
      router.replace("/main/home");

    } catch (err: any) {
      Alert.alert("Error", err.message || "Signup failed. Please try again.");
    }

    setLoading(false);
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
            {t('ai_resume_parser')}
          </Text>

          <TouchableOpacity
            className="flex-row items-center bg-gray-100 border border-gray-200 px-3 py-2 rounded-xl"
            activeOpacity={0.8}
            onPress={() => setLangModalVisible(true)}
          >
            <Globe color="#1e40af" size={18} />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-600 text-sm font-semibold">Step 3 of 3</Text>
            <Text className="text-gray-600 text-sm font-semibold">100%</Text>
          </View>
          <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <View className="h-full bg-blue-700 rounded-full" style={{ width: '100%' }} />
          </View>
        </View>

        {/* Upload Resume */}
        <TouchableOpacity
          className="bg-blue-50 rounded-2xl py-7 px-4 items-center mb-4 border-2 border-dashed border-blue-300"
          activeOpacity={0.8}
          onPress={pickDocument}
          disabled={parsingResume}
        >
          {parsingResume ? (
            <View className="items-center py-2">
              <ActivityIndicator size="large" color="#1d4ed8" />
              <Text className="text-blue-900 text-lg font-bold mt-3">
                ✨ Analyzing Resume with AI...
              </Text>
              <Text className="text-blue-600 text-xs mt-1">
                Extracting skills, education & career goals using Gemini
              </Text>
            </View>
          ) : (
            <View className="items-center">
              <Upload color="#1e40af" size={36} strokeWidth={2} />
              <Text className="text-blue-900 text-xl font-bold mt-2">
                {uploadedFile ? "Replace Resume" : "Upload Resume (PDF / DOC)"}
              </Text>
              <Text className="text-gray-500 text-xs mt-1 text-center">
                Auto-extracts skills, education & personalized scheme recommendations
              </Text>

              {uploadedFile && (
                <View className="flex-row items-center mt-3 bg-blue-100 px-3 py-1.5 rounded-full">
                  <CheckCircle2 size={16} color="#1e40af" />
                  <Text className="text-blue-900 text-xs font-semibold ml-1.5" numberOfLines={1}>
                    {uploadedFile}
                  </Text>
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>

        {/* Parsing Progress Banner */}
        {parsingResume && (
          <View className="bg-blue-50 border-2 border-blue-400 rounded-2xl p-4 mb-4">
            <View className="flex-row items-center mb-2">
              <ActivityIndicator color="#1d4ed8" size="small" className="mr-2" />
              <Text className="text-blue-900 text-base font-bold ml-2">
                ✨ AI Resume Analysis in Progress...
              </Text>
            </View>
            <Text className="text-blue-700 text-xs font-medium">
              Please wait while Gemini AI parses skills, education, and interests from your document. "Start Exploring" will enable as soon as analysis completes.
            </Text>
          </View>
        )}

        {/* Parsed Data Preview Card */}
        {parsedData && !parsingResume && (
          <View className="bg-green-50 border border-green-300 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <CheckCircle2 color="#15803d" size={20} />
                <Text className="text-green-900 text-base font-bold ml-2">
                  ✨ Resume Extracted Successfully!
                </Text>
              </View>
              {parsedData.category ? (
                <Text className="text-green-800 text-xs font-bold bg-green-200/80 px-2.5 py-1 rounded-full">
                  {parsedData.category}
                </Text>
              ) : null}
            </View>

            {parsedData.education ? (
              <View className="mb-2.5">
                <Text className="text-gray-500 text-xs font-semibold mb-0.5">Education Found:</Text>
                <Text className="text-gray-900 text-sm font-bold">{parsedData.education}</Text>
              </View>
            ) : null}

            {Array.isArray(parsedData.skills) && parsedData.skills.length > 0 ? (
              <View className="mb-2.5">
                <Text className="text-gray-500 text-xs font-semibold mb-1.5">
                  Extracted Skills ({parsedData.skills.length}):
                </Text>
                <View className="flex-row flex-wrap">
                  {parsedData.skills.map((skill: string, index: number) => (
                    <View key={index} className="bg-green-200/80 rounded-full px-3 py-1 mr-1.5 mb-1.5">
                      <Text className="text-green-900 text-xs font-bold">{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {Array.isArray(parsedData.interests) && parsedData.interests.length > 0 ? (
              <View>
                <Text className="text-gray-500 text-xs font-semibold mb-1.5">
                  Extracted Interests ({parsedData.interests.length}):
                </Text>
                <View className="flex-row flex-wrap">
                  {parsedData.interests.map((interest: string, index: number) => (
                    <View key={index} className="bg-emerald-200/80 rounded-full px-3 py-1 mr-1.5 mb-1.5">
                      <Text className="text-emerald-900 text-xs font-bold">{interest}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        )}

        {/* Checkboxes */}
        <TouchableOpacity
          className="flex-row items-center mb-4"
          onPress={() => setAgreedToTerms(!agreedToTerms)}
        >
          <View className={`w-6 h-6 border-2 border-gray-800 rounded mr-3 items-center justify-center ${
            agreedToTerms ? 'bg-blue-700' : 'bg-white'
          }`}>
            {agreedToTerms && (
              <Text className="text-white text-sm font-bold">✓</Text>
            )}
          </View>
          <Text className="text-black text-base flex-1">
            I agree to terms and privacy policy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center mb-4"
          onPress={() => setNotifyOpportunities(!notifyOpportunities)}
        >
          <View className={`w-6 h-6 border-2 border-gray-800 rounded mr-3 items-center justify-center ${
            notifyOpportunities ? 'bg-blue-700' : 'bg-white'
          }`}>
            {notifyOpportunities && (
              <Text className="text-white text-sm font-bold">✓</Text>
            )}
          </View>
          <Text className="text-black text-base flex-1">
            Notify me about new opportunities
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center mb-8"
          onPress={() => setForgeryWarning(!forgeryWarning)}
        >
          <View className={`w-6 h-6 border-2 border-gray-800 rounded mr-3 items-center justify-center ${
            forgeryWarning ? 'bg-blue-700' : 'bg-white'
          }`}>
            {forgeryWarning && (
              <Text className="text-white text-sm font-bold">✓</Text>
            )}
          </View>
          <Text className="text-black text-base flex-1">
            Forgery will lead to cancellation
          </Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          className={`rounded-2xl py-4 items-center flex-row justify-center ${
            parsingResume
              ? 'bg-gray-400 opacity-80'
              : loading
              ? 'bg-blue-800'
              : agreedToTerms
              ? 'bg-blue-700'
              : 'bg-gray-300'
          }`}
          activeOpacity={0.8}
          onPress={handleSubmit}
          disabled={loading || parsingResume || !agreedToTerms}
        >
          {parsingResume ? (
            <>
              <ActivityIndicator color="#ffffff" size="small" style={{ marginRight: 8 }} />
              <Text className="text-white text-xl font-bold">
                AI PARSING RESUME...
              </Text>
            </>
          ) : loading ? (
            <>
              <ActivityIndicator color="#ffffff" size="small" style={{ marginRight: 8 }} />
              <Text className="text-white text-xl font-bold">
                CREATING ACCOUNT...
              </Text>
            </>
          ) : (
            <Text className="text-white text-xl font-bold">
              START EXPLORING
            </Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
