import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvent,
  ZoomControl,
} from "react-leaflet";

function Locate(props) {
  const map = useMap();
  if (props.currPos) map.flyTo(props.currPos, 13);

  map.on("click", function (e) {
    if (
      props.markers?.some(
        (marker) => marker.lat === e.latlng.lat && marker.lng === e.latlng.lng
      )
    )
      return;

    props.showHandler(e.latlng);
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      props.setInitPos([pos.coords.latitude, pos.coords.longitude].join(","));
      map.flyTo([pos.coords.latitude, pos.coords.longitude]);
    });
  }, []);

  if (!props.markers || props.markers.length === 0) return null;

  return (
    <>
      {props.markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.latitude, marker.longitude]}
        ></Marker>
      ))}
    </>
  );
}

function MapComp(props) {
  return (
    <MapContainer center={[50.049683, 19.944544]} zoom={13} zoomControl={false}>
      <TileLayer
        attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
      />
      <ZoomControl position="bottomright" />
      <Locate
        currPos={props.currPos}
        markers={props.markers}
        setInitPos={props.setInitPos}
        showHandler={props.showHandler}
      />
    </MapContainer>
  );
}

export default MapComp;
