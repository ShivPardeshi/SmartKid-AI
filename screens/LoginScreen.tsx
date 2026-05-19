import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  KeyboardAvoidingView, Platform, Alert, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

export const LoginScreen = ({ navigation }: any) => {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Please enter email and password.');
      return;
    }
    setIsLoading(true);
    try { await login(email, password); }
    catch (e: any) { Alert.alert('Login failed', e.message || 'Try again.'); }
    finally { setIsLoading(false); }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.logoArea}>
        <View style={styles.logoBox}>
          <Ionicons name="school" size={32} color={COLORS.primary} />
        </View>
        <Text style={styles.appName}>SmartKid AI</Text>
        <Text style={styles.tagline}>Sign in to continue learning</Text>
      </View>

      <View style={styles.form}>
        {/* Demo hint */}
        <View style={styles.hint}>
          <Text style={styles.hintText}>Demo: shiv@gmail.com · pass123</Text>
        </View>

        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor={COLORS.lightText}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputWrap}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Password"
            placeholderTextColor={COLORS.lightText}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
          />
          <TouchableOpacity onPress={() => setShowPass(v => !v)} style={styles.eyeBtn}>
            <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.lightText} />
          </TouchableOpacity>
        </View>

        <Button
          title={isLoading ? 'Signing in…' : 'Sign In'}
          onPress={handleLogin}
          disabled={isLoading}
          variant="primary"
          fullWidth
        />
        <Button
          title="Create account"
          variant="outline"
          onPress={() => navigation.navigate('Register')}
          disabled={isLoading}
          fullWidth
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  logoArea: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  logoBox: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    ...SHADOWS.light,
  },
  appName: {
    fontSize: SIZES.xxlarge,
    fontWeight: '900',
    color: COLORS.darkText,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  tagline: { fontSize: SIZES.small + 1, color: COLORS.textMuted },
  form: {
    flex: 0.6,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    ...SHADOWS.medium,
  },
  hint: {
    backgroundColor: COLORS.accentLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.accent + '60',
  },
  hintText: { fontSize: SIZES.small, color: COLORS.text, fontWeight: '500' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: 12,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  eyeBtn: { padding: 4 },
});
