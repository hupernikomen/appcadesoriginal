import { Pressable } from 'react-native';

export default function ContainerItem({ children, onpress }) {

    return (
        <Pressable onPress={onpress} style={{
            backgroundColor: '#f3f3f3',
            elevation: 5,
            flexDirection: 'row',
            padding: 14,
            height: 80,
            margin: 1,
            alignItems: 'center',
            borderWidth: 2,
            borderColor: '#fff',
        }}>
            {children}
        </Pressable>
    );
}