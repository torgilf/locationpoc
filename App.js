import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { Platform, Text, View, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Device from 'expo-device';

TaskManager.defineTask('YOUR_TASK_NAME', ({ data: { locations }, error }) => {
  if (error) {
    // check `error.message` for more details.
    return;
  }
  console.log('Got new locations', locations);
  // new http call
  fetch('https://en7e330ckld0m.x.pipedream.net/', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({device: Device.deviceName, locations: locations})
  })
});

export default function App() {

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {

      if (Platform.OS === 'android' && !Constants.isDevice) {
        setErrorMsg(
          'Oops, this will not work on Snack in an Android emulator. Try it on your device!'
        );
        return;
      }

      // Asks the user to grant permissions for location while the app is in the foreground
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission requestForegroundPermissionsAsync was denied');
        return;
      } else 
        console.log('Permission requestForegroundPermissionsAsync granted');

      // Asks the user to grant permissions for location while the app is in the background
      status = (await Location.requestBackgroundPermissionsAsync()).status;
      console.log(status);
      if (status !== 'granted') {
        setErrorMsg('Permission requestBackgroundPermissionsAsync location was denied');
        return;
      } else 
        console.log('Permission requestBackgroundPermissionsAsync granted');

      // Registers for receiving location updates that can also come when the app is in the background.
      let res = await Location.startLocationUpdatesAsync('YOUR_TASK_NAME', {
        // Location manager accuracy. Pass one of LocationAccuracy enum values. 
        //For low-accuracy the implementation can avoid geolocation providers that consume a significant amount of power (such as GPS).
        accuracy: Location.Accuracy.High,
        // Minimum time to wait between each update in milliseconds. Default value depends on accuracy option. (Android only)
        timeInterval: 5000,
        // Receive updates only when the location has changed by at least this distance in meters. Default value may depend on accuracy option.
        distanceInterval: 5,
        showsBackgroundLocationIndicator: true,
        //  Use this option to put the location service into a foreground state, 
        // which will make location updates in the background as frequent as in the foreground state. 
        // As a downside, it requires a sticky notification, so the user will be aware that your app 
        // is running and consumes more resources even if backgrounded. (Available since Android 8.0)
        foregroundService: {
          // Title of the foreground service notification. required
          notificationTitle: 'LocationPOC',
          // Subtitle of the foreground service notification. required
          notificationBody: 'Is running',
        }
      });

      // get foreground location
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      // pass device and location to requestbin
      fetch('https://en7e330ckld0m.x.pipedream.net/', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({devicee: Device, foregroundlocation: location})
      })


    })();
  }, []);

  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  return (
    <View style={styles.container}>
      <Text>Background location POC</Text>
      <Text>v1.0</Text>
      <Text style={styles.paragraph}>{text}</Text>      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paragraph: {
    fontSize: 18,
    textAlign: 'center',
  },
});
