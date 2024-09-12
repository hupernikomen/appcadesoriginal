import { View } from 'react-native';
import Texto from '../../components/Texto';
import { useNavigation, useRoute } from '@react-navigation/native';
import Topo from '../../components/Topo';
import Tela from '../../components/Tela';


export default function Info() {

  const navigation = useNavigation()

  const { params: rota } = useRoute()

  return (
    <>
      <Topo
        posicao='left'
        iconeLeft={{ nome: 'arrow-back-outline', acao: () => navigation.goBack() }}
        titulo={''} />

      <View style={{ padding: 14, alignItems: "center" }}>

        <Texto texto={'Informativo'} estilo={{ marginBottom: 12 }} tamanho={20} tipo='Medium' />
        <Texto tipo='Light' texto={rota.info} />
      </View>
    </>
  );
}