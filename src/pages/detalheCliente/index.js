import { View, Linking, Pressable, FlatList } from 'react-native';
import { useRoute, useNavigation, useTheme } from '@react-navigation/native';
import { useEffect, useState, useContext } from 'react';
import Topo from '../../components/Topo';
import api from '../../services/api';
import Texto from '../../components/Texto';
import Tela from '../../components/Tela';
import Load from '../../components/Load';
import Icone from '../../components/Icone';

import { CrudContext } from '../../contexts/crudContext';
import { AppContext } from '../../contexts/appContext';

export default function DetalheCliente() {

    const { colors } = useTheme()

    const { FormatarTexto } = useContext(AppContext)
    const { ordemDeCompra } = useContext(CrudContext)

    const navigation = useNavigation()
    const { params: rota } = useRoute()
    const [cliente, setCliente] = useState({})
    const [load, setLoad] = useState(false)

    useEffect(() => {
        BuscaCliente()
        ContagemDeCompras()

    }, [rota])



    async function BuscaCliente() {
        setLoad(true)
        try {
            const response = await api.get(`/busca/cliente?cpf_cnpj=${rota.cpf_cnpj}`)
            const cliente = response.data

            setCliente(cliente)

        } catch (error) {
            console.log(error.response);

        } finally {
            setLoad(false)
        }
    }

    function ContagemDeCompras() {
        let count = 0;
        let totalValor = 0;
        let totalPago = 0;

        ordemDeCompra.forEach(order => {
            if (order.estado === 'Entregue' && order.cliente.id === cliente.id) {
                count++;
                totalValor += order.totalDaNota;
                totalPago += order.valorPago;
            }
        });

        return { count, totalValor, totalPago };
    }



    if (load) return <Load />

    const buttonsInfo = [
        { icone: 'logo-whatsapp', nome: 'Whatsapp', rota: () => Linking.openURL(`whatsapp://send?phone=55${cliente.whatsapp}`) },
        { icone: 'pencil', nome: 'Editar', rota: () => navigation.navigate('RegistraCliente', cliente) },
        { icone: 'reader-outline', nome: 'Compras', rota: () => navigation.navigate('HistoricoDeVendas', { clienteID: cliente.id }) },
    ]

    return (
        <>
            <Topo
                posicao='left'
                iconeLeft={{ nome: 'arrow-back-outline', acao: () => navigation.goBack() }}
                titulo={''} />

            <Tela>
                <View style={{ alignItems: "center", justifyContent: "center", marginTop: 20, padding: 14 }}>
                    <Texto alinhamento='center' tipo='Bold' tamanho={22} texto={FormatarTexto(cliente?.nome)} />
                    <Texto tipo='Light' texto={`Nasc. ${cliente?.dataNascimento}`} />
                    <Texto tipo='Light' texto={`${cliente?.cpf_cnpj}`} />

                    <View style={{ marginVertical: 12, alignItems: 'center' }}>

                        <Texto tipo='Light' texto={`Cliente com ${ContagemDeCompras().count} compra${ContagemDeCompras().count > 1 ? 's' : ''} realizada${ContagemDeCompras().count > 1 ? 's' : ''}`} />
                        <Texto tipo='Light' texto={`Total em notas R$ ${parseFloat(ContagemDeCompras().totalValor).toFixed(2)}`} />
                        <Texto tipo='Light' texto={`Total pago R$ ${parseFloat(ContagemDeCompras().totalPago).toFixed(2)}`} />
                    </View>
                    <View style={{ marginVertical: 12, alignItems: 'center' }}>

                        <Texto alinhamento='center' cor='#aaa' tipo='Light' tamanho={13} texto={`Obs. Os cálculos são feitos com base nas ordens de compras 'Entregues', porém não identifica pagamentos em andamento`} />
                    </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: "center", justifyContent: 'center', gap: 6, marginTop: 30 }}>


                    <FlatList
                        numColumns={2}
                        columnWrapperStyle={{ gap: 6, marginVertical: 3 }}
                        contentContainerStyle={{ alignSelf: 'center' }}
                        data={buttonsInfo}
                        renderItem={({ item }) => {
                            return (
                                <Pressable style={{ borderRadius: 12, backgroundColor: colors.detalhe, padding: 12, alignItems: 'center', justifyContent: 'center', width: 100 }} onPress={item.rota} >
                                    <Icone onpress={item.rota} nomeDoIcone={item.icone} corDoIcone='#fff' tamanhoDoIcone={26} />
                                    <Texto texto={item.nome} cor='#fff' />
                                </Pressable>

                            )
                        }}
                    />


                </View>
            </Tela>
        </>
    );
}