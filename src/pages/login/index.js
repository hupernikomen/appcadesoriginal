import { useState, useContext } from 'react'
import { Pressable, View, StyleSheet, Image, Dimensions,StatusBar } from 'react-native'
import Load from '../../components/Load'
import { CredencialContext } from '../../contexts/credencialContext'
import { AppContext } from '../../contexts/appContext'
import { useTheme } from '@react-navigation/native'

import MaskOfInput from '../../components/MaskOfInput';
import Texto from '../../components/Texto'

export default function Login() {

    const { width } = Dimensions.get('window')
    const { signIn } = useContext(CredencialContext)
    const { load } = useContext(AppContext)
    const { colors } = useTheme()
    const [nome, setNome] = useState('')
    const [senha, setSenha] = useState('')
    const logo = require('../../../assets/images/logocades.png');

    if (load) return <Load />

    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: 'center' }}>


            <Image source={logo} style={{ alignSelf: 'center', width: 150, height: 150, opacity: .1, marginBottom:24 }} />
            <View style={{ width: width, alignItems: 'center', justifyContent: 'center' }}>

                <MaskOfInput value={nome} setValue={setNome} title='Usuário' styleMask={{ width: width - 100 }} />
                <MaskOfInput type='numeric' value={senha} setValue={setSenha} title='Senha' styleMask={{ width: width - 100 }} />

                <Pressable
                    style={[stl.botaoEntrar, { backgroundColor: colors.detalhe, width: width - 100 }]}
                    onPress={() => signIn(nome, senha)} >

                    <Texto texto={'Entrar'} cor='#fff' />

                </Pressable>
            </View>

        </View>

    );
}

const stl = StyleSheet.create({
    botaoEntrar: {
        margin: 14,
        height: 55,
        borderRadius: 6,
        justifyContent: "center",
        alignItems: "center"
    }
})