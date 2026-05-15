import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  InputAccessoryView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, radius, shadow } from '../../pending/theme';

// Ajuste os imports conforme a estrutura real do seu projeto
import { sendMessage } from '../src/claude';
import { loadMemory, saveMemory } from '../src/memory';
import { SYSTEM_PROMPT } from '../src/prompts';

const INPUT_ACCESSORY_ID = 'medusa-chat-input';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [energyLevel, setEnergyLevel] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    (async () => {
      const energy = await AsyncStorage.getItem('medusa_energy');
      setEnergyLevel(energy);

      const memory = await loadMemory();
      const greeting = buildGreeting(energy, memory);
      if (greeting) {
        setMessages([{ role: 'assistant', content: greeting }]);
      }
    })();
  }, []);

  function buildGreeting(energy: string | null, memory: any): string {
    const h = new Date().getHours();
    if (h >= 23 || h < 6) return 'Horário de sono. Está bem?';
    if (energy === '1') return 'Energia baixa. Uma coisa só. O que é mais urgente?';
    if (energy === '2') return 'Energia média. O que está na cabeça?';
    return 'Energia alta. Por onde quer ir?';
  }

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const memory = await loadMemory();
      const reply = await sendMessage(updated, SYSTEM_PROMPT, memory);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Erro de conexão. Tenta de novo.',
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [input, messages, loading]);

  async function handleBack() {
    // Extrai memória ao sair
    try {
      const memory = await loadMemory();
      await saveMemory(messages, memory);
    } catch (_) {}
    router.back();
  }

  function renderMessage({ item }: { item: Message }) {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.bubbleWrap, isUser ? styles.bubbleWrapUser : styles.bubbleWrapAssistant]}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
          <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAssistant]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  }

  const inputBar = (
    <View style={styles.inputBar}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="Escreve aqui..."
        placeholderTextColor={colors.textMuted}
        multiline
        returnKeyType="send"
        blurOnSubmit={false}
        onSubmitEditing={handleSend}
        inputAccessoryViewID={INPUT_ACCESSORY_ID}
      />
      <TouchableOpacity
        style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
        onPress={handleSend}
        disabled={!input.trim() || loading}
        activeOpacity={0.7}
      >
        {loading
          ? <ActivityIndicator size="small" color={colors.surface} />
          : <Text style={styles.sendIcon}>↑</Text>
        }
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backText}>← Menu</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medusa</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Mensagens */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, i) => String(i)}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />

        {/* Input para teclado normal */}
        {Platform.OS !== 'ios' && inputBar}
      </KeyboardAvoidingView>

      {/* InputAccessoryView para Smart Keyboard (iPad) */}
      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={INPUT_ACCESSORY_ID}>
          {inputBar}
        </InputAccessoryView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
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
  messageList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  bubbleWrap: {
    flexDirection: 'row',
    marginVertical: spacing.xs,
  },
  bubbleWrapUser: {
    justifyContent: 'flex-end',
  },
  bubbleWrapAssistant: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: radius.lg,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  bubbleUser: {
    backgroundColor: colors.userBg,
    borderBottomRightRadius: radius.sm,
  },
  bubbleAssistant: {
    backgroundColor: colors.assistantBg,
    borderBottomLeftRadius: radius.sm,
    ...shadow.sm,
  },
  bubbleText: {
    fontSize: typography.sizeMD,
    lineHeight: typography.lineHeightBase,
  },
  bubbleTextUser: {
    color: colors.textPrimary,
  },
  bubbleTextAssistant: {
    color: colors.textPrimary,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizeMD,
    color: colors.textPrimary,
    maxHeight: 120,
    lineHeight: typography.lineHeightBase,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.border,
  },
  sendIcon: {
    fontSize: typography.sizeLG,
    color: colors.surface,
    fontWeight: typography.weightSemibold,
  },
});
