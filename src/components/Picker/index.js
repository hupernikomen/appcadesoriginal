import React from 'react';
import { View } from 'react-native';
import { Picker } from "@react-native-picker/picker";
import Texto from '../Texto';

export default function Pick({ data, title, selectedValue, setValue, style }) {

  return (
    <View style={[{
      height: 65,
      paddingVertical: 8,
      borderWidth: .5,
      borderColor: '#777',
      borderRadius: 18,
      paddingHorizontal: 12,
      marginVertical: 2
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
