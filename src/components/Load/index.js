import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '@react-navigation/native';

export default function Load() {

    const {colors} = useTheme()

    return (
        <View style={{flex:1,alignItems:'center', justifyContent:'center', backgroundColor:colors.theme}}>

            <ActivityIndicator size={50} color={'#fff'} />
        </View>
    );
}