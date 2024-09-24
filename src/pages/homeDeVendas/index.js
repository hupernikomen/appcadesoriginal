import { useContext, useEffect, useState } from 'react';
import { View, Pressable, Keyboard,  FlatList } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';

import { CrudContext } from '../../contexts/crudContext';
import { CredencialContext } from '../../contexts/credencialContext';

import api from '../../services/api';
import MaskOfInput from '../../components/MaskOfInput';
import Texto from '../../components/Texto';
import Tela from '../../components/Tela';
import Topo from '../../components/Topo';
import Icone from '../../components/Icone';
import Interruptor from '../../components/Interruptor';
import Load from '../../components/Load';

export default function Sale() {


	const { clientes, ordemDeCompra } = useContext(CrudContext)
	const { credencial } = useContext(CredencialContext)
	const navigation = useNavigation()

	const [load, setLoad] = useState(false)
	const [interruptor, setInterruptor] = useState(false);

	const [busca, setBusca] = useState('');
	const [clientesFiltrados, setClientesFiltrados] = useState([])

	const CPF_MASK = [/\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/];
	const CNPJ_MASK = [/\d/, /\d/, ".", /\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/, "-", /\d/, /\d/]

	const texto = busca.trim();
	const textoSemCaracteres = texto.replace(/[./-]/g, "");
	const ehNumerico = /^\d+$/.test(textoSemCaracteres);

	const [mask, setMask] = useState(null)


	async function BuscaCliente(cpf_cnpj) {

		setLoad(true)

		try {
			const response = await api.get(`/busca/cliente?cpf_cnpj=${cpf_cnpj}`)
			if (response.data?.cpf_cnpj === "000.000.000-00") {
				CriaOrdemDeCompra(response.data)
			}

			!!response.data && Keyboard.dismiss()

		} catch (error) {
			console.log(error.response?.data?.error);

		} finally {
			setLoad(false)
		}
	}


	async function CriaOrdemDeCompra(data) {

		setLoad(true)

		const headers = {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${credencial?.token}`
		}

		try {
			const response = await api.post(`/cria/ordemDeCompra`, { clienteID: data?.id, usuarioID: credencial.id, tipo: interruptor ? 'Varejo' : 'Atacado' }, { headers })
			navigation.navigate('CriaOrcamento', { ordemDeCompraID: response.data.id })
			setLoad(false)

		} catch (error) {
			console.log(error.response);

		}
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
			setClientesFiltrados([]);
		}

		if (ehNumerico && busca.length <= 14) {
			setMask(CPF_MASK)

		} else if (ehNumerico && busca.length > 14) {
			setMask(CNPJ_MASK)

		} else {
			setMask(null)

		}
	}, [busca]);


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
			<Pressable onPress={() => CriaOrdemDeCompra(data)} style={{ justifyContent: "center", padding: 16 }}>
				<Texto texto={data.nome} />
				<Texto tipo='Light' texto={segundaLinha} />

			</Pressable>
		)
	}

if (load) return <Load/>

	return (
		<>
			<Topo
				iconeLeft={{ nome: 'chevron-back', acao: () => navigation.goBack() }}
				titulo='Ordem de Compra' />

			<Tela>

			<Interruptor interruptor={interruptor} setInterruptor={setInterruptor} label1="Atacado" label2="Varejo" />


				<FlatList
					showsVerticalScrollIndicator={false}
					ItemSeparatorComponent={<View style={{ borderColor: '#d9d9d9', borderBottomWidth: .5 }} />}
					data={clientesFiltrados}
					renderItem={({ item }) => <Cliente data={item} />}
					ListHeaderComponent={
						<View style={{ flexDirection: "row", alignItems: 'center', gap: 2, marginBottom: 20 }}>
							<MaskOfInput mask={mask} setValue={setBusca} value={busca} style={{ flex: 1, fontSize: 22 }} title={'Buscar Cliente'} />

							{interruptor && !clientesFiltrados.length ? <Pressable onPress={() => BuscaCliente("000.000.000-00")} style={{ borderRadius: 12, gap: 6, backgroundColor: '#e9e9e999', height: 50, justifyContent: 'flex-start', alignItems: "center", paddingHorizontal: 18, flexDirection: "row" }}>
								<Icone label='S/ CAD.' tamanhoDoIcone={16} corDoIcone='#000' nomeDoIcone='lock-open-outline' onpress={() => BuscaCliente("000.000.000-00")} />
							</Pressable> : null}

							{!!busca && !clientesFiltrados.length ? <Pressable onPress={() => navigation.navigate('RegistraCliente')} style={{ borderRadius: 12, gap: 6, backgroundColor: '#e9e9e9', height: 60, justifyContent: 'flex-start', alignItems: "center", paddingHorizontal: 18, flexDirection: "row" }}>
								<Icone label='NOVO' tamanhoDoIcone={20} corDoIcone='#000' nomeDoIcone='person-add-outline' onpress={() => navigation.navigate('RegistraCliente')} />
							</Pressable> : null}

						</View>
					}
				/>
			</Tela>
		</>
	)
}

