import { View, Pressable, StyleSheet, Alert } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Texto from '../../components/Texto';



export default function ItemDoPedido({ lista, listaInicial, setListaPedido, listaPedido }) {

  const { colors } = useTheme()
  const tipoC = listaInicial?.tipo?.substr(0, 1)


  const SomaItem = ({ produto, ordemDeCompraID }) => {


    if (lista.quantidade >= (produto.estoque - produto.reservado)) {
      Alerta(`Cor ${produto?.cor.nome} - Estoque Zerado`)
      return
    }
    

    const itemExistente = listaPedido.find((item) => item.produto === produto);

    if (itemExistente) {

      const novaQuantidade = itemExistente.quantidade + 1;

      setListaPedido((prevItens) =>
        prevItens.map((item) =>
          item.produto === produto ? { ...item, quantidade: novaQuantidade } : item
        )
      );

    } else {
      setListaPedido((prevItens) => [...prevItens, { produto, ordemDeCompraID, quantidade: 1 }]);

    }
  };



  const SubtraiUmItemDoPedido = ({ produto }) => {

    const itemExistente = listaPedido.find((item) => item.produto.id === produto.id);

    if (itemExistente) {

      const novaQuantidade = itemExistente.quantidade - 1;

      if (novaQuantidade > 0) {
        setListaPedido((prevItens) =>
          prevItens.map((item) =>
            item.produto.id === produto.id ? { ...item, quantidade: novaQuantidade } : item
          )
        );

      } else {
        setListaPedido((prevItens) => prevItens.filter((item) => item.produto.id !== produto.id));

      }
    }
  };



  function Alerta(mensagem) {
    Alert.alert('', mensagem, [
       {
          text: 'Ok',
          onPress: () => null,
       },
    ]) 
 }



  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: "center" }}>

        <View style={{ backgroundColor: colors.detalhe, marginRight: 10, borderRadius: 10, paddingHorizontal: 6 }}>
          <Texto tamanho={12} texto={`${lista.produto?.referencia} `} tipo='Light' cor='#fff' />
        </View>

        <Texto estilo={{ flex: 1, paddingHorizontal: 6 }} tipo={'Light'} texto={`${lista.produto?.nome} T. ${lista.produto?.tamanho} ${lista.produto?.cor?.nome} #${tipoC === 'A' ? lista.produto?.valorAtacado : lista.produto?.valorVarejo}`} />

        <View style={{ flexDirection: 'row', alignItems: "center" }}>

          <Pressable style={[styles.btnQtd, { opacity: listaInicial?.estado === "Entregue" || listaInicial?.estado === "Embalado" ? .4 : 1, elevation: listaInicial?.estado === "Entregue" || listaInicial?.estado === "Embalado" ? 1 : 3 }]}
            disabled={listaInicial?.estado === "Entregue" || listaInicial?.estado === "Embalado"}
            onPress={() => SubtraiUmItemDoPedido({ produto: lista.produto, quantidade: lista.quantidade, listaInicialID: listaInicial?.id })}>
            <Texto texto='-' />
          </Pressable>

          <Texto estilo={{ width: 26, textAlign: 'center' }} texto={lista.quantidade} />

          <Pressable style={[styles.btnQtd, { opacity: listaInicial?.estado === "Entregue" || listaInicial?.estado === "Embalado" ? .4 : 1, elevation: listaInicial?.estado === "Entregue" || listaInicial?.estado === "Embalado" ? 1 : 3 }]}
            disabled={lista.quantidade >= (lista.produto.estoque - lista.produto.saida) || listaInicial?.estado === "Entregue" || listaInicial?.estado === "Embalado"}
            onPress={() => SomaItem({ produto: lista.produto, ordemDeCompraID: listaInicial?.id })}>
            <Texto texto='+' />
          </Pressable>

        </View>
      </View>
    </View>
  )

}

const styles = StyleSheet.create({

  btnQtd: {

    borderRadius: 6,
    alignItems: "center",
    justifyContent: 'center',
    width: 25,
    height: 40,
    backgroundColor: '#fff'
  }
});
