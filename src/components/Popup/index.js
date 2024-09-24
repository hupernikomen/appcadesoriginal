import { View, Alert, Pressable, LogBox } from 'react-native';
import Texto from '../Texto';
import Icone from '../Icone';
import { useTheme } from '@react-navigation/native';


export default function PopUp({ estilo, buttonName, titleWindow = '', message, objAction }) {

  const { colors } = useTheme()

  function Alerta() {
    Alert.alert(titleWindow, message, objAction
      // [
      //  {
      //    text: 'Cancelar',
      //    onPress: () => null, ou  onPress: () => CancelarCompra(orcamento?.id) }
      //    style: 'cancel',
      //  }
      // ],
    );
  }

  Alert.alert('', `Deseja excluir pedido: ${tipoC}-${orcamento?.id?.slice(0, 6).toUpperCase()} ?`, [
    { text: 'Excluir', onPress: () => CancelarCompra(orcamento?.id) },
    {
       text: 'Cancelar',
       onPress: () => null,
       style: 'cancel',
    },
 ]);

  return (
    <Pressable style={estilo} onPress={() => Alerta()}>
      {buttonName ? <Texto texto={buttonName} /> :
        <Icone height={24} width={24} onpress={() => Alerta()} nomeDoIcone={'information-circle-outline'} corDoIcone={colors.efeito} tamanhoDoIcone={18} />}
    </Pressable>
  )

}