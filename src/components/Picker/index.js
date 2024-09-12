import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker } from "@react-native-picker/picker";
import Texto from '../Texto';

export default function Pick({ editable = true, data, title, selectedValue, setValue, style, info, itemTopo, valorItemTopo }) {
  const styles = StyleSheet.create({

    boxtop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
    }
  })
  return (
    <View style={[{
      height: 50,
      backgroundColor: "#e9e9e999",
      paddingVertical: 4,
      borderRadius: 12,
      paddingHorizontal: 12,
      margin: 2
    }, style]}>
      <View style={styles.boxtop}>
        <Texto texto={title} tamanho={13} />
        <Texto texto={info} tipo={'Light'} tamanho={13} />
      </View>

      <Picker
        mode="dialog"
        enabled={editable}
        style={{ marginTop: -18, height: 40, marginLeft: -12 }}
        selectedValue={selectedValue}
        onValueChange={(itemValue) => {
          setValue(itemValue);
        }}>
        <Picker.Item
          label={itemTopo}
          value={valorItemTopo}
          style={{
            fontFamily: 'Roboto-Light',
            color: '#aaa',
            fontSize: 14
          }}
        />
        {data?.map((item) => {
          return (
            <Picker.Item
              style={{ fontFamily: 'Roboto-Light', fontSize: 14 }}
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
