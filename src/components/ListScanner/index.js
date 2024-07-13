import { View, Text, FlatList, Pressable } from 'react-native';

export default function ListScanner({ listScanner  },AddItemOrder) {

    const RenderItem = ({ data }) => {
        return (
            <Pressable onPress={() => AddItemOrder(data)} style={{
                flexDirection: "row",
                justifyContent: 'space-between',
                padding: 14,
            }}>

                <View style={{ flexDirection: "row" }}>
                    <Text style={{ fontSize: 15 }}>{data?.referencia} - {data?.nome}</Text>


                </View>
                <Text style={{ fontSize: 15 }}>{data.Produto?.valorAtacado}</Text>
            </Pressable>
        )
    }
    return (

        <FlatList
            ItemSeparatorComponent={<View style={{ borderBottomWidth: 1, borderColor: '#aaa' }} />}
            contentContainerStyle={{ gap: 6, margin: 6, borderRadius: 6 }}
            data={listScanner}
            renderItem={({ item }) => <RenderItem data={item} />}
        />

    );
}