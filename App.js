import 'react-native-gesture-handler';

import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { AppProvider } from './src/contexts/appContext';
import { CrudProvider } from './src/contexts/crudContext';

import Routes from './src/routes';

const Theme = {
  ...DefaultTheme,
  colors: {
    black: '#222',
    theme: '#222',
    detail: '#b32400',
    background: '#f3f3f3',
    text: '#fff',
  }
};

export default function App() {
  return (

    <NavigationContainer theme={Theme}>
      <AppProvider>
        <CrudProvider>
          <StatusBar
            backgroundColor={Theme.colors.theme}
            translucent={false}
            barStyle={'light-content'} />

          <Routes />

        </CrudProvider>
      </AppProvider>

    </NavigationContainer>
  )
}