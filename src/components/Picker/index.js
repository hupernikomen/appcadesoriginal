import React from 'react';
import { View, Text } from 'react-native';
import { Picker } from "@react-native-picker/picker";
import { useTheme } from '@react-navigation/native';
import Texto from '../Texto';

export default function Pick({ data, title, selectedValue, value, setValue, style }) {

  return (
    <View style={[{
      borderRadius: 12,
      marginVertical: 2,
      borderWidth: 1,
      borderColor: '#777',
      paddingVertical: 8,
    }, style]}>
      <Texto estilo={{marginLeft: 14}} texto={title} tipo={'Light'} tamanho={13} />
      <Picker
        mode="dialog"
        style={{ marginTop: -18, height: 40 }}
        selectedValue={selectedValue}
        onValueChange={(itemValue) => {
          setValue(itemValue);
        }}>
        <Picker.Item
          label=''
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
