import { useState, useContext } from 'react'
import { Pressable, View, StyleSheet, Image, Dimensions } from 'react-native'
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
        <View style={{ flex: 1 }}>

                <Image source={logo} style={{ alignSelf: 'center', width: 200, height: 320, opacity: .05, marginBottom: -100 }} />
                <View style={{ width: width, flex: 1, alignItems: 'center', justifyContent: 'center' }}>

                    <View style={{width: width, padding: 14 }}>

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