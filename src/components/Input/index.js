import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRef } from 'react';

export default function Input({ load, lines, styleInput, styleContainer, security = true, colorActive = '#777', editable = true, type = 'default', title, value, setValue, multiline = true, maxlength, info }) {

  const inputRef = useRef(null);

  const handlePress = () => {
    inputRef.current.focus();
  };

  const styles = StyleSheet.create({
    box: {
      height: 60,
      paddingVertical: 8,
      borderWidth: .7,
      borderColor: colorActive,
      borderRadius: 12,
      paddingHorizontal: 12,
      marginVertical: 2
    },
    boxtop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontFamily: 'Roboto-Light',
      color: '#000',
      fontSize: 13,
      fontWeight: '300',
      marginLeft: 4
    },
    info: {
      fontFamily: 'Roboto-Light',
      color: '#000',
      fontSize: 13,
      fontWeight: '300'
    },
    input: {
      paddingVertical: 0,
      fontFamily: 'Roboto-Regular',
      color: '#000',
      verticalAlign: 'top'
    }
  })

  return (
    <Pressable onPress={handlePress} style={[styles.box, styleContainer]}>
      <View style={styles.boxtop}>
        <Text style={styles.title}>{title}</Text>
        <View>
          {load ? <ActivityIndicator size={14} /> :
            <Text style={styles.info}>{info}</Text>
          }
        </View>
      </View>

      <TextInput
        ref={inputRef}
        numberOfLines={lines}
        secureTextEntry={security}
        editable={editable}
        maxLength={maxlength}
        multiline={multiline}
        style={[styles.input, styleInput]}
        keyboardType={type}
        value={value}
        onChangeText={setValue}
      />
    </Pressable>
  );
}