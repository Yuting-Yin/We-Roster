import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { login } from '../api/login';
import { healthCheck } from '../api/health';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function onTestHealth() {
    try {
      const data = await healthCheck();
      Alert.alert('Health', JSON.stringify(data)); // Expect: {"status":"UP"}
    } catch (e: any) {
      Alert.alert('Health Error', e?.message ?? 'Unknown');
    }
  }

  async function onLogin() {
    try {
      const data = await login(email, password);
      Alert.alert('Login Success', JSON.stringify(data)); // Expect: token / User Info
    } catch (e: any) {
      Alert.alert('Login Failed', e?.message ?? 'Unknown');
    }
  }

  return (
    <View style={{ padding: 16 }}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <View style={{ height: 8 }} />
      <Button title="Test Backend (health)" onPress={onTestHealth} />
      <View style={{ height: 8 }} />
      <Button title="Log in" onPress={onLogin} />
    </View>
  );
}

