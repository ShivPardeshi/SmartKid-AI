import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  KeyboardAvoidingView, Platform, Alert, ScrollView, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

export const RegisterScreen = ({ navigation }: any) => {
  const { register } = useAuth();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Missing info', 'Please fill all fields.');
      return;
    }
    setIsLoading(true);
    try { await register(name, email, password); }
    catch (e: any) { Alert.alert('Registration failed', e.message || 'Try again.'); }
    finally { setIsLoading(false); }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.logoArea}>
        <View style={styles.logoBox}>
          <Ionicons name="person-add" size={30} color={COLORS.secondary} />
        </View>
        <Text style={styles.appName}>Create Account</Text>
        <Text style={styles.tagline}>Join SmartKid AI</Text>
      </View>

      <ScrollView
        style={styles.form}
        contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={COLORS.lightText}
            value={name}
            onChangeText={setName}
          />
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
          title={isLoading ? 'Creating…' : 'Sign Up'}
          variant="secondary"
          onPress={handleRegister}
          disabled={isLoading}
          fullWidth
        />
        <Button
          title="Already have an account?"
          variant="ghost"
          onPress={() => navigation.navigate('Login')}
          disabled={isLoading}
          fullWidth
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  logoArea: {
    flex: 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.secondary + '30',
    ...SHADOWS.light,
  },
  appName: {
    fontSize: SIZES.xlarge,
    fontWeight: '800',
    color: COLORS.darkText,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  tagline: { fontSize: SIZES.small + 1, color: COLORS.textMuted },
  form: {
    flex: 0.65,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...SHADOWS.medium,
  },
  formContent: { padding: 24 },
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
