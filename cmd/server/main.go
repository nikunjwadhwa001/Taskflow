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
		api.GET("/dashboard", controllers.GetDashboardStats)

		api.GET("/projects", controllers.ListProjects)
		api.POST("/projects", controllers.CreateProject)
		api.GET("/projects/:projectId/tasks", controllers.ListTasks)
		api.POST("/projects/:projectId/tasks", controllers.CreateTask)
		api.DELETE("/projects/:projectId", controllers.DeleteProject)
		api.POST("/tasks/:taskId/status", controllers.UpdateTaskStatus)
		api.DELETE("/tasks/:taskId", controllers.DeleteTask)

	}

	// Dashboard Page (Auth checked via JS)
	r.GET("/dashboard", func(c *gin.Context) {
		c.HTML(200, "dashboard.html", gin.H{
			"title": "Dashboard",
		})
	})

	// Projects Page (Auth checked via JS)
	r.GET("/projects", func(c *gin.Context) {
		c.HTML(200, "projects.html", gin.H{
			"title": "Projects",
		})
	})

	// Tasks Page (Auth checked via JS)
	r.GET("/projects/:projectId/tasks", func(c *gin.Context) {
		c.HTML(200, "tasks.html", gin.H{
			"title":     "Tasks",
			"projectId": c.Param("projectId"),
		})
	})

	// Start server on port 8080
	r.Run(":8080")
}
