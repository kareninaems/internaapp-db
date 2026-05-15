import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, radius } from '../../pending/theme';
import { saveLaudo, loadLaudo, deleteLaudo } from '../src/laudo';

const KEYS_TO_RESET = [
  'medusa_onboarding_v1',
  'medusa_energy',
  'medusa_memory',
  'medusa_history',
];

export default function Setup() {
  const [supabaseKey, setSupabaseKey]   = useState('');
  const [saved, setSaved]               = useState(false);
  const [laudo, setLaudo]               = useState('');
  const [laudoFonte, setLaudoFonte]     = useState('');
  const [laudoSaved, setLaudoSaved]     = useState(false);
  const [laudoLoaded, setLaudoLoaded]   = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('medusa_supabase_anon_key').then(v => {
      if (v) setSupabaseKey(v);
    });
    loadLaudo().then(l => {
      if (l) {
        setLaudo(l.conteudo);
        setLaudoFonte(l.fonte ?? '');
        setLaudoLoaded(true);
      }
    });
  }, []);

  async function handleSave() {
    await AsyncStorage.setItem('medusa_supabase_anon_key', supabaseKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function confirmReset() {
    Alert.alert(
      'Apagar tudo?',
      'Isso remove onboarding, memória e histórico. Não tem volta.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: handleReset },
      ]
    );
  }

  async function handleSaveLaudo() {
    if (!laudo.trim()) return;
    await saveLaudo({ conteudo: laudo.trim(), fonte: laudoFonte.trim() || undefined });
    setLaudoSaved(true);
    setLaudoLoaded(true);
    setTimeout(() => setLaudoSaved(false), 2000);
  }

  function confirmDeleteLaudo() {
    Alert.alert(
      'Remover laudo?',
      'O laudo será apagado do servidor. O onboarding continua ativo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: async () => {
          await deleteLaudo();
          setLaudo('');
          setLaudoFonte('');
          setLaudoLoaded(false);
        }},
      ]
    );
  }

  async function handleReset() {
    await Promise.all(KEYS_TO_RESET.map(k => AsyncStorage.removeItem(k)));
    router.replace('/');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Setup</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Seção: Chave Supabase */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supabase Anon Key</Text>
          <Text style={styles.sectionDesc}>
            Necessária para sincronizar dados entre dispositivos. Deixe em branco para usar só local.
          </Text>
          <TextInput
            style={styles.input}
            value={supabaseKey}
            onChangeText={setSupabaseKey}
            placeholder="sb_publishable_..."
            placeholderTextColor={colors.textMuted}
            autoCorrect={false}
            autoCapitalize="none"
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.btn, saved && styles.btnSaved]}
            onPress={handleSave}
            activeOpacity={0.7}
          >
            <Text style={styles.btnText}>{saved ? 'Salvo ✓' : 'Salvar'}</Text>
          </TouchableOpacity>
        </View>

        {/* Divisor */}
        <View style={styles.divider} />

        {/* Seção: Laudo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Laudo clínico</Text>
          <Text style={styles.sectionDesc}>
            Cole aqui o conteúdo do seu laudo. Fica armazenado com segurança e é usado pela Medusa para calibrar respostas ao seu perfil real.
          </Text>
          <TextInput
            style={styles.input}
            value={laudoFonte}
            onChangeText={setLaudoFonte}
            placeholder="Fonte: CID-11, DSM-5, neuropsicológico..."
            placeholderTextColor={colors.textMuted}
            autoCorrect={false}
          />
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={laudo}
            onChangeText={setLaudo}
            placeholder="Cole aqui o texto do laudo..."
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.btn, laudoSaved && styles.btnSaved]}
            onPress={handleSaveLaudo}
            disabled={!laudo.trim()}
            activeOpacity={0.7}
          >
            <Text style={styles.btnText}>
              {laudoSaved ? 'Salvo ✓' : laudoLoaded ? 'Atualizar laudo' : 'Salvar laudo'}
            </Text>
          </TouchableOpacity>
          {laudoLoaded && (
            <TouchableOpacity
              style={[styles.btn, styles.btnOutline]}
              onPress={confirmDeleteLaudo}
              activeOpacity={0.7}
            >
              <Text style={[styles.btnText, styles.btnTextOutline]}>Remover laudo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Divisor */}
        <View style={styles.divider} />

        {/* Seção: Onboarding */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perfil cognitivo</Text>
          <Text style={styles.sectionDesc}>
            Refazer as perguntas de onboarding para atualizar seu perfil.
          </Text>
          <TouchableOpacity
            style={[styles.btn, styles.btnOutline]}
            onPress={() => router.push('/onboarding')}
            activeOpacity={0.7}
          >
            <Text style={[styles.btnText, styles.btnTextOutline]}>Refazer onboarding</Text>
          </TouchableOpacity>
        </View>

        {/* Divisor */}
        <View style={styles.divider} />

        {/* Seção: Reset */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>Zona de perigo</Text>
          <Text style={styles.sectionDesc}>
            Apaga todos os dados locais: onboarding, memória e histórico.
          </Text>
          <TouchableOpacity
            style={[styles.btn, styles.btnDanger]}
            onPress={confirmReset}
            activeOpacity={0.7}
          >
            <Text style={[styles.btnText, styles.btnTextDanger]}>Apagar todos os dados</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  backBtn: {
    paddingVertical: spacing.xs,
    paddingRight: spacing.md,
  },
  backText: {
    fontSize: typography.sizeMD,
    color: colors.accent,
    fontWeight: typography.weightMedium,
  },
  headerTitle: {
    fontSize: typography.sizeMD,
    fontWeight: typography.weightSemibold,
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  headerRight: {
    width: 60,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizeMD,
    fontWeight: typography.weightSemibold,
    color: colors.textPrimary,
  },
  sectionDesc: {
    fontSize: typography.sizeSM,
    color: colors.textSecondary,
    lineHeight: typography.lineHeightBase,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.sizeSM,
    color: colors.textPrimary,
  },
  inputMultiline: {
    height: 160,
    paddingTop: spacing.sm + 2,
    lineHeight: typography.lineHeightBase,
  },
  btn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  btnSaved: {
    backgroundColor: colors.accentLight,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  btnDanger: {
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  btnText: {
    fontSize: typography.sizeMD,
    fontWeight: typography.weightMedium,
    color: colors.surface,
  },
  btnTextOutline: {
    color: colors.accent,
  },
  btnTextDanger: {
    color: colors.danger,
  },
  dangerTitle: {
    color: colors.danger,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
});
