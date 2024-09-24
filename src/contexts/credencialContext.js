import { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import { useNavigation, DrawerActions } from "@react-navigation/native";



export const CredencialContext = createContext({})

export function CredencialProvider({ children }) {

  const navigation = useNavigation()


  const [credencial, setCredencial] = useState({
    id: '',
    matricula: '',
    nome: '',
    cargo: '',
    token: '',
  })

  const autenticado = !!credencial.id

  useEffect(() => {
    ValidaCredential()
  }, [])



  // Busca do storage informações do usuario logado e armazena em uma state
  async function ValidaCredential() {
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
      console.log(error.response);
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
      })
  }



  return (
    <CredencialContext.Provider value={{
      credencial,
      autenticado,
      signIn, 
      signOut,
    }}>
      {children}
    </CredencialContext.Provider>
  )
}