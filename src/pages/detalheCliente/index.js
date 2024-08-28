import { View, Linking, Pressable, Text } from 'react-native';
import { useRoute, useNavigation, useTheme } from '@react-navigation/native';
import { useEffect, useState, useContext } from 'react';
import Topo from '../../components/Topo';
import api from '../../services/api';
import Texto from '../../components/Texto';
import Tela from '../../components/Tela';
import Load from '../../components/Load';

import { CrudContext } from '../../contexts/crudContext';
import Icone from '../../components/Icone';

export default function DetalheCliente() {

    const {colors} = useTheme()
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
            const res = await api.get(`/busca/cliente?cpf_cnpj=${rota.cpf_cnpj}`)
            setCliente(res.data)
            console.log(res.data);


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

    return (
        <>
            <Topo
                posicao='left'
                iconeLeft={{ nome: 'arrow-back-outline', acao: () => navigation.goBack() }}
                // iconeRight={{nome :'pencil', acao: () => navigation.navigate('RegistraCliente', dadosCliente)}}
                titulo={''} />

            <Tela>
                <View style={{ alignItems: "center", justifyContent: "center", marginTop: 20, padding: 14 }}>
                    <Texto alinhamento='center' tipo='Bold' tamanho={22} texto={cliente?.nome} />
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

                <View style={{flexDirection:'row', alignItems:"center", justifyContent:'center', gap:6, marginTop:30}}>

                    <Pressable  style={{borderRadius:12, backgroundColor:colors.detalhe , padding:12, alignItems: 'center', justifyContent: 'center', width:100 }} onPress={() => Linking.openURL(`whatsapp://send?phone=55${cliente.whatsapp}`)} >
                        <Icone onpress={() => Linking.openURL(`whatsapp://send?phone=55${cliente.whatsapp}`)} nomeDoIcone='logo-whatsapp' corDoIcone='#fff' tamanhoDoIcone={26} />
                        <Texto texto={'Whatsapp'} cor='#fff' />
                    </Pressable>

                    <Pressable style={{ borderRadius:12, backgroundColor:colors.detalhe, padding:12,alignItems: 'center', justifyContent: 'center', width:100 }} onPress={() => navigation.navigate('RegistraCliente', cliente)}>
                        <Icone onpress={() => navigation.navigate('RegistraCliente', cliente)} nomeDoIcone='pencil'  corDoIcone='#fff' tamanhoDoIcone={26}/>
                        <Texto texto={'Editar'} cor='#fff'/>
                    </Pressable>
                </View>
            </Tela>

        </>
    );
}