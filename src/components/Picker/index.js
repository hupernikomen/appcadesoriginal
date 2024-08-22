import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Picker } from "@react-native-picker/picker";
import Texto from '../Texto';

export default function Pick({ data, title, selectedValue, setValue, style, info, itemTopo, valorItemTopo }) {
  const styles = StyleSheet.create({
    box: {
      height: 65,
      paddingVertical: 8,
      borderWidth: .5,
      borderColor: '#777',
      borderRadius: 18,
      paddingHorizontal: 12,
      marginVertical: 2
    },
    boxtop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 4
    }
  })
  return (
    <View style={[{
      height: 60,
      backgroundColor:'#e9e9e9',
      paddingVertical: 8,
      borderRadius: 12,
      paddingHorizontal: 12,
      margin: 2
    }, style]}>
      <View style={styles.boxtop}>
        <Texto texto={title} tipo={'Light'} tamanho={13} />
        <Texto texto={info} tipo={'Light'} tamanho={13} />
      </View>
      <Picker
        mode="dialog"
        style={{ marginTop: -18, height: 40, marginLeft:-12 }}
        selectedValue={selectedValue}
        onValueChange={(itemValue) => {
          setValue(itemValue);
        }}>
        <Picker.Item
          label={itemTopo}
          value={valorItemTopo}
          style={{
            color: '#aaa',
            fontSize: 15
          }}
        />
        {data?.map((item) => {
          return (
            <Picker.Item
              key={item.id}
              value={item}
              label={item.nome}
            />
          );
        })}
      </Picker>
    </View>


  );
}
