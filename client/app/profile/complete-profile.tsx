import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Upload, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

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

  const pickDoc = async () => {
    const res = await DocumentPicker.getDocumentAsync({});
    if (!res.canceled) setResume(res.assets[0].name);
  };

  const next = () => {
    if (step < 3) setStep(step + 1);
    else submit();
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const res = await fetch('https://govconnect-ad4s.onrender.com/api/auth/complete-profile', {
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
        }),
      });
      if (!res.ok) throw new Error('Failed');
      Alert.alert('Done', 'Profile Updated!');
      router.replace('/main/home');
    } catch (err) {
        console.log("SAVE ERROR:", err);
        Alert.alert('Error', JSON.stringify(err));
      }  finally {
      setSubmitting(false);
    }
  };

  const formattedDOB = dob
    ? dob.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';

  return (
    <SafeAreaView className="flex-1 bg-gray-50">

      {/* Header */}
      <View className="bg-blue-900 rounded-b-3xl px-6 py-6 mb-4">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft color="#fff" size={24} strokeWidth={2} />
        </TouchableOpacity>

        <Text className="text-white text-2xl font-bold mt-4">
          {STEPS[step - 1].title}
        </Text>
        <Text className="text-blue-200 text-sm mt-1">
          {STEPS[step - 1].subtitle} — fill what you know, skip the rest
        </Text>

        {/* Step dots + progress bar */}
        <View className="flex-row items-center mt-4 mb-1">
          {STEPS.map((_, i) => (
            <View key={i} className={`w-2 h-2 rounded-full mr-1
              ${i + 1 <= step ? 'bg-white' : 'bg-white/30'}`} />
          ))}
          <Text className="text-white/60 text-xs ml-2">{step} of {STEPS.length}</Text>
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
              activeOpacity={0.7}
            >
              <Upload size={28} color="#6b7280" />
              <Text className="text-gray-600 font-semibold mt-2">Upload Resume</Text>
              <Text className="text-gray-400 text-xs mt-1">PDF, DOC up to 5MB</Text>
            </TouchableOpacity>

            {resume && (
              <View className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex-row items-center mb-4">
                <Text className="text-green-700 text-sm flex-1" numberOfLines={1}>✓ {resume}</Text>
              </View>
            )}
          </>
        )}

        {/* Navigation Buttons */}
        <View className="flex-row mt-6 mb-10">
          {step > 1 && (
            <TouchableOpacity
              className="flex-1 bg-gray-200 rounded-2xl p-4 mr-3"
              onPress={() => setStep(step - 1)}
              activeOpacity={0.7}
            >
              <Text className="text-gray-700 text-center font-bold">Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            className={`flex-1 rounded-2xl p-4 ${submitting ? 'bg-blue-400' : 'bg-blue-700'}`}
            onPress={next}
            disabled={submitting}
            activeOpacity={0.8}
          >
            <Text className="text-white text-center font-bold">
              {step === 3 ? (submitting ? 'Saving...' : 'Submit') : 'Next →'}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}