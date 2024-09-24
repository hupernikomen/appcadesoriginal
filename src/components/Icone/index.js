import { Pressable, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'
import Texto from '../Texto';

export default function Icone({ estilo, height = 55, width = 50, label = '', disabled, onpress, nomeDoIcone, corDoIcone = '#000', tamanhoDoIcone = 22 }) {
   return (
      <Pressable disabled={disabled} onPress={onpress} style={[estilo, {
         alignItems: 'center',
         width: width,
         height: height,
         alignItems: 'center',
         justifyContent: "center",
         opacity: disabled ? .4 : 1,
      }]}>

         <Ionicons name={nomeDoIcone} color={corDoIcone} size={tamanhoDoIcone} />
         {!!label ? <Texto texto={label} tipo='Light' tamanho={8} estilo={{ marginTop: 4 }} cor={corDoIcone} /> : null}
      </Pressable>
   );
}