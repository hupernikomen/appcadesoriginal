import { View, Text, TextInput, StyleSheet } from 'react-native';

export default function Input({ style, security = true, colorActive = '#777', editable = true, type = 'default', title, value, setValue, multiline = true, maxlength, info }) {

  const styles = StyleSheet.create({
    box: {
      margin: 2,
      height: 60,
      paddingVertical: 8,
      borderWidth: .7,
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
      color: '#000',
      fontSize: 13,
      fontWeight: '300'
    },
    info: {
      color: '#000',
      fontSize: 13,
      fontWeight: '300'
    },
    input: {
      fontWeight: '300',
      paddingVertical: 0,
      color: '#000'
    }
  })

  return (
    <View style={[styles.box, style]}>
      <View style={styles.boxtop}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.info}>{info}</Text>
      </View>

      <TextInput
        secureTextEntry={security}
        editable={editable}
        maxLength={maxlength}
        multiline={multiline}
        style={styles.input}
        keyboardType={type}
        value={value}
        onChangeText={setValue}
      />
    </View>
  );
}