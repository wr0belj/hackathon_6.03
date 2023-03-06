import styles from "./BasicView.module.css";
import EventItem from "../EventItem/EventItem";
import MapComp from "../map/MapComp";
import GuestGuard from "../guards/GuestGuard";
import EditUser from "../editUser/editUser";
import AddEvent from "../addEvent/addEvent";
import icon from "../../assets/shutdown.svg";

import Profile from "../profile/profile";
import { useContext, useEffect, useState } from "react";
import { UserContext, userClear } from "../../store/user-context";
import useFetch from "../../hooks/useFetch";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { getLatLng, geocodeByAddress } from "react-google-places-autocomplete";
// import getLatLng from "react-google-places-autocomplete";

function BasicView() {
  const [showProfile, setShowProfile] = useState(false);
  const { setUser, user } = useContext(UserContext);
  const [showEvent, setShowEvent] = useState(false);
  const [pos, setPos] = useState([]);
  const [currentPos, setCurrentPos] = useState([50.049683, 19.944544]);
  const [initPos, setInitPos] = useState("50.049683,19.944544");
  const [markers, setMarkers] = useState([]);
  const { sendData } = useFetch();
  const [searchValue, setSearchValue] = useState(null);
  const [activeEventItem, setActiveEventItem] = useState("");

  const getMarkers = function (coords = currentPos.join(",")) {
    setMarkers([]);

    const data = {
      token: user.token,
      coordinates: coords,
    };

    sendData("http://10.0.5.43:2137/api/event/getnear", data, (events) => {
      for (const eventData in events) {
        const eventObject = { ...events[eventData], id: eventData };

        setMarkers((prev) => {
          if (markers.some((marker) => marker.id === eventData.id)) return prev;

          return [...prev, eventObject];
        });
      }
    });
  };

  const getSearchLatLng = async function () {
    const results = await geocodeByAddress(searchValue.label);

    const latlng = await getLatLng(results[0]);

    setCurrentPos([latlng.lat, latlng.lng]);

    getMarkers([latlng.lat, latlng.lng].join(","));
  };

  // get events
  useEffect(() => {
    getMarkers(initPos);
  }, []);

  useEffect(() => {
    if (!searchValue) return;

    getSearchLatLng();
  }, [searchValue]);

  const showProfileToggler = function () {
    setShowProfile((prev) => !prev);
  };

  const logoutHandler = function () {
    localStorage.removeItem("token");
    setUser(userClear);
  };

  const showAddEventHandler = function (e) {
    setShowEvent(true);
    setPos(e);
  };

  const closeAddEventHandler = function () {
    setShowEvent(false);
  };

  return (
    <GuestGuard>
      <div className={styles.view}>
        <div className={styles.top}>
          <a href="#" className={styles.home}>
            Socialy
          </a>
          <div className={styles["search-box"]}>
            <GooglePlacesAutocomplete
              apiKey="AIzaSyARONBL5gHc539OYxCF8kdhzIjCNu45bzA"
              selectProps={{
                value: searchValue,
                onChange: setSearchValue,
                styles: {
                  input: (provided) => ({
                    ...provided,
                    width: "24rem",
                  }),
                },
              }}
            />
          </div>
          <div className={styles.btns}>
            <button className={styles.filter}>Filters</button>
            <button onClick={showProfileToggler} className={styles.profile}>
              Profile
            </button>
            <img
              onClick={logoutHandler}
              src={icon}
              alt="shutdown"
              className={styles.shutdown}
            />
          </div>
        </div>
        <div className={styles["left-bar"]}>
          {!showProfile && (
            <ul>
              {markers.map((item, i) => (
                <EventItem
                  itemInfo={item}
                  key={item.id + i}
                  setPos={setCurrentPos}
                  active={activeEventItem}
                  setActive={setActiveEventItem}
                />
              ))}
            </ul>
          )}
          {showProfile && <Profile profileToggler={showProfileToggler} />}
        </div>
        <div className={styles["right-bar"]}>
          <MapComp
            showHandler={showAddEventHandler}
            setInitPos={setInitPos}
            currPos={currentPos}
            markers={markers}
          />
        </div>
      </div>
      {showEvent && (
        <AddEvent
          closeHandler={closeAddEventHandler}
          position={pos}
          updateMarkers={getMarkers}
        />
      )}
    </GuestGuard>
  );
}

export default BasicView;
