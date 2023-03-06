package events

import (
	"auth"
	"database/sql"
	"dbconn"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"strconv"
	"strings"
)

const r_earth = float64(6378)
const pi = math.Pi

type AddEventS struct {
	Token       string `json:"token"`
	Name        string `json:"name"`
	Category    string `json:"category"`
	Description string `json:"description"`
	MaxPeople   int    `json:"maxPeople"`
	Coordinates string `json:"coordinates"`
	StartDate   string `json:"startDate"`
	EndDate     string `json:"endDate"`
}

func AddEvent(w http.ResponseWriter, r *http.Request) {
	var addEventS AddEventS
	err := json.NewDecoder(r.Body).Decode(&addEventS)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	username := auth.VerifyJWT(addEventS.Token)

	fmt.Println(username)

	query := fmt.Sprintf("SELECT user_id FROM users WHERE username = '%s'", username)
	row := dbconn.DBCon.QueryRow(query)
	var user_id string

	err = row.Scan(&user_id)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "wrong user", http.StatusUnauthorized)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	cords := strings.Split(addEventS.Coordinates, ",")
	if len(cords) != 2 {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	latitude, err := strconv.ParseFloat(cords[0], 32)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	longitude, err := strconv.ParseFloat(cords[1], 32)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	query = fmt.Sprintf("INSERT INTO events (event_name, category, event_desc, max_people, latitude, longitude, user_id, actual_people, start_date, end_date) VALUES ('%s', '%s', '%s', '%d', '%f', '%f', '%s', 1, '%s', '%s')", addEventS.Name, addEventS.Category, addEventS.Description, addEventS.MaxPeople, latitude, longitude, user_id, addEventS.StartDate, addEventS.EndDate)

	_, err = dbconn.DBCon.Exec(query)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

}

type GetEventsNearS struct {
	Token       string `json:"token"`
	Coordinates string `json:"coordinates"`
}

type coordinates struct {
	Latitude  float64
	Longitude float64
}

type EventRowS struct {
	Name        string  `json:"name"`
	Category    string  `json:"category"`
	Description string  `json:"description"`
	MaxPeople   int     `json:"maxPeople"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	Username    string  `json:"username"`
}

func GetEventsNear(w http.ResponseWriter, r *http.Request) {
	var getEventsNearS GetEventsNearS
	err := json.NewDecoder(r.Body).Decode(&getEventsNearS)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	username := auth.VerifyJWT(getEventsNearS.Token)
	if username == "" {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	cords := strings.Split(getEventsNearS.Coordinates, ",")
	if len(cords) != 2 {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	latitude, err := strconv.ParseFloat(cords[0], 64)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	longitude, err := strconv.ParseFloat(cords[1], 64)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	boundaries := make(map[string]coordinates)
	boundaries["north"] = toNorthPosition(latitude, longitude)
	boundaries["south"] = toSouthPosition(latitude, longitude)
	boundaries["west"] = toWestPosition(latitude, longitude)
	boundaries["east"] = toEastPosition(latitude, longitude)

	fmt.Println(boundaries)

	query := fmt.Sprintf("SELECT e.event_id, e.event_name, e.category, e.event_desc, e.max_people, e.latitude, e.longitude,  u.username FROM events AS e LEFT JOIN users AS u ON e.user_id = u.user_id  WHERE e.latitude < %f AND e.latitude > %f AND e.longitude > %f AND e.longitude < %f", boundaries["north"].Latitude, boundaries["south"].Latitude, boundaries["west"].Longitude, boundaries["east"].Longitude)
	fmt.Println(query)
	rows, err := dbconn.DBCon.Query(query)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var eID string
	events := make(map[string]EventRowS)
	for rows.Next() {
		var eventRowS EventRowS
		if err := rows.Scan(&eID, &eventRowS.Name, &eventRowS.Category, &eventRowS.Description, &eventRowS.MaxPeople, &eventRowS.Latitude, &eventRowS.Longitude, &eventRowS.Username); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		events[eID] = eventRowS
	}

	eventsM, _ := json.Marshal(events)
	w.Write(eventsM)

}

type RemoveEventS struct {
	Token   string `json:"token"`
	EventID string `json:"eventID"`
}

func RemoveEvent(w http.ResponseWriter, r *http.Request) {
	var removeEventS RemoveEventS
	err := json.NewDecoder(r.Body).Decode(&removeEventS)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	username := auth.VerifyJWT(removeEventS.Token)
	if username == "" {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	query := fmt.Sprintf("DELETE FROM events WHERE event_id = '%s'", removeEventS.EventID)
	_, err = dbconn.DBCon.Exec(query)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

}

type AddPersonS struct {
	Token   string `json:"token"`
	EventID string `json:"eventID"`
}

func AddPerson(w http.ResponseWriter, r *http.Request) {
	var addPersonS AddPersonS
	err := json.NewDecoder(r.Body).Decode(&addPersonS)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	username := auth.VerifyJWT(addPersonS.Token)
	if username == "" {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	query := fmt.Sprintf("UPDATE events SET actual_people = actual_people + 1 WHERE event_id = '%s'", addPersonS.EventID)
	_, err = dbconn.DBCon.Exec(query)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

}

type GetEventsOfS struct {
	Token string `json:"token"`
}

func GetEventsOf(w http.ResponseWriter, r *http.Request) {
	var getEventsOfS GetEventsOfS
	err := json.NewDecoder(r.Body).Decode(&getEventsOfS)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	username := auth.VerifyJWT(getEventsOfS.Token)
	if username == "" {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	query := fmt.Sprintf("SELECT e.event_id, e.event_name, e.category, e.event_desc, e.max_people, e.latitude, e.longitude,  u.username FROM events AS e LEFT JOIN users AS u ON e.user_id = u.user_id  WHERE u.username = '%s'", username)
	fmt.Println(query)
	rows, err := dbconn.DBCon.Query(query)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var eID string
	events := make(map[string]EventRowS)
	for rows.Next() {
		var eventRowS EventRowS
		if err := rows.Scan(&eID, &eventRowS.Name, &eventRowS.Category, &eventRowS.Description, &eventRowS.MaxPeople, &eventRowS.Latitude, &eventRowS.Longitude, &eventRowS.Username); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		events[eID] = eventRowS
	}

	eventsM, _ := json.Marshal(events)
	w.Write(eventsM)
}

func toNorthPosition(latitude float64, longitiude float64) coordinates {
	var coords coordinates
	coords.Latitude = latitude + (10/r_earth)*(180/pi)
	coords.Longitude = longitiude
	return coords
}

func toEastPosition(latitude float64, longitiude float64) coordinates {
	var coords coordinates
	coords.Latitude = latitude
	coords.Longitude = longitiude + (10/r_earth)*(180/pi)/math.Cos(float64(latitude)*pi/180)
	return coords
}

func toSouthPosition(latitude float64, longitiude float64) coordinates {
	var coords coordinates
	coords.Latitude = latitude - (10/r_earth)*(180/pi)
	coords.Longitude = longitiude
	return coords
}

func toWestPosition(latitude float64, longitiude float64) coordinates {
	var coords coordinates
	coords.Latitude = latitude
	coords.Longitude = longitiude - (10/r_earth)*(180/pi)/math.Cos(latitude*pi/180)
	return coords
}
