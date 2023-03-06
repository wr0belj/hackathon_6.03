package auth

import (
	"database/sql"
	"dbconn"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
)

type AuthS struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

var secret = []byte("xxxx")

func Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "wrong method", http.StatusMethodNotAllowed)
		return
	}

	var authS AuthS
	err := json.NewDecoder(r.Body).Decode(&authS)
	if err != nil {
		http.Error(w, "wrong body", http.StatusBadRequest)
		return
	}

	if authS.Username == "" {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if authS.Password == "" {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	query := fmt.Sprintf("SELECT username, hashed_passwd FROM users WHERE username = '%s'", authS.Username)
	row := dbconn.DBCon.QueryRow(query)

	var username string
	var hash1 string

	err = row.Scan(&username, &hash1)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "wrong password or username", http.StatusUnauthorized)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(hash1), []byte(authS.Password))
	if err != nil {
		http.Error(w, "wrong password or username", http.StatusUnauthorized)
		return
	}

	tokenString, err := generateJWT(username)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	responseMap := map[string]string{"token": tokenString}
	responseJson, _ := json.Marshal(responseMap)

	w.Write(responseJson)

}

func Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "wrong method", http.StatusMethodNotAllowed)
		return
	}

	var authS AuthS
	err := json.NewDecoder(r.Body).Decode(&authS)
	if err != nil {
		http.Error(w, "wrong body", http.StatusBadRequest)
		return
	}

	if authS.Username == "" {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if authS.Password == "" {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(authS.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	query := fmt.Sprintf("INSERT INTO users (username, hashed_passwd) VALUES ('%s', '%s')", authS.Username, hash)
	_, err = dbconn.DBCon.Exec(query)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	tokenString, err := generateJWT(authS.Username)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	responseMap := map[string]string{"token": tokenString}
	responseJson, _ := json.Marshal(responseMap)

	w.Write(responseJson)
}

func generateJWT(username string) (string, error) {
	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)
	claims["user"] = username
	claims["exp"] = time.Now().Add(time.Hour * 72).Unix()
	tokenString, err := token.SignedString(secret)
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

type UserClaim struct {
	jwt.RegisteredClaims
	Username string `json:"user"`
}

func VerifyJWT(token string) string {
	var userClaim UserClaim

	t, err := jwt.ParseWithClaims(token, &userClaim, func(t *jwt.Token) (interface{}, error) {
		return secret, nil
	})
	if err != nil {
		return ""
	}

	if !t.Valid {
		return ""
	}
	return userClaim.Username
}
