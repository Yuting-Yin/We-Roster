import { useState } from 'react';
import { View, TextInput, Text, Pressable, Alert } from 'react-native';
import { s } from '../styles';

export default function Login(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [loading,setLoading]=useState(false);
  async function onLogin(){
    try{
      setLoading(true);
      if(!email || !password) throw new Error('请输入邮箱和密码');
      Alert.alert('Logged in', `Welcome ${email}!`);
    }catch(e:any){ Alert.alert('Login failed', e.message ?? 'Unknown error'); }
    finally{ setLoading(false); }
  }
  return (<View style={s.center}>
    <TextInput style={s.input} placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail}/>
    <TextInput style={s.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword}/>
    <Pressable disabled={loading} style={s.btn} onPress={onLogin}>
      <Text style={s.btnText}>{loading?'Signing in…':'Log in'}</Text>
    </Pressable>
  </View>);
}
