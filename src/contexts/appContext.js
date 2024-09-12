import { createContext, useState } from "react";
import { ToastAndroid } from "react-native";
import { useNavigation } from "@react-navigation/native";

export const AppContext = createContext({})

export function AppProvider({ children }) {

  const [load, setLoad] = useState(false)
  const listaDeTamanhos = ["PP", "P", "M", "G", "GG", "G1", "G2", "G3", "G4", "G5", "2", "4", "6", "8", "10", "12", "14"];
  const navigation = useNavigation()

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



  function ChecarAcesso(cargo, pagina) {
    const accessRules = {
      Socio: ['Login', 'Home', 'HistoricoDeVendas', 'HomeDeVendas','ListaEstoque', 'ListaDeClientes', 'RegistraCliente', 'Relatorio'],
      Administrador: ['Login', 'Home', 'HistoricoDeVendas','ListaEstoque', 'ListaDeClientes', 'Relatorio'],
      Gerente: ['Login', 'Home', 'HistoricoDeVendas', 'HomeDeVendas','ListaEstoque', 'ListaDeClientes', 'RegistraCliente'],
      Vendedor: ['Login', 'Home', 'HistoricoDeVendas', 'HomeDeVendas'],
      Funcionario: ['Login', 'Home'],
    };
  
    if (pagina === 'Login') { 
      navigation.navigate(pagina)

    } else if (accessRules[cargo]) {

      if (accessRules[cargo].includes(pagina)) {
        navigation.navigate(pagina)

      } else {
        Toast('Acesso Negado')
      }

    } else {
      Toast('Cargo desconhecido')
    }
  }


  return (
    <AppContext.Provider value={{
      Toast,
      TratarErro,
      CodigoDeVerificacaoEAN13,
      FormatarTexto,
      load, setLoad,
      listaDeTamanhos,
      ChecarAcesso
    }}>
      {children}
    </AppContext.Provider>
  )
}