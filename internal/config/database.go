package config

import (
	"fmt"
	"log"

	"taskflow/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	dsn := "postgres://postgres:postgres@127.0.0.1:5435/taskflow?sslmode=disable"

	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("❌ Failed to connect to database:", err)
	}

	// Auto migrate models
	database.AutoMigrate(&models.User{}, &models.Project{}, &models.Task{})

	DB = database
	fmt.Println("✅ Database connected & migrated")
}
