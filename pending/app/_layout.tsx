import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { getSession } from '../src/auth';
import { colors } from '../../pending/theme';

export default function Layout() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getSession().then(session => {
      if (!session) router.replace('/login');
      setChecking(false);
    });
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
