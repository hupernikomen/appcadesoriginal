import { useState, useContext } from 'react'
import { Pressable, View, StyleSheet, Image } from 'react-native'
import Load from '../../components/Load'
import { AppContext } from '../../contexts/appContext'
import { useTheme } from '@react-navigation/native'

import MaskOfInput from '../../components/MaskOfInput';
import Texto from '../../components/Texto'

export default function Login() {

    const { signIn, load } = useContext(AppContext)
    const { colors } = useTheme()
    const [nome, setNome] = useState('')
    const [senha, setSenha] = useState('')
    const logo = require('../../../assets/images/logocades.png');

    if (load) return <Load />

    return (
        <View style={{ flex: 1 }}>
            <Image source={logo} style={{ alignSelf: 'center', position: 'absolute', top: 0 }} />
            <View style={{ width: '100%', flex: 1, alignItems: 'center', justifyContent: 'center' }}>

                <View style={{ margin: 14, width: '100%', padding: 14 }}>


                    <MaskOfInput value={nome} setValue={setNome} title='Usuário' />
                    <MaskOfInput type='numeric' value={senha} setValue={setSenha} title='Senha' />
                    <Pressable
                        style={[stl.botaoEntrar, { backgroundColor: colors.detalhe }]}
                        onPress={() => signIn(nome, senha)}
                    >

                        <Texto texto={'Entrar'} cor='#fff' />

                    </Pressable>
                </View>

            </View>

            <Texto texto={'Desenvolvido por Wilson Ramos'} estilo={{ alignSelf: "center"}} cor='#aaa' tipo='Light'/>
            <Texto texto={'Cades Original'} estilo={{ alignSelf: "center", marginBottom: 20 }} tipo='Light'/>

        </View>
    );
}

const stl = StyleSheet.create({
    botaoEntrar: {
        margin: 14,
        height: 65,
        borderRadius: 6,
        justifyContent: "center",
        alignItems: "center"
    }
})