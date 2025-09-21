import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Splash from '@/screens/Splash';
import Login from '@/screens/Login';
import AppTabs from '@/navigation/AppTabs';

export type RootStackParamList = { 
  Splash: undefined; 
  Login: undefined; 
 AppTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown:false }}>
        <Stack.Screen name="Splash" component={Splash}/>
        <Stack.Screen name="Login" component={Login}/>
        <Stack.Screen name="AppTabs" component={AppTabs}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
