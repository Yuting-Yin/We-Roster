import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/contexts/AuthContext';

export default function App() { 
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
