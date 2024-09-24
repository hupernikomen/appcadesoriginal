import { View, Dimensions, Text } from 'react-native';
import Icone from '../Icone';
import { useTheme } from '@react-navigation/native';


import Animated, { FadeInUp } from 'react-native-reanimated';
import Texto from '../Texto';
import { CredencialContext } from '../../contexts/credencialContext';
import { useContext } from 'react';

export default function Topo({ children, iconeLeft, iconeRight, titulo }) {

    const { autenticado } = useContext(CredencialContext)

    const { colors } = useTheme()

    return (
        autenticado ?  <Animated.View entering={FadeInUp.duration(400).delay(300)}> 

            <Animated.View entering={FadeInUp.duration(300).delay(300)}
                style={{ height: 60, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>

                <Icone onpress={iconeLeft?.acao} nomeDoIcone={iconeLeft?.nome} corDoIcone='#222' />
                <Texto texto={titulo} alinhamento='left' tipo='Medium' tamanho={20} cor='#222' />

                <Icone onpress={iconeRight?.acao} nomeDoIcone={iconeRight?.nome} corDoIcone='#222' />
            </Animated.View>

            {children}
        </Animated.View> : null
    ) 
}