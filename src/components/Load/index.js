import { View, Image } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Animated, { FadeInDown, BounceInDown } from 'react-native-reanimated';

export default function Load() {

    const { colors } = useTheme()

    return (
        <Animated.View entering={FadeInDown.duration(1500)} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
            <Image
                style={{ width: 130, height: 130, marginBottom: 50, opacity: .5 }}
                source={require('../../../assets/images/logocades.png')}
            />
        </Animated.View>
    );
}