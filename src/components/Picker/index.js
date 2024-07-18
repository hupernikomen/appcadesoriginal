import React from 'react';
import { View, Text } from 'react-native';
import { Picker } from "@react-native-picker/picker";
import { useTheme } from '@react-navigation/native';

export default function Pick({ data, title, selectedValue, value, setValue }) {

  return (
    <View>
      <View style={{
        borderRadius: 6,
        marginVertical: 3,
        borderWidth: .4,
        borderColor: '#777'
      }}>
        <Text style={{ opacity: value ? .3 : 1, paddingHorizontal: 18, paddingTop: 6, color: '#000', fontSize: 13 }}>{title}</Text>
        <Picker
          mode="dialog"
          style={{ marginTop: -12, height: 50 }}
          selectedValue={selectedValue}
          onValueChange={(itemValue) => {
            setValue(itemValue);
          }}>
          <Picker.Item
            style={{
              color: '#aaa',
              fontSize: 15
            }}
          />
          {data.map((item) => {
            return (
              <Picker.Item
                key={item.id}
                value={item.id}
                label={item.name}
              />
            );
          })}
        </Picker>
      </View>

    </View>

  );
}
