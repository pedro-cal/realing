import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { colors } from '@repo/tokens';

export default function MobilePracticeScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const sampleTargetText = 'Buenos días, ¿cómo estás hoy?';

  const handleToggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      setHasSubmitted(false);
    } else {
      setIsRecording(false);
      setHasSubmitted(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Cumulative Role Pills */}
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Student (Spanish)</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: '#e0e7ff' }]}>
            <Text style={[styles.badgeText, { color: '#4338ca' }]}>Teacher</Text>
          </View>
        </View>

        {/* Lesson Card */}
        <View style={styles.card}>
          <Text style={styles.cardSub}>Spanish A1 • Pronunciation</Text>
          <Text style={styles.phrasePrompt}>&ldquo;{sampleTargetText}&rdquo;</Text>
          <Text style={styles.ipaText}>IPA: [ˈbwe.noz ˈði.as ˈko.mo esˈtas oi]</Text>
        </View>

        {/* Press to Speak Button */}
        <View style={styles.micSection}>
          <TouchableOpacity
            onPress={handleToggleRecord}
            activeOpacity={0.8}
            style={[
              styles.micButton,
              isRecording ? styles.micButtonActive : styles.micButtonIdle,
            ]}
          >
            <Text style={styles.micIcon}>{isRecording ? '⏹️' : '🎙️'}</Text>
          </TouchableOpacity>
          <Text style={styles.micLabel}>
            {isRecording ? 'Listening... Tap to evaluate' : 'Tap microphone to speak'}
          </Text>
        </View>

        {/* Evaluation Feedback */}
        {hasSubmitted && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>AI Pronunciation Score</Text>
              <Text style={styles.scoreNumber}>94%</Text>
            </View>
            <Text style={styles.feedbackText}>
              Great fluency! The trill on &apos;Buenos&apos; and cadence on &apos;¿cómo estás?&apos; were clear and natural.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    width: '100%',
  },
  badge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 32,
  },
  cardSub: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  phrasePrompt: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 32,
    marginBottom: 6,
  },
  ipaText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
  micSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  micButtonIdle: {
    backgroundColor: colors.brand[600],
  },
  micButtonActive: {
    backgroundColor: colors.feedback.incorrect,
  },
  micIcon: {
    fontSize: 32,
  },
  micLabel: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  resultCard: {
    width: '100%',
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#065f46',
  },
  scoreNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#059669',
  },
  feedbackText: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
  },
});
