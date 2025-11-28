import { StatusBar } from 'expo-status-bar';
import AppNavigation from './src/navigation/navigation';

export default function App() {
  return (
    <>
      <AppNavigation />
      <StatusBar style="light" />
    </>
  );
}
