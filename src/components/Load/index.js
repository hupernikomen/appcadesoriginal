import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '@react-navigation/native';

export default function Load() {

    const { colors } = useTheme()

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
            <ActivityIndicator size={30} color={colors.theme} />
        </View>
    );
}