import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Splash from '../screens/Splash';
import Login from '../screens/Login';

export type RootStackParamList = { Splash: undefined; Login: undefined; };
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen name="Splash" component={Splash} options={{ headerShown:false }}/>
        <Stack.Screen name="Login" component={Login} options={{ title:'Log in' }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
