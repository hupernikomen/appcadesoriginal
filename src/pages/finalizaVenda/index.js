import { View, Text, Pressable, ActivityIndicator, Keyboard, BackHandler, Alert } from 'react-native';

import { useRoute, useTheme, useNavigation } from '@react-navigation/native';
import { useEffect, useState, useContext, useLayoutEffect } from 'react';

import { CredencialContext } from '../../contexts/credencialContext';

import api from '../../services/api';

import { createNumberMask } from 'react-native-mask-input';
import MaskOfInput from '../../components/MaskOfInput';
import Tela from '../../components/Tela';
import Topo from '../../components/Topo';
import Pick from '../../components/Picker';
import { CrudContext } from '../../contexts/crudContext';

export default function FinalizaVenda() {

	const { CancelarCompra } = useContext(CrudContext)
	const { credencial } = useContext(CredencialContext)

	const CurrencyMask = createNumberMask({
		delimiter: '.',
		separator: ',',
		precision: 2,
	});

	const { colors } = useTheme()

	const navigation = useNavigation()
	const { params: rota } = useRoute()

	const [load, setLoad] = useState(false)

	const [parcelas, setParcelas] = useState('')
	const [valorAdiantado, setValorAdiantado] = useState('')
	const [observacao, setObservacao] = useState('')
	const [desconto, setDesconto] = useState('')
	const [listaTipo, setListaTipo] = useState([
		{ id: 0, nome: 'Pix' },
		{ id: 1, nome: 'Cartão de Crédito' },
		{ id: 2, nome: 'Cartão de Débito' },
		{ id: 3, nome: 'Boleto Bancário' },
	])
	const [tipoSelecionado, setTipoSelecionado] = useState('')

	const maxTimes = 3

	useEffect(() => {

		BuscaPagamento()

		const backHandler = BackHandler.addEventListener(
			'hardwareBackPress',
			backAction,
		);

		return () => backHandler.remove();

	}, [])






	const backAction = () => {

	
			Alert.alert('', 'Não será possivel voltar à tela anterior. Cancele o pedido ou continue para finalizar venda', [
				{
					text: 'Cancelar Pedido', onPress: () => {
						CancelarCompra(rota?.ordemDeCompraID)
						navigation.navigate('Home')
					}
				},
				{
					text: 'Continuar',
					onPress: () => null,
				},
			]) 
		return true;
	};




	async function BuscaPagamento() {
		try {
			const response = await api.get(`/busca/pagamento?ordemDeCompraID=${rota?.ordemDeCompraID}`)
			const pagamento = response.data

			const { tipo, valorAdiantado, desconto, parcelas, obs } = pagamento

			const objTipo = listaTipo.find((item) => item.nome === tipo)
			setTipoSelecionado(objTipo)

			if (!!valorAdiantado) {
				setValorAdiantado(String(valorAdiantado))
			}

			if (!!desconto) {
				setDesconto(String(desconto))
			}

			if (!!parcelas) {
				setParcelas(String(parcelas))
			}

			if (!!obs) {
				setObservacao(obs)
			}

		} catch (error) {
			console.log(error.response);

		}
	}



	async function CriaPagamento() {

		if (!tipoSelecionado) return

		const headers = {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${credencial?.token}`
		}


		try {
			await api.post(`/cria/pagamento?ordemDeCompraID=${rota?.ordemDeCompraID}`, {
				parcelas: Number(parcelas),
				desconto: Number(desconto) || null,
				totalDaNota: Number(rota?.total),
				valorAdiantado: Number(valorAdiantado.replace(',', '.')) || null,
				totalPago: (Number(rota?.total) - valorAdiantado) * (1 - desconto / 100),
				obs: observacao,
				tipo: tipoSelecionado.nome,
				ordemDeCompraID: rota?.ordemDeCompraID
			}, { headers })
			await api.put(`/atualiza/ordemDeCompra?ordemDeCompraID=${rota?.ordemDeCompraID}`, { estado: 'Processando' }, { headers })

		} catch (error) {
			if (error.response.data.error === "Pagamento ja registrado") {

				try {
					await api.put(`/atualiza/pagamento?ordemDeCompraID=${rota?.ordemDeCompraID}`, {
						parcelas: Number(parcelas),
						desconto: Number(desconto) || null,
						totalDaNota: Number(rota?.total),
						valorAdiantado: Number(valorAdiantado.replace(',', '.')) || null,
						totalPago: (Number(rota?.total) - valorAdiantado) * (1 - desconto / 100),
						obs: observacao,
						tipo: tipoSelecionado.nome,
					}, { headers })



					await api.put(`/atualiza/ordemDeCompra?ordemDeCompraID=${rota?.ordemDeCompraID}`, { estado: rota.estado }, { headers })

				} catch (error) {
					console.log(error.response);
				}


			} else {
				console.log(error.response);
			}

		} finally {
			navigation.navigate('Home')

		}
	}

	function Limpa() {
		setParcelas('')
		setValorAdiantado('')
		setDesconto('')
		
	}



	return (
		<>
			<Topo
				iconeLeft={{ nome: 'chevron-back', acao: () => backAction() }}
				titulo='Condições de Pagamento' />

			<Tela>

				

				<View style={{ padding: 16 }}>
					<Text style={{ fontFamily: 'Roboto-Light', color: "#222" }}>Compra no valor de R$ {parseFloat(rota.total).toFixed(2).replace('.', ',')} </Text>
				</View>

				<Pick editable={rota.estado !== 'Entregue'} data={listaTipo} itemTopo={''} Limpa={Limpa} valorItemTopo={null} title={'Tipo de pagamento'} selectedValue={tipoSelecionado} setValue={setTipoSelecionado} value />

				{tipoSelecionado.nome !== 'Pix' && tipoSelecionado.nome !== 'Cartão de Débito' ? null : <MaskOfInput
				editable={rota.estado !== 'Entregue'} 
					type='numeric'
					title='Desconto (%)'
					value={desconto}
					setValue={setDesconto}
					info={'À pagar R$ ' + ((parseFloat(rota.total) - Number(valorAdiantado.replace(',', '.'))) * (1 - desconto / 100)).toFixed(2).replace('.', ',')}
					maxlength={2} />}

				{tipoSelecionado.nome !== 'Cartão de Crédito' && tipoSelecionado.nome !== 'Boleto Bancário' ? null : <View>
					<MaskOfInput editable={rota.estado !== 'Entregue'}  type='numeric' title={'Adiantamento (R$)'} value={valorAdiantado} setValue={setValorAdiantado} mask={CurrencyMask} />
					<MaskOfInput editable={rota.estado !== 'Entregue'}  type='numeric' title='Nº de prestações' value={parcelas} setValue={setParcelas} info={parcelas ? parcelas + "x R$ " + (parseFloat((parseFloat(rota.total) - Number(valorAdiantado.replace(',', '.'))) * (1 - desconto / 100) / parcelas)).toFixed(2).replace('.', ',') : null} />
				</View>}

				<MaskOfInput editable={rota.estado !== 'Entregue'}  lines={5} multiline={true} styleMask={{ height: 60 }} style={{ height: 100 }} title='Observações' value={observacao} setValue={setObservacao} />

				<Pressable
					style={{
						backgroundColor: colors.detalhe, height: 50,
						borderRadius: 6,
						marginVertical: 12,
						padding: 14,
						justifyContent: "center",
						alignItems: "center",
						marginTop: 12
					}}
					onPress={() => CriaPagamento()}
				>
					{load ?
						<ActivityIndicator color={'#fff'} /> :
						<Text style={{ color: '#fff', fontSize: 16 }}>Enviar Pedido</Text>
					}

				</Pressable>
			</Tela>
		</>
	);
}