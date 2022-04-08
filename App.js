import React from 'react';
import Socure from 'rn-socure-sdk';


import { StyleSheet, Button, View, SafeAreaView, Text, Alert } from 'react-native';

const Separator = () => (
  <View style={styles.separator} />
);

const startLicense = () => {
  Socure.scanLicense().then((res) => {
    console.log('RES: ', res);
    navigation.navigate('ScannedInformation', res);
  });
};


const startPassport = () => {
  Socure.scanPassport().then((res) => {
    console.log('RES: ', res);
    navigation.navigate('ScannedInformation', {
      barcode: res.mrz,
      type: res.type,
    });
  });
};

const App = () => (
  <SafeAreaView style={styles.container}>
    <View>
      <Text style={styles.title}>
       Dcocument Verification in Just few Steps
      </Text>
      <Button
        title="Take selfie"
        onPress={() => Alert.alert('Simple Button pressed')}
      />
    </View>
    
    <View>
      <Text style={styles.title}>
        
      </Text>
      <View style={styles.fixToText}>
        <Button
          title="Scan Passport"
          onPress={startPassport}
        />
        <Button
          title="Scan ID"
          onPress={startLicense}
        />
      </View>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  title: {
    textAlign: 'center',
    marginVertical: 8,
  },
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  separator: {
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

export default App;