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
    theme: '#f3f3f3',
    detail: '#cc2900',
    background: '#f3f3f3',
    text: '#000',
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
            barStyle={'dark-content'} />

          <Routes />

        </CrudProvider>
      </AppProvider>

    </NavigationContainer>
  )
}