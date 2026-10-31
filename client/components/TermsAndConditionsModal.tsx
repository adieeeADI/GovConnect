import React, { useState } from 'react';
import { Alert, Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { X } from 'lucide-react-native';
import { AppText as Text } from './ScaledText';

const easterEggVideos = require.context(
  '../assets/videos',
  false,
  /^\.\/GovConnect-Easter-Egg\.mp4$/,
);

function getEasterEggVideoSource(): number | null {
  const assetPath = './GovConnect-Easter-Egg.mp4';
  return easterEggVideos.keys().includes(assetPath)
    ? easterEggVideos(assetPath) as number
    : null;
}

interface TermsAndConditionsModalProps {
  visible: boolean;
  onClose: () => void;
}

function EasterEggVideo({ source, onClose }: { source: number; onClose: () => void }) {
  const player = useVideoPlayer(source, (videoPlayer) => {
    videoPlayer.loop = false;
    videoPlayer.muted = false;
    videoPlayer.audioMixingMode = 'doNotMix';
    videoPlayer.play();
  });

  return (
    <Modal visible animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View className="flex-1 bg-black">
        <View className="flex-1 items-center justify-center">
          <VideoView
            player={player}
            nativeControls={false}
            contentFit="contain"
            style={{ width: '100%', height: '100%' }}
          />
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Close video"
          onPress={onClose}
          className="absolute right-5 top-12 w-11 h-11 rounded-full bg-black/70 border border-white/50 items-center justify-center"
          hitSlop={10}
        >
          <X color="#ffffff" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

export default function TermsAndConditionsModal({
  visible,
  onClose,
}: TermsAndConditionsModalProps) {
  const [easterEggVisible, setEasterEggVisible] = useState(false);
  const [videoSource, setVideoSource] = useState<number | null>(null);

  const closeEasterEgg = () => setEasterEggVisible(false);

  const playEasterEggVideo = () => {
    const source = getEasterEggVideoSource();
    if (source === null) {
      Alert.alert(
        'Video not found',
        'Add GovConnect-Easter-Egg.mp4 to client/assets/videos and reload the app.',
      );
      return;
    }
    setVideoSource(source);
  };

  return (
    <>
      <Modal
        visible={visible && !easterEggVisible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View className="flex-1 bg-black/50 justify-center px-6 py-10">
          <View className="bg-white rounded-3xl p-6 max-h-full">
            <Text className="text-gray-900 text-2xl font-bold mb-3">
              Terms & Conditions
            </Text>
            <ScrollView showsVerticalScrollIndicator>
              <Text className="text-gray-900 text-base font-bold mb-1">
                1. Account Information
              </Text>
              <Text className="text-gray-700 text-sm leading-6 mb-4">
                You agree to provide accurate, current information when
                registering and to update it when it changes. You are
                responsible for maintaining the confidentiality of your
                credentials and for activity carried out through your account.
              </Text>
              <Text className="text-gray-900 text-base font-bold mb-1">
                2. Use of the Service
              </Text>
              <Text className="text-gray-700 text-sm leading-6 mb-4">
                GovConnect provides tools to discover and review education,
                employment, training, and public-benefit opportunities. You
                agree to use the service lawfully and not to misuse, disrupt,
                or attempt to gain unauthorized access to any account or
                system.
              </Text>
              <Text className="text-gray-900 text-base font-bold mb-1">
                3. Opportunity Information
              </Text>
              <Text className="text-gray-700 text-sm leading-6 mb-4">
                Opportunity descriptions and eligibility details are provided
                for informational purposes and may be supplied by third parties.
                Government information (
                <Text
                  accessibilityRole="link"
                  accessibilityLabel="GI"
                  className="text-gray-900 font-extrabold"
                  onPress={() => {
                    onClose();
                    setEasterEggVisible(true);
                  }}
                >
                  GI
                </Text>
                ) and other listings may change without notice. You are
                responsible for confirming current requirements, deadlines, and
                application details with the official provider. GovConnect does
                not make application decisions on behalf of providers.
              </Text>
              <Text className="text-gray-900 text-base font-bold mb-1">
                4. Account Security and Availability
              </Text>
              <Text className="text-gray-700 text-sm leading-6 mb-4">
                Please notify us if you believe your account has been accessed
                without permission. We may temporarily restrict access to
                protect users, maintain the service, or address suspected
                violations of these terms. We may modify or discontinue
                features where reasonably necessary.
              </Text>
              <Text className="text-gray-900 text-base font-bold mb-1">
                5. Acceptance and Updates
              </Text>
              <Text className="text-gray-700 text-sm leading-6 mb-4">
                By selecting the acceptance checkbox and continuing, you
                acknowledge that you have read and agree to these Terms &
                Conditions. Updated terms will be presented through the
                application, and continued use after an update constitutes
                acceptance of the revised terms.
              </Text>
            </ScrollView>
            <TouchableOpacity
              className="bg-blue-900 rounded-xl py-3 items-center mt-2"
              onPress={onClose}
            >
              <Text className="text-white font-bold text-base">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={easterEggVisible}
        transparent
        animationType="fade"
        onRequestClose={closeEasterEgg}
      >
        <View className="flex-1 bg-black/60 justify-center px-6">
          <View className="bg-amber-100 border-2 border-amber-400 rounded-3xl p-6 items-center">
            <Text className="text-amber-700 text-sm font-extrabold uppercase tracking-widest mb-2">
              Secret unlocked
            </Text>
            <Text className="text-amber-950 text-2xl font-extrabold mb-5">
              The GI Hall of Fame
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Play easter egg video"
              delayLongPress={3500}
              onLongPress={playEasterEggVideo}
              activeOpacity={0.8}
            >
              <Text className="text-amber-900 text-lg font-bold mb-2">
                LiterallyME(AdieP)
              </Text>
            </TouchableOpacity>
            <Text className="text-amber-900 text-lg font-bold mb-2">InsaneSP(SmitP)</Text>
            <Text className="text-amber-900 text-lg font-bold mb-2">Parasyte(VedR)</Text>
            <Text className="text-amber-900 text-lg font-bold mb-6">RunDownTrex(AdiG)</Text>
            <TouchableOpacity
              className="bg-amber-500 rounded-xl px-8 py-3"
              onPress={closeEasterEgg}
            >
              <Text className="text-amber-950 font-extrabold">Nice</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {videoSource !== null && (
        <EasterEggVideo
          source={videoSource}
          onClose={() => setVideoSource(null)}
        />
      )}
    </>
  );
}
