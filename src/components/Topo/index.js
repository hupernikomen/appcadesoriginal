import { View, Dimensions, Text } from 'react-native';
import Icone from '../Icone';
import { useTheme } from '@react-navigation/native';

import Animated, { FadeInUp } from 'react-native-reanimated';
import Texto from '../Texto';

export default function Topo({ children, iconeLeft, iconeRight, titulo }) {

    const { colors } = useTheme()

    return (
        <View style={{ elevation: 15 }}>

            <Animated.View entering={FadeInUp.duration(300).delay(300)}
                style={{ backgroundColor: colors.theme, height: 60, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                
                    <Icone onpress={iconeLeft?.acao} nomeDoIcone={iconeLeft?.nome} />
                    <Texto texto={titulo} alinhamento='left' tipo='Medium' tamanho={18} cor='#fff'/>

                <Icone onpress={iconeRight?.acao} nomeDoIcone={iconeRight?.nome} />
            </Animated.View>

            {children}
        </View>
    );
}