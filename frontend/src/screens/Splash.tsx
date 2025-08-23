import { useEffect } from 'react';
import { View, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { s } from '../styles';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList,'Splash'>;
export default function Splash({ navigation }: Props){
  useEffect(()=>{ const t=setTimeout(()=>navigation.replace('Login'),900); return ()=>clearTimeout(t);},[navigation]);
  return (<View style={s.center}>
    <Image style={s.logo} source={{uri:'https://dummyimage.com/320x320/0ea5e9/ffffff&text=W'}}/>
  </View>);
}
