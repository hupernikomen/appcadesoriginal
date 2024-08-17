import { Pressable } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign'

export default function Icone({onpress, nomeDoIcone, corDoIcone = '#fff', tamanhoDoIcone = 20}) {
 return (
        <Pressable onPress={onpress} style={{
           alignItems: 'center',
           width: 45,
           height: 55,
           alignItems: 'center',
           justifyContent: "center"
        }}>
           <AntDesign name={nomeDoIcone} color={corDoIcone} size={tamanhoDoIcone} />
        </Pressable> 
  );
}