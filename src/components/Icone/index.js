import { Pressable, Text } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign'
import Texto from '../Texto';

export default function Icone({ label = '', disable, onpress, nomeDoIcone, corDoIcone = '#fff', tamanhoDoIcone = 22 }) {
   return (
      <Pressable disabled={disable} onPress={onpress} style={{
         alignItems: 'center',
         width: 55,
         height: 55,
         alignItems: 'center',
         justifyContent: "center"
      }}>
         <AntDesign name={nomeDoIcone} color={corDoIcone} size={tamanhoDoIcone} />
         <Texto texto={label} tipo='Light' tamanho={9} estilo={{ marginTop: 4 }} cor={corDoIcone}/>
      </Pressable>
   );
}