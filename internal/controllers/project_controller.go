package controllers

import (
	"net/http"

	"taskflow/internal/config"
	"taskflow/internal/models"

	"github.com/gin-gonic/gin"
)

func CreateProject(c *gin.Context) {
	// JWT claims are float64 by default
	userIDFloat, _ := c.Get("user_id")
	userID := uint(userIDFloat.(float64))
	name := c.PostForm("name")

	project := models.Project{
		Name:   name,
		UserID: userID,
	}

	config.DB.Create(&project)

	c.JSON(http.StatusOK, gin.H{"message": "Project created successfully", "project": project})
}

func ListProjects(c *gin.Context) {
	// JWT claims are float64 by default
	userIDFloat, _ := c.Get("user_id")
	userID := uint(userIDFloat.(float64))
	var projects []models.Project

	config.DB.Where("user_id = ?", userID).Find(&projects)

	c.JSON(http.StatusOK, gin.H{"projects": projects})
}

func DeleteProject(c *gin.Context) {
	// JWT claims are float64 by default
	userIDFloat, _ := c.Get("user_id")
	userID := uint(userIDFloat.(float64))
	projectID := c.Param("projectId")

	var project models.Project

	// 1. Find project and check ownership
	if err := config.DB.Where("id = ? AND user_id = ?", projectID, userID).First(&project).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Project not found or unauthorized"})
		return
	}

	// 2. Cascading Soft Delete: Delete all tasks belonging to this project first
	config.DB.Where("project_id = ?", projectID).Delete(&models.Task{})

	// 3. Delete Project
	config.DB.Delete(&project)

	c.JSON(http.StatusOK, gin.H{"message": "Project deleted successfully"})
}
