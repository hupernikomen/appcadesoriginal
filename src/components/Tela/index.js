import { View } from 'react-native';

export default function Tela({ children }) {

    return (
        <View style={{
            paddingHorizontal: 18,
            flex: 1
        }}>
            {children}
        </View>
    );
}