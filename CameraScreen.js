import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
} from "react-native";
import { Camera, CameraType } from "expo-camera";
import * as VideoThumbnails from "expo-video-thumbnails";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useIsFocused } from "@react-navigation/native";
import { DragResizeBlock, DragResizeContainer } from "react-native-drag-resize";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { StorageAccessFramework } from "expo-file-system";

export default function CameraScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(CameraType.back);
  const [camera, setCamera] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [thumbnailImage, setThumbnailImage] = useState(null);
  const [recordUri, setRecordUri] = useState(null);
  const isFocused = useIsFocused();
  const { height, width } = Dimensions.get("window");
  const [framSize, setFrameSize] = useState({
    x: 0,
    y: 0,
    width: 200,
    height: 300,
  });

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const audioPermission = await Camera.requestMicrophonePermissionsAsync();
      const mediaPermission = await MediaLibrary.requestPermissionsAsync();

      setHasPermission(
        cameraPermission.status === "granted" ||
          audioPermission.status === "granted" ||
          mediaPermission.status === "granted"
      );
    })();
  }, []);

  const saveFile = async (asset) => {
    const permissions =
      await StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (permissions.granted) {
      let directoryUri = permissions.directoryUri;
      let data = {
        ...framSize,
        videoFile: asset.filename,
      };
      const getVideoFilenName = asset.filename.split(".")[0];
      await StorageAccessFramework.createFileAsync(
        directoryUri,
        getVideoFilenName,
        "application/json"
      )
        .then(async (fileUri) => {
          await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data), {
            encoding: FileSystem.EncodingType.UTF8,
          });
        })
        .catch((e) => {
          console.log(e);
        });
    } else {
      alert("You must allow permission to save.");
    }
  };

  const recordVideo = async () => {
    try {
      setIsRecording(true);
      const data = await camera.recordAsync({ framSize });
      const { uri } = await VideoThumbnails.getThumbnailAsync(data.uri, {
        time: 15000,
      });
      setThumbnailImage(uri);
      setRecordUri(data.uri);

      const asset = await MediaLibrary.createAssetAsync(data.uri);
      saveFile(asset);
    } catch (error) {
      console.warn(error);
    }
  };

  const stopRecordVideo = async () => {
    camera.stopRecording();
    setIsRecording(false);
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      {isFocused && (
        <Camera style={styles.camera} type={type} ref={(ref) => setCamera(ref)}>
          <View style={styles.captureBox}>
            <DragResizeBlock
              x={framSize.x}
              y={framSize.y}
              w={framSize.width}
              h={framSize.height}
              onResize={(value) => {
                setFrameSize({ ...framSize, x: value[0], y: value[1] });
              }}
              onDrag={(value) => {
                setFrameSize({ ...framSize, x: value[0], y: value[1] });
              }}
            >
              <View
                style={{
                  marginHorizontal: "auto",
                  backgroundColor: "transparent",
                  borderWidth: 5,
                  borderColor: "white",
                  borderRadius: 2,
                  width: "100%",
                  height: "100%",
                }}
                onLayout={(event) => {
                  let { width, height } = event.nativeEvent.layout;
                  setFrameSize({ ...framSize, width: width, height });
                }}
              ></View>
            </DragResizeBlock>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.thumbnail}
              onPress={() => {
                navigation.navigate("VideoPlayer", { uri: recordUri });
              }}
            >
              {thumbnailImage && (
                <Image
                  source={{ uri: thumbnailImage }}
                  style={styles.thumbnailImage}
                />
              )}
            </TouchableOpacity>
            <View style={styles.recordView}>
              <TouchableOpacity
                style={[
                  styles.recordButton,
                  isRecording
                    ? { backgroundColor: "red" }
                    : { backgroundColor: "white" },
                ]}
                onPress={() => {
                  isRecording ? stopRecordVideo() : recordVideo();
                }}
              ></TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.videoList}
              onPress={() => {
                isRecording ? stopRecordVideo() : recordVideo();
              }}
            >
              <Ionicons name="md-list" size={40} color="transparent" />
            </TouchableOpacity>
          </View>
        </Camera>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },

  captureBox: {
    flex: 26,
    // backgroundColor: "blue",
    justifyContent: "center",
    // opacity: 0.8,
    alignItems: "center",
  },

  buttonContainer: {
    flex: 4,
    justifyContent: "space-between",
    backgroundColor: "transparent",
    flexDirection: "row",
    // margin: 20,
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  recordView: {
    alignSelf: "flex-end",
    alignItems: "center",
    backgroundColor: "grey",
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 100,
  },
  recordButton: {
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 100,
  },
  text: {
    fontSize: 18,
    color: "white",
  },
  thumbnail: {
    // flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
    backgroundColor: "grey",
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 100,
  },

  thumbnailImage: {
    width: 50,
    height: 50,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "white",
  },

  videoList: {
    alignSelf: "flex-end",
    alignItems: "center",
    // backgroundColor: "grey",
    // width: 50,
    // height: 50,
    // justifyContent: "center",
    // alignItems: "center",
    // padding: 10,
    // borderRadius: 100,
  },
});
