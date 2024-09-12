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
        // ContagemDeCompras()

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
            if (order?.estado === 'Entregue' && order?.cliente.id === cliente?.id) {
                count++;
                totalValor += order?.totalDaNota;
                totalPago += order?.valorPago;
            }
        });

        return { count, totalValor, totalPago };
    }



    if (load) return <Load />

    const buttonsInfo = [
        { icone: 'logo-whatsapp', nome: 'Whatsapp', rota: () => Linking.openURL(`whatsapp://send?phone=55${cliente.whatsapp}`) },
        { icone: 'pencil', nome: 'Editar', rota: () => navigation.navigate('RegistraCliente', cliente) },
    ]

    return (
        <>
            <Topo
                posicao='left'
                iconeLeft={{ nome: 'arrow-back-outline', acao: () => navigation.goBack() }}
                iconeRight={{ nome: 'information', acao: () => navigation.navigate('Info', { 
                    info: 'Os cálculos de compras do cliente (caso existam), consideram apenas pedidos Entregues e não incluem pagamentos em andamento.' }) }}
                titulo={''} />

            <Tela>
                <View style={{ alignItems: "center", justifyContent: "center", marginTop: 20, padding: 14, gap: 12 }}>
                    <View style={{ alignItems: "center" }}>

                        <Texto alinhamento='center' tipo='Bold' tamanho={22} texto={cliente?.nomeFantasia ? FormatarTexto(cliente?.nomeFantasia) : FormatarTexto(cliente?.nome)} estilo={{ marginBottom: 12 }} />
                        {cliente.nomeFantasia ? <Texto alinhamento='center' tipo='Light' tamanho={16} texto={FormatarTexto(cliente?.nome)} /> : null}
                        <Texto tipo='Light' texto={cliente?.cpf_cnpj?.length > 14 ? `CNPJ: ${cliente?.cpf_cnpj}` : `CPF: ${cliente?.cpf_cnpj}`} />
                        <Texto tipo='Light' texto={`Data Nascimento: ${cliente?.dataNascimento}`} />
                    </View>

                    {ContagemDeCompras().count === 0 ? null : <View style={{ marginVertical: 12, alignItems: 'center' }}>

                        <Pressable onPress={() => navigation.navigate('HistoricoDeVendas', { clienteID: cliente.id })}>
                            <Texto tipo='Light' texto={`${ContagemDeCompras().count} compra${ContagemDeCompras().count > 1 ? 's' : ''}, totalizando R$ ${parseFloat(ContagemDeCompras().totalPago).toFixed(2)}`} />
                            <Texto texto={'Ver Detalhes'} alinhamento='center' />
                        </Pressable>

                    </View>}
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