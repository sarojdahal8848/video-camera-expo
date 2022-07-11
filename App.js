import React from "react";
import CameraScreen from "./CameraScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import VideoPlayerScreen from "./VideoPlayerScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={CameraScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VideoPlayer"
          component={VideoPlayerScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
