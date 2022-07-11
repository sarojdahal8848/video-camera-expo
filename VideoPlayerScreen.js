import * as React from "react";
import { View, StyleSheet, Button, Dimensions } from "react-native";
import { Video, AVPlaybackStatus } from "expo-av";
import * as ScreenOrientation from "expo-screen-orientation";

export default function VideoPlayerScreen({ route }) {
  const { uri } = route.params;
  console.log(route.params);
  const video = React.useRef(null);
  const [status, setStatus] = React.useState({});
  const { height, width } = Dimensions.get("window");

  function setOrientation() {
    if (Dimensions.get("window").height > Dimensions.get("window").width) {
      //Device is in portrait mode, rotate to landscape mode.
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      //Device is in landscape mode, rotate to portrait mode.
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    }
  }

  return (
    <View style={styles.container}>
      <Video
        ref={video}
        style={([styles.video], { width: width, height: height / 2 })}
        source={{
          uri: uri,
        }}
        useNativeControls
        resizeMode="contain"
        isLooping
        onPlaybackStatusUpdate={(status) => setStatus(() => status)}
        onFullscreenUpdate={setOrientation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "black",
  },
  video: {
    alignSelf: "center",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
