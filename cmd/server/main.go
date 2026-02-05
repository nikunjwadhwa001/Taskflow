package main

import (
	"github.com/gin-gonic/gin"

	"taskflow/internal/config"
	"taskflow/internal/controllers"
	"taskflow/internal/middleware"
)

func main() {

	config.ConnectDatabase()

	// Create Gin router with logger + recovery middleware
	r := gin.Default()

	// Load all HTML templates
	r.LoadHTMLGlob("templates/*.html")

	// Serve static files (CSS, JS)
	r.Static("/static", "./static")

	// Home page
	r.GET("/", func(c *gin.Context) {
		c.HTML(200, "index.html", gin.H{
			"title": "Home",
		})
	})

	// Login routes (using controller)
	r.GET("/login", controllers.ShowLogin)
	r.POST("/login", controllers.HandleLogin)

	// Register routes
	r.GET("/register", controllers.ShowRegister)
	r.POST("/register", controllers.HandleRegister)

	// Protected API routes
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		api.GET("/dashboard", func(c *gin.Context) {
			userID, _ := c.Get("user_id")
			c.JSON(200, gin.H{
				"message": "Welcome to dashboard",
				"user_id": userID,
			})
		})
	}

	// Dashboard Page (Auth checked via JS)
	r.GET("/dashboard", func(c *gin.Context) {
		c.HTML(200, "dashboard.html", gin.H{
			"title": "Dashboard",
		})
	})

	// Start server on port 8080
	r.Run(":8080")
}
