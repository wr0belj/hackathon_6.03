package dbconn

import (
	"database/sql"

	_ "github.com/lib/pq"
)

var DBCon *sql.DB

func DBConnect() error {
	connStr := "postgresql://app:xxxx@1.1.1.1/app?sslmode=disable"
	var err error
	DBCon, err = sql.Open("postgres", connStr)

	if DBCon != nil {
		return err
	}

	return nil
}
