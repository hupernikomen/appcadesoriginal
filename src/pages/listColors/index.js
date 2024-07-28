import { View, Text, FlatList } from 'react-native';

export default function ListColors() {

    const listColors = [
        { code: '00', color: 'Preta' },
        { code: '01', color: 'Branca' },
        { code: '02', color: 'Cinza' },
        { code: '03', color: 'Grafite' },
        { code: '04', color: 'Rosa' },
        { code: '16', color: 'Pink' },
        { code: '06', color: 'Amarela' },
        { code: '07', color: 'Vermelha' },
    ]

    return (
        <View>
            <FlatList data={listColors.sort((a, b) => a.color.localeCompare(b.color))}
                contentContainerStyle={{ paddingHorizontal: 14, }}
                ItemSeparatorComponent={<View style={{ borderBottomWidth: .5, borderColor: '#d9d9d9' }} />}
                ListHeaderComponent={<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}>
                    <Text style={{fontWeight:'500', color:"#000"}}>Cor</Text>
                    <Text style={{fontWeight:'500', color:"#000"}}>Código</Text>
                </View>}
                renderItem={({ item }) => (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}>
                        <Text style={{fontWeight:'300', color:"#000"}}>{item.color}</Text>
                        <Text style={{fontWeight:'300', color:"#000"}}>{item.code}</Text>
                    </View>
                )}
            />
        </View>
    );
}