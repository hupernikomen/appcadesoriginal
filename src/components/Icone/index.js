import { Pressable, Text } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Texto from '../Texto';

export default function Icone({ label = '', disabled, onpress, nomeDoIcone, corDoIcone = '#fff', tamanhoDoIcone = 20 }) {
   return (
      <Pressable disabled={disabled} onPress={onpress} style={{
         alignItems: 'center',
         width: 50,
         height: 55,
         alignItems: 'center',
         justifyContent: "center",
         opacity: disabled ? .3 : 1
      }}>

         <Ionicons name={nomeDoIcone} color={corDoIcone} size={tamanhoDoIcone} />
         {!!label ? <Texto texto={label} tipo='Light' tamanho={8} estilo={{ marginTop: 4 }} cor={corDoIcone} /> : null}
      </Pressable>
   );
}