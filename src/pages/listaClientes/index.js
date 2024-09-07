import { Pressable, View, Text, FlatList, Linking, LogBox } from 'react-native';

import { useNavigation, CommonActions } from '@react-navigation/native';
import { useContext, useState, useEffect } from 'react';

import { CrudContext } from '../../contexts/crudContext';
import { AppContext } from '../../contexts/appContext';

import Texto from '../../components/Texto';
import Tela from '../../components/Tela';
import Topo from '../../components/Topo';
import MaskOfInput from '../../components/MaskOfInput';

export default function ListaDeClientes() {

  const { clientes, ordemDeCompra, ListaClientes } = useContext(CrudContext)
  const { FormatarTexto } = useContext(AppContext)

  const navigation = useNavigation()
  const [busca, setBusca] = useState('');
  const [clientesFiltrados, setClientesFiltrados] = useState(clientes);

  const CPF_MASK = [/\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/];
  const CNPJ_MASK = [/\d/, /\d/, ".", /\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/, "-", /\d/, /\d/]

  const texto = busca.trim();
  const textoSemCaracteres = texto.replace(/[./-]/g, "");
  const ehNumerico = /^\d+$/.test(textoSemCaracteres);

  const [mask, setMask] = useState(null)


  const converteData = (date) => {
    const data = new Date(date);
    const formatoData = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
    return formatoData.format(data);
  }


  const Cliente = ({ data }) => {

    let segundaLinha = ''

    if (!!data.nomeFantasia) {
      segundaLinha = data.nomeFantasia

    } else if (!!ContagemDeCompras(data.id).ultimaDataDaCompra) {
      segundaLinha = `Última compra em ${converteData(ContagemDeCompras(data.id).ultimaDataDaCompra)}`

    } else {
      segundaLinha = data.cpf_cnpj
    }


    return (
      <Pressable onPress={() => navigation.navigate('DetalheCliente', { cpf_cnpj: data.cpf_cnpj })} style={{ justifyContent: "center", paddingHorizontal: 16 }}>
        <Texto texto={FormatarTexto(data.nome)} />
        <Texto tipo='Light' texto={segundaLinha} />

      </Pressable>
    )
  }

  function ContagemDeCompras(clientId) {
    let count = 0;
    let ultimaDataDaCompra = null;

    ordemDeCompra.forEach(order => {
      if (order.estado === 'Entregue' && order.cliente.id === clientId) {
        count++;
        if (!ultimaDataDaCompra || new Date(order.criadoEm) > new Date(ultimaDataDaCompra)) {
          ultimaDataDaCompra = order.criadoEm;
        }
      }
    });


    return { count, ultimaDataDaCompra };
  }


  useEffect(() => {

    if (busca.trim() !== '') {
      const textoLowercase = busca.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const filteredClientes = clientes.filter((item) => {
        return (
          item.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(textoLowercase) ||
          item.cpf_cnpj?.includes(textoLowercase) ||
          item.nomeFantasia?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(textoLowercase)
        );
      });
      setClientesFiltrados(filteredClientes);
    } else {
      setClientesFiltrados(clientes);
    }


    if (ehNumerico && busca.length <= 14) {
      setMask(CPF_MASK)
    } else if (ehNumerico && busca.length > 14) {
      setMask(CNPJ_MASK)
    } else {
      setMask(null)
    }

    ListaClientes()
  }, [busca]);


  return (
    <>
      <Topo
        posicao='left'
        iconeLeft={{ nome: 'arrow-back-outline', acao: () => navigation.navigate('Home') }}
        iconeRight={{ nome: 'add-sharp', acao: () => navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [
              { name: 'Home' }, { name: 'RegistraCliente' },
            ],
          })
        ) }}
        titulo='Clientes' />

      <Tela>
        <FlatList
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={<View style={{ marginVertical: 20, borderColor: '#d9d9d9', borderBottomWidth: .5 }} />}
          contentContainerStyle={{ paddingVertical: 20 }}
          data={clientesFiltrados}
          renderItem={({ item }) => <Cliente data={item} />}
          ListHeaderComponent={
            <MaskOfInput mask={mask} setValue={setBusca} value={busca} style={{ flex: 1, fontSize: 22, marginBottom: 20 }} title={'Buscar Cliente'} />
          }
        />
      </Tela>
    </>
  );
}