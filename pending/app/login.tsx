import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { router } from 'expo-router';
import { signInWithApple } from '../src/auth';
import { colors, typography, spacing, radius } from '../../pending/theme';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAppleSignIn() {
    setLoading(true);
    setError(null);
    try {
      await signInWithApple();
      router.replace('/');
    } catch (e: any) {
      // ERR_CANCELED = usuário cancelou, não mostrar erro
      if (e?.code !== 'ERR_CANCELED') {
        setError('Erro ao entrar. Tenta de novo.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

      <View style={styles.container}>
        {/* Logo / identidade */}
        <View style={styles.top}>
          <Text style={styles.logo}>■</Text>
          <Text style={styles.name}>Medusa</Text>
          <Text style={styles.tagline}>Sistema operacional cognitivo pessoal</Text>
        </View>

        {/* Botão Apple */}
        <View style={styles.bottom}>
          {error && <Text style={styles.error}>{error}</Text>}

          {loading
            ? <ActivityIndicator color={colors.accent} />
            : Platform.OS === 'ios' && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={radius.md}
                style={styles.appleBtn}
                onPress={handleAppleSignIn}
              />
            )
          }

          <Text style={styles.disclaimer}>
            Seus dados ficam vinculados ao seu Apple ID.{'\n'}
            Acesse de qualquer dispositivo.
          </Text>
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
    justifyContent: 'space-between',
    paddingVertical: spacing.xxl,
  },
  top: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  logo: {
    fontSize: 40,
    color: colors.accent,
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: typography.size2XL,
    fontWeight: typography.weightSemibold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: typography.sizeMD,
    color: colors.textSecondary,
    lineHeight: typography.lineHeightBase,
  },
  bottom: {
    gap: spacing.md,
  },
  appleBtn: {
    width: '100%',
    height: 50,
  },
  error: {
    fontSize: typography.sizeSM,
    color: colors.danger,
    textAlign: 'center',
  },
  disclaimer: {
    fontSize: typography.sizeXS,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
