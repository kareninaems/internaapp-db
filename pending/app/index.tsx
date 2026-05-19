import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, radius } from '../../pending/theme';
import { GREETINGS, DIAS } from '../../src/prompts';

const ENERGY_LABELS = {
  1: { emoji: '○', label: 'Baixa', sub: 'Uma coisa só' },
  2: { emoji: '◑', label: 'Média', sub: 'Com cuidado' },
  3: { emoji: '●', label: 'Alta',  sub: 'Pode ir' },
};

export default function CheckIn() {
  const [hora, setHora] = useState('');
  const [diaSemana, setDiaSemana] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const now = new Date();
    const h = now.getHours();
    setDiaSemana(DIAS[now.getDay()]);

    if (h >= 6  && h < 12) setGreeting('Bom dia');
    else if (h >= 12 && h < 18) setGreeting('Boa tarde');
    else if (h >= 18 && h < 23) setGreeting('Boa noite');
    else setGreeting('Oi');

    setHora(`${String(h).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
  }, []);

  async function handleEnergy(level: 1 | 2 | 3) {
    const onboardingDone = await AsyncStorage.getItem('medusa_onboarding_v1');
    if (!onboardingDone) {
      router.replace('/onboarding');
      return;
    }
    await AsyncStorage.setItem('medusa_energy', String(level));
    router.push('/chat');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

      <View style={styles.container}>
        {/* Topo: setup */}
        <TouchableOpacity style={styles.setupBtn} onPress={() => router.push('/setup')}>
          <Text style={styles.setupIcon}>■■</Text>
        </TouchableOpacity>

        {/* Saudação */}
        <View style={styles.greetingBlock}>
          <Text style={styles.time}>{hora}</Text>
          <Text style={styles.day}>{diaSemana}</Text>
          <Text style={styles.greeting}>{greeting}</Text>
        </View>

        {/* Pergunta */}
        <Text style={styles.question}>Como está a energia agora?</Text>

        {/* Botões de energia */}
        <View style={styles.energyRow}>
          {([1, 2, 3] as const).map((level) => {
            const info = ENERGY_LABELS[level];
            return (
              <TouchableOpacity
                key={level}
                style={styles.energyBtn}
                onPress={() => handleEnergy(level)}
                activeOpacity={0.7}
              >
                <Text style={styles.energyEmoji}>{info.emoji}</Text>
                <Text style={styles.energyLabel}>{info.label}</Text>
                <Text style={styles.energySub}>{info.sub}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  setupBtn: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  setupIcon: {
    fontSize: typography.sizeSM,
    color: colors.textMuted,
    letterSpacing: 2,
  },
  greetingBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingBottom: spacing.xl,
  },
  time: {
    fontSize: typography.size2XL,
    fontWeight: typography.weightSemibold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  day: {
    fontSize: typography.sizeMD,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: typography.sizeXL,
    fontWeight: typography.weightMedium,
    color: colors.textPrimary,
  },
  question: {
    fontSize: typography.sizeMD,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  energyRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  energyBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  energyEmoji: {
    fontSize: typography.sizeLG,
    color: colors.accent,
    marginBottom: spacing.sm,
  },
  energyLabel: {
    fontSize: typography.sizeMD,
    fontWeight: typography.weightMedium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  energySub: {
    fontSize: typography.sizeXS,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
