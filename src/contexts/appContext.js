import { createContext, useState, useEffect, useContext } from "react";
import { ToastAndroid } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import { useNavigation, DrawerActions } from "@react-navigation/native";


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

  const autenticado = !!credencial.id

  useEffect(() => {
    ValidaCredential()
  }, [])


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


  function CodigoDeVerificacaoEAN13(ean12) {
    const weights = [1, 3];
    let sum = 0;
    let weightIndex = 0;

    for (let i = 0; i < 12; i++) {
      const digit = parseInt(ean12.charAt(i));
      sum += digit * weights[weightIndex];
      weightIndex = (weightIndex + 1) % 2;
    }

    const remainder = sum % 10;
    const checksum = remainder === 0 ? 0 : 10 - remainder;

    return checksum;
  }


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
      console.log(res.data);

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
      })
  }

  function TratarErro(error) {
    console.error(error);
    Toast(error.response.data.error);
    setLoad(false)
  }




  function FormatarTexto(texto) {
    const excessoes = ["com", "e", "de", "por", "a", "o", "do", "em", "é", "no", "na", "da", "dos", "das"]
  
    return texto?.split(' ').map(word => {
      const palavraMinuscula = word.toLowerCase();
      return excessoes.includes(palavraMinuscula) ? palavraMinuscula : palavraMinuscula.charAt(0).toUpperCase() + palavraMinuscula.slice(1);
    }).join(' ');
  }

  

  return (
    <AppContext.Provider value={{
      Toast,
      TratarErro,
      CodigoDeVerificacaoEAN13,
      FormatarTexto,
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