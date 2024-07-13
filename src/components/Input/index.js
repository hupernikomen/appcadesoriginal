import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

export default function Input({ colorActive='#000', editable = true, type = 'default', title, value, setValue, multiline = true, maxlength, info }) {


  const styles = StyleSheet.create({
    box: {
      paddingVertical: 8,
      marginVertical: 4,
      borderWidth: .4,
      borderColor: colorActive,
      borderRadius: 6,
      paddingHorizontal: 12,
    },
    boxtop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 6
    },
    title: {
      opacity: value ? .6 : 1,
      color: colorActive,
      fontSize: 13
    },
    info: {
      color: '#000',
      fontSize: 13
    },
    input: {
      fontSize: 15,
      paddingVertical: 0,
      color: colorActive
    }
  })

  return (
    <View style={styles.box}>
      <View style={styles.boxtop}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.info}>{info}</Text>
      </View>

      <TextInput
        editable={editable}
        maxLength={maxlength}
        multiline={multiline}
        style={styles.input}
        keyboardType={type}
        value={value}
        onChangeText={(e) => setValue(e)}
      />
    </View>
  );
}