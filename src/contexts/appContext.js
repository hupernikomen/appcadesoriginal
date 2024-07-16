import { createContext, useState, useEffect } from "react";
import { ToastAndroid } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import { useNavigation, DrawerActions } from "@react-navigation/native";

export const AppContext = createContext({})

export function AppProvider({ children }) {

  const navigation = useNavigation()

  const [credential, setCredential] = useState({
    id: '',
    name: '',
    type: '',
    token: '',
  })


  useEffect(() => {
    Promise.all(ValidateCredential())

  }, [])


  const authenticate = !!credential.id


  // Exibe mensagens de retorno de execução de comandos
  const Toast = message => {
    ToastAndroid.showWithGravityAndOffset(
      message,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
      25,
      30,
    );
  };


  // Busca do storage informações do usuario logado e armazena em uma state
  async function ValidateCredential() {
    const credential = await AsyncStorage.getItem('@logincades')
    let credentialstorage = await JSON.parse(credential || '{}')

    // Verifica informações armazenadas no AsyncStorage
    if (Object.keys(credentialstorage).length > 0) {
      api.defaults.headers.common['Authorization'] = `Bearer ${credentialstorage.token}`

      setCredential({
        id: credentialstorage.id,
        name: credentialstorage.name,
        type: credentialstorage.type,
        token: credentialstorage.token,
      })

    } else {
      AsyncStorage.removeItem('@logincades')
    }

  }

  async function signIn(name, password) {
    if (!name && !password) return
    if (!name || !password) {
      return
    }


    try {
      const response = await api.post('/login', { name, password })
      const { id, token } = response.data

      const data = { ...response.data }
      await AsyncStorage.setItem('@logincades', JSON.stringify(data))

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setCredential({
        id,
        name,
      })

      ValidateCredential()

      navigation.navigate("Home")

    } catch (error) {
      console.log(error);

    }

  }

  async function signOut() {

    await AsyncStorage.removeItem('@logincades')
      .then(() => {
        setCredential({
          id: '',
          name: '',
          type: '',
          token: '',
        })
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] })
        Toast('Você saiu')
        navigation.dispatch(DrawerActions.closeDrawer());
      })
  }



  return (
    <AppContext.Provider value={{
      Toast,
      credential,
      authenticate,
      signIn,
      signOut,
    }}>
      {children}
    </AppContext.Provider>
  )
}