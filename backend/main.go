package main

import (
	"auth"
	"dbconn"
	"events"
	"log"
	"net/http"

	"github.com/rs/cors"
)

func main() {
	log.Println("app api")
	err := dbconn.DBConnect()
	if err != nil {
		log.Fatal(err)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/api/login", auth.Login)
	mux.HandleFunc("/api/register", auth.Register)
	mux.HandleFunc("/api/event/add", events.AddEvent)
	mux.HandleFunc("/api/event/getnear", events.GetEventsNear)
	mux.HandleFunc("/api/event/getof", events.GetEventsOf)
	mux.HandleFunc("/api/event/remove", events.RemoveEvent)
	mux.HandleFunc("/api/event/filter", events.RemoveEvent)
	mux.HandleFunc("/api/event/addPerson", events.AddPerson)

	handler := cors.Default().Handler(mux)
	log.Fatal(http.ListenAndServe("0.0.0.0:2137", handler))
}
