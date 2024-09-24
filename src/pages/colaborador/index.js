import { View } from 'react-native';
import Texto from '../../components/Texto';
import { CredencialContext } from '../../contexts/credencialContext';
import { useContext } from 'react';
import Topo from '../../components/Topo';
import { useNavigation, useTheme } from '@react-navigation/native';


export default function Colaborador() {

  const { credencial, signOut } = useContext(CredencialContext)
  const navigation = useNavigation()
  const { colors } = useTheme()

  function gerarListaUnica(seed) {
    function random(seed) {
      var x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    }

    let numeros = new Set();
    let currentSeed = seed;

    while (numeros.size < 500) {
      let numero = Math.floor(random(currentSeed) * 9000) + 1000;
      numeros.add(numero);
      currentSeed++;
    }

    const randomIndex = Math.floor(Math.random() * Array.from(numeros).length);
    const randomNumber = Array.from(numeros)[randomIndex];

    return randomNumber;
  }


  return (
    <>
      <Topo
        iconeLeft={{ nome: 'chevron-back', acao: () => navigation.goBack() }}
        iconeRight={{nome: 'power-outline', acao: () => signOut()}}
        titulo='Cades Ponto' />

      <View style={{ flex: 1, alignItems: 'center', justifyContent: "center" }}>
        <View style={{ marginBottom: 60 }}>

          <Texto tamanho={20} texto={`${credencial.nome}`} estilo={{ alignSelf: 'center' }} cor='#222' />
          <Texto tamanho={16} tipo='Light' texto={`Matricula: ${credencial.matricula}`} estilo={{ alignSelf: 'center' }} cor='#222' />
        </View>
        <Texto tipo='Light' texto={'Código único'} tamanho={16} estilo={{ alignSelf: 'center' }} cor='#222' />

          <Texto tamanho={55} tipo='Bold' texto={gerarListaUnica(credencial.matricula)} estilo={{ alignSelf: 'center' }} cor={colors.detalhe} />
      </View>

    </>
  );
}