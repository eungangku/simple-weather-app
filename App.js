import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ScrollView, Dimensions } from "react-native";
import * as Location from "expo-location";

// openweathermap.org API
const API_KEY = "f50c83864869dd9da9d82ee5ddf3ca68";

const { width: DeviceWidth } = Dimensions.get("window");

export default function App() {
  const [primarycolor, setPrimarycolor] = useState("#005a80");
  const [city, setCity] = useState("Weather");
  const [days, setDays] = useState([]);
  const [ok, setOk] = useState(true);
  const ask = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission to access location was denied");
      setOk(false);
    } else {
      let {
        coords: { latitude, longitude },
      } = await Location.getCurrentPositionAsync({ accuracy: 5 });
      const location = await Location.reverseGeocodeAsync({ latitude, longitude }, { useGoogleMaps: false });
      if (location[0].city === null) {
        setCity(location[0].region);
      } else {
        setCity(location[0].city);
      }

      const res = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
      const json = await res.json();
      setDays(json.daily);
    }
  };

  useEffect(() => {
    ask();
  }, []);

  const convertTime = (epoch) => {
    const date = new Date(epoch * 1000);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.cityname}>{city}</Text>
      </View>
      <View style={styles.contentContainer}>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weather}>
          {days.length === 0 ? (
            <View style={styles.loading}>
              {/* <Text style={styles.temp}>00</Text> */}
              <Text style={styles.desc}>loading...</Text>
            </View>
          ) : (
            days.map((day, index) => {
              return (
                <View key={index} style={styles.day}>
                  <View style={styles.dateContainer}>
                    <Text style={styles.date}>{convertTime(day.dt)}</Text>
                  </View>
                  <Text style={styles.temp}>{Math.round(day.temp.day)}</Text>
                  <Text style={styles.desc}>{day.weather[0].main}</Text>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#005a80",
  },
  header: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cityname: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "bold",
  },
  contentContainer: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: "#fff",
    flex: 3,
  },
  loading: {
    width: DeviceWidth,
    marginTop: 150,
    alignItems: "center",
  },
  day: {
    width: DeviceWidth,
    alignItems: "center",
  },
  dateContainer: {
    borderRadius: 30,
    marginTop: 120,
    padding: 8,
    backgroundColor: "#ececec",
  },
  date: {
    color: "gray",
    fontSize: 20,
    fontWeight: "bold",
  },
  temp: {
    marginTop: 20,
    color: "#005a80",
    fontSize: 180,
    fontWeight: "bold",
  },
  desc: {
    color: "gray",
    margin: -20,
    fontSize: 50,
  },
});
