import 'react-native-gesture-handler';
import codePush from 'react-native-code-push';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'react-native';

import { AppProvider } from './src/contexts/appContext';
import { CrudProvider } from './src/contexts/crudContext';
import { CredencialProvider } from './src/contexts/credencialContext';

import Routes from './src/routes';

const Theme = {
  ...DefaultTheme,
  colors: {
    padrao: '#000',
    theme: '#f3f3f3',
    detalhe: '#ff7366',
    efeito: '#ff9900',
    background: '#f3f3f3',
    fundo: '#FAFAFA',
  }
};

function App() {
  return (

    <NavigationContainer theme={Theme}>
      
      <CredencialProvider>
        <AppProvider>
          <CrudProvider>

            <StatusBar
              backgroundColor={Theme.colors.background}
              translucent={false}
              barStyle={'dark-content'} />

            <Routes />

          </CrudProvider>
        </AppProvider>
      </CredencialProvider>

    </NavigationContainer>
  )
}

export default codePush(App)