package controllers

import (
	"net/http"

	"taskflow/internal/config"
	"taskflow/internal/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// SHOW LOGIN PAGE
func ShowLogin(c *gin.Context) {
	c.HTML(http.StatusOK, "login.html", gin.H{
		"title": "Login",
	})
}

// HANDLE LOGIN (TEMP – will improve later)
func HandleLogin(c *gin.Context) {
	email := c.PostForm("email")
	password := c.PostForm("password")

	var user models.User

	// Find user by email
	result := config.DB.Where("email = ?", email).First(&user)
	if result.Error != nil {
		c.String(http.StatusUnauthorized, "Invalid email or password")
		return
	}

	// Compare password with hashed password
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		c.String(http.StatusUnauthorized, "Invalid email or password")
		return
	}

	// Generate JWT
	token, err := config.GenerateToken(user.ID)
	if err != nil {
		c.String(http.StatusInternalServerError, "Error generating token")
		return
	}

	// Send token to client
	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"token":   token,
	})

}

// SHOW REGISTER PAGE
func ShowRegister(c *gin.Context) {
	c.HTML(http.StatusOK, "register.html", gin.H{
		"title": "Register",
	})
}

// HANDLE REGISTER
func HandleRegister(c *gin.Context) {
	name := c.PostForm("name")
	email := c.PostForm("email")
	password := c.PostForm("password")

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		c.String(http.StatusInternalServerError, "Error hashing password")
		return
	}

	user := models.User{
		Name:     name,
		Email:    email,
		Password: string(hashedPassword),
	}

	// Save to DB
	result := config.DB.Create(&user)

	if result.Error != nil {
		c.String(http.StatusBadRequest, "Email already exists")
		return
	}

	c.String(http.StatusOK, "User registered successfully 🎉")
}
