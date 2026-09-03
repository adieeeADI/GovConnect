import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, Platform, BackHandler, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Upload, Calendar } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_ENDPOINTS, getUserEndpoint, safeFetchJson } from '../../config/api.config';
import { clearRecommendationsCache } from '../../utils/recommendations';
import { goBackWithinApp } from '../../utils/navigation';

const INCOME_RANGES = [
  { label: 'Below ₹1L', value: 50000 },
  { label: '₹1L–3L', value: 200000 },
  { label: '₹3L–6L', value: 450000 },
  { label: '₹6L–10L', value: 800000 },
  { label: 'Above ₹10L', value: 1200000 },
];

const GENDERS = ['Male', 'Female', 'Other'];
const CATEGORIES = ['Student', 'Job Seeker', 'Farmer'];

const STEPS = [
  { title: 'Basic Info', subtitle: 'Tell us about yourself' },
  { title: 'Eligibility', subtitle: 'For scheme matching' },
  { title: 'Career', subtitle: 'Your goals & documents' },
];

export default function CompleteProfile() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1
  const [dob, setDob] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('');
  const [state, setState] = useState('');

  // Step 2
  const [caste, setCaste] = useState('');
  const [religion, setReligion] = useState('');
  const [income, setIncome] = useState(0);

  // Step 3
  const [category, setCategory] = useState('');
  const [resume, setResume] = useState<string | null>(null);
  const [parsingResume, setParsingResume] = useState(false);
  const [parsedSkills, setParsedSkills] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;
        const user = await safeFetchJson(getUserEndpoint(userId));
        if (isMounted && user) {
          if (user.dateOfBirth) setDob(new Date(user.dateOfBirth));
          if (user.gender) setGender(user.gender);
          if (user.state) setState(user.state);
          if (user.caste) setCaste(user.caste);
          if (user.religion) setReligion(user.religion);
          if (user.familyIncome) setIncome(user.familyIncome);
          if (user.category) setCategory(user.category);
          if (user.skills) setParsedSkills(user.skills);
        }
      } catch (e) {
        console.log('Error pre-loading profile data:', e);
      }
    };
    fetchUserData();
    return () => {
      isMounted = false;
    };
  }, []);

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

  const pickDoc = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain'
        ],
        copyToCacheDirectory: true
      });

      if (!res.canceled && res.assets[0]) {
        const asset = res.assets[0];
        setResume(asset.name);
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
            const p = parseRes.parsed;
            if (p.category) setCategory(p.category);
            if (p.skills && p.skills.length > 0) setParsedSkills(p.skills);

            // Auto-save extracted resume details directly to backend profile
            const userId = await AsyncStorage.getItem('userId');
            if (userId) {
              const updateRes = await safeFetchJson(API_ENDPOINTS.COMPLETE_PROFILE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId,
                  fullName: p.fullName || undefined,
                  phone: p.phone || undefined,
                  location: p.location || undefined,
                  education: p.education || undefined,
                  skills: p.skills && p.skills.length > 0 ? p.skills : undefined,
                  interests: p.interests && p.interests.length > 0 ? p.interests : undefined,
                  category: p.category || undefined,
                }),
              });
              if (updateRes && updateRes.user) {
                await AsyncStorage.setItem('userData', JSON.stringify(updateRes.user));
                await clearRecommendationsCache(userId);
              }
            }

            Alert.alert(
              '✨ AI Resume Parsed & Saved!',
              `Extracted & Saved:\n• Education: ${p.education || 'Updated'}\n• Skills (${p.skills?.length || 0}): ${p.skills?.slice(0, 4).join(', ') || 'N/A'}\n• Category: ${p.category || 'N/A'}\n\nYour profile and AI recommendations have been automatically updated!`
            );
          }
        } catch (parseErr) {
          console.log('Error parsing resume in profile:', parseErr);
        } finally {
          setParsingResume(false);
        }
      }
    } catch (err) {
      console.log('Document picker error:', err);
    }
  };

  const saveStep = async (nextStep?: number, exitAfter: boolean = false) => {
    setSubmitting(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'User ID not found');
        setSubmitting(false);
        return;
      }
      const data = await safeFetchJson(API_ENDPOINTS.COMPLETE_PROFILE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          dateOfBirth: dob ? dob.toISOString() : undefined,
          gender: gender || undefined,
          state: state || undefined,
          caste: caste || undefined,
          religion: religion || undefined,
          familyIncome: income || undefined,
          category: category || undefined,
          skills: parsedSkills.length > 0 ? parsedSkills : undefined,
        }),
      });

      if (data && data.user) {
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        await clearRecommendationsCache(userId);
      }

      if (exitAfter) {
        Alert.alert('Progress Saved', 'Your details have been saved successfully!');
        router.replace('/main/home');
      } else if (nextStep) {
        setStep(nextStep);
      } else {
        Alert.alert('Profile Complete', 'All profile details saved!');
        router.replace('/main/home');
      }
    } catch (err) {
      console.log('SAVE ERROR:', err);
      Alert.alert('Error', 'Failed to save details. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackConfirm = () => {
    if (step > 1) {
      setStep(s => s - 1);
      return;
    }
    goBackWithinApp(router);
  };

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        handleBackConfirm();
        return true;
      });
      return () => backHandler.remove();
    }, [step, router])
  );

  const formattedDOB = dob
    ? dob.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';

  return (
    <SafeAreaView className="flex-1 bg-gray-50">

      {/* Header */}
      <View className="bg-blue-900 rounded-b-3xl px-6 py-6 mb-4">
        <TouchableOpacity onPress={handleBackConfirm} activeOpacity={0.7}>
          <ArrowLeft color="#fff" size={24} strokeWidth={2} />
        </TouchableOpacity>

        <Text className="text-white text-2xl font-bold mt-4">
          {STEPS[step - 1].title}
        </Text>
        <Text className="text-blue-200 text-sm mt-1">
          {STEPS[step - 1].subtitle} — fill what you know, save anytime
        </Text>

        {/* Clickable Step Tabs */}
        <View className="flex-row items-center justify-between mt-4 mb-2">
          {STEPS.map((s, i) => (
            <TouchableOpacity
              key={i}
              className={`px-3 py-1.5 rounded-full ${step === i + 1 ? 'bg-white' : 'bg-white/20'}`}
              onPress={() => setStep(i + 1)}
              activeOpacity={0.7}
            >
              <Text className={`text-xs font-bold ${step === i + 1 ? 'text-blue-900' : 'text-white'}`}>
                {i + 1}. {s.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <View className="bg-white h-full rounded-full"
            style={{ width: `${(step / STEPS.length) * 100}%` }} />
        </View>
      </View>

      <ScrollView className="px-6" showsVerticalScrollIndicator={false}>

        {/* ── STEP 1: Basic Info ── */}
        {step === 1 && (
          <>
            {/* Date of Birth */}
            <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">
              Date of Birth
            </Text>
            <TouchableOpacity
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex-row
                         items-center justify-between mb-5"
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text className={dob ? 'text-black text-sm' : 'text-gray-400 text-sm'}>
                {dob ? formattedDOB : 'Select your date of birth'}
              </Text>
              <Calendar size={18} color="#6b7280" />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dob || new Date(2000, 0, 1)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                onChange={(_, date) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (date) setDob(date);
                }}
              />
            )}

            {/* State */}
            <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">
              State
            </Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-black mb-5"
              placeholder="e.g. Maharashtra"
              placeholderTextColor="#9ca3af"
              value={state}
              onChangeText={setState}
            />

            {/* Gender */}
            <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
              Gender
            </Text>
            <View className="flex-row flex-wrap mb-5">
              {GENDERS.map(g => (
                <TouchableOpacity
                  key={g}
                  className={`px-5 py-2 rounded-full mr-2 mb-2
                    ${gender === g ? 'bg-blue-700' : 'bg-white border border-gray-200'}`}
                  onPress={() => setGender(g)}
                  activeOpacity={0.7}
                >
                  <Text className={`text-sm font-semibold
                    ${gender === g ? 'text-white' : 'text-gray-700'}`}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* ── STEP 2: Eligibility ── */}
        {step === 2 && (
          <>
            <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">
              Caste
            </Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-black mb-5"
              placeholder="e.g. OBC, SC, ST, General"
              placeholderTextColor="#9ca3af"
              value={caste}
              onChangeText={setCaste}
            />

            <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">
              Religion
            </Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-black mb-5"
              placeholder="e.g. Hindu, Muslim, Christian"
              placeholderTextColor="#9ca3af"
              value={religion}
              onChangeText={setReligion}
            />

            {/* Income Range */}
            <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
              Annual Family Income
            </Text>
            <View className="flex-row flex-wrap mb-2">
              {INCOME_RANGES.map(range => (
                <TouchableOpacity
                  key={range.value}
                  className={`px-4 py-2 rounded-full mr-2 mb-2
                    ${income === range.value ? 'bg-green-600' : 'bg-white border border-gray-200'}`}
                  onPress={() => setIncome(range.value)}
                  activeOpacity={0.7}
                >
                  <Text className={`text-sm font-semibold
                    ${income === range.value ? 'text-white' : 'text-gray-700'}`}>
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {income > 0 && (
              <Text className="text-green-700 text-xs mb-5">
                ✓ {INCOME_RANGES.find(r => r.value === income)?.label} selected
              </Text>
            )}
          </>
        )}

        {/* ── STEP 3: Career ── */}
        {step === 3 && (
          <>
            <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
              I am a...
            </Text>
            <View className="flex-row flex-wrap mb-6">
              {CATEGORIES.map(c => (
                <TouchableOpacity
                  key={c}
                  className={`px-5 py-2 rounded-full mr-2 mb-2
                    ${category === c ? 'bg-green-600' : 'bg-white border border-gray-200'}`}
                  onPress={() => setCategory(c)}
                  activeOpacity={0.7}
                >
                  <Text className={`text-sm font-semibold
                    ${category === c ? 'text-white' : 'text-gray-700'}`}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              className="bg-white border-2 border-dashed border-gray-300 rounded-2xl
                         p-6 items-center justify-center mb-2"
              onPress={pickDoc}
              disabled={parsingResume}
              activeOpacity={0.7}
            >
              {parsingResume ? (
                <>
                  <ActivityIndicator size="small" color="#1e40af" />
                  <Text className="text-blue-900 font-semibold mt-2 text-sm">✨ AI Parsing Resume...</Text>
                  <Text className="text-gray-400 text-xs mt-1">Extracting skills & career category</Text>
                </>
              ) : (
                <>
                  <Upload size={28} color="#6b7280" />
                  <Text className="text-gray-600 font-semibold mt-2">Upload Resume</Text>
                  <Text className="text-gray-400 text-xs mt-1">PDF, DOC up to 5MB (Auto-fills profile)</Text>
                </>
              )}
            </TouchableOpacity>

            {resume && (
              <View className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex-row items-center mb-4">
                <Text className="text-green-700 text-sm flex-1 font-semibold" numberOfLines={1}>
                  ✓ {resume} {parsedSkills.length > 0 ? `(${parsedSkills.length} AI skills extracted)` : ''}
                </Text>
              </View>
            )}
          </>
        )}

        {/* Navigation / Save Buttons */}
        <View className="flex-row mt-6 mb-10">
          <TouchableOpacity
            className="flex-1 bg-gray-200 rounded-2xl p-4 mr-2"
            onPress={() => saveStep(undefined, true)}
            disabled={submitting}
            activeOpacity={0.7}
          >
            <Text className="text-gray-800 text-center font-bold text-sm">
              {submitting ? 'Saving...' : 'Save & Exit'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 rounded-2xl p-4 ml-2 ${submitting ? 'bg-blue-400' : 'bg-blue-900'}`}
            onPress={() => {
              if (step < 3) {
                saveStep(step + 1, false);
              } else {
                saveStep(undefined, false);
              }
            }}
            disabled={submitting}
            activeOpacity={0.8}
          >
            <Text className="text-white text-center font-bold text-sm">
              {step === 3 ? (submitting ? 'Saving...' : 'Save & Finish') : 'Save & Continue →'}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}