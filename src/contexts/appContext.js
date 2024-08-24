import { createContext, useState, useEffect, useContext } from "react";
import { ToastAndroid } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import { useNavigation, DrawerActions } from "@react-navigation/native";

import { CrudContext } from "./crudContext";

export const AppContext = createContext({})

export function AppProvider({ children }) {

  const [load, setLoad] = useState(false)
  const navigation = useNavigation()

  const listaDeTamanhos = ["PP", "P", "M", "G", "GG", "G1", "G2", "G3", "G4", "G5", "2", "4", "6", "8", "10", "12", "14"];

  const [credencial, setCredencial] = useState({
    id: '',
    matricula: '',
    nome: '',
    cargo: '',
    token: '',
  })


  useEffect(() => {
    Promise.all(ValidaCredential())
  }, [])


  const autenticado = !!credencial.id


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
  async function ValidaCredential() {
    setLoad(true)
    const credencial = await AsyncStorage.getItem('@logincades')
    let credencialStorage = await JSON.parse(credencial || '{}')


    // Verifica informações armazenadas no AsyncStorage
    if (Object.keys(credencialStorage).length > 0) {
      api.defaults.headers.common['Authorization'] = `Bearer ${credencialStorage.token}`

      setCredencial({
        id: credencialStorage.id,
        matricula: credencialStorage.matricula,
        nome: credencialStorage.nome,
        cargo: credencialStorage.cargo,
        token: credencialStorage.token,
      })

    } else {
      AsyncStorage.removeItem('@logincades')
    }
    navigation.navigate("Home")
    setLoad(false)

  }


  async function signIn(nome, senha) {

    if (!nome || !senha) return

    try {
      const res = await api.post('/login', { nome: nome.trim(), senha: senha.trim() })

      const { id, token } = res.data
      const data = { ...res.data }

      await AsyncStorage.setItem('@logincades', JSON.stringify(data))

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setCredencial({ id, nome })

      await ValidaCredential()

    } catch (error) {
      console.log(error);
    }
  }

  async function signOut() {

    await AsyncStorage.removeItem('@logincades')
      .then(() => {
        setCredencial({
          id: '',
          matricula: '',
          nome: '',
          cargo: '',
          token: '',
        })

        navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
        navigation.dispatch(DrawerActions.closeDrawer());
        Toast('Você saiu')
      })
  }




  return (
    <AppContext.Provider value={{
      Toast,
      credencial,
      autenticado,
      signIn, signOut,
      load, setLoad,
      listaDeTamanhos
    }}>
      {children}
    </AppContext.Provider>
  )
}