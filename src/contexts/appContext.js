import { createContext, useState, useEffect } from "react";
import { ToastAndroid } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import { useNavigation, DrawerActions } from "@react-navigation/native";

export const AppContext = createContext({})

export function AppProvider({ children }) {

  const navigation = useNavigation()
  const [scan, setScan] = useState({})
  const [clients, setClients] = useState([])

  const [credential, setCredential] = useState({
    id: '',
    nome: '',
    tipo: '',
    token: '',
  })


  useEffect(() => {
    Promise.all(ValidateCredential(), HandleClients())

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

  async function HandleClients() {
    try {
      const clients = await api.get('/clientes')
      setClients(clients.data)
    } catch (error) {
      console.log(error.response);
    }
  }


  // Busca do storage informações do usuario logado e armazena em uma state
  async function ValidateCredential() {
    const credential = await AsyncStorage.getItem('@logincades')
    let credentialstorage = await JSON.parse(credential || '{}')

    // Verifica informações armazenadas no AsyncStorage
    if (Object.keys(credentialstorage).length > 0) {
      api.defaults.headers.common['Authorization'] = `Bearer ${credentialstorage.token}`

      setCredential({
        id: credentialstorage.id,
        nome: credentialstorage.nome,
        tipo: credentialstorage.tipo,
        token: credentialstorage.token,
      })

    } else {
      AsyncStorage.removeItem('@logincades')
    }

  }

  async function signIn(nome, senha) {
    if (!nome && !senha) return
    if (!nome || !senha) {
      return
    }


    try {
      const response = await api.post('/login', { nome, senha })
      const { id, token } = response.data

      const data = { ...response.data }
      await AsyncStorage.setItem('@logincades', JSON.stringify(data))

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setCredential({
        id,
        token,
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
          nome: '',
          tipo: '',
          token: '',
        })
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] })
        Toast('Você saiu')
        navigation.dispatch(DrawerActions.closeDrawer());
      })
  }

  // Usar esse metodo para buscar produto pelo codigo
  async function BuscaProduto(code) {
    try {
      const referencia = code.slice(-5, -1); // Pega as 4 últimas letras
      const res = await api.get(`/produto/referencia?referencia=${referencia}`)

      setScan({
        referencia: referencia,
        produto: res.data
      })
      
      console.log(scan, "scan");


    } catch (error) {
      console.log(error.response);
    } 

  }





  return (
    <AppContext.Provider value={{
      Toast,
      credential,
      authenticate,
      signIn,
      signOut,
      BuscaProduto,
      clients,
      HandleClients
    }}>
      {children}
    </AppContext.Provider>
  )
}