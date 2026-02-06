package controllers

import (
	"net/http"
	"strconv"

	"taskflow/internal/config"
	"taskflow/internal/models"

	"github.com/gin-gonic/gin"
)

func ListTasks(c *gin.Context) {
	// JWT claims are float64 by default
	userIDFloat, _ := c.Get("user_id")
	userID := uint(userIDFloat.(float64))
	projectID := c.Param("projectId")

	var project models.Project

	// Ensure project belongs to user
	if err := config.DB.
		Where("id = ? AND user_id = ?", projectID, userID).
		First(&project).Error; err != nil {

		c.JSON(http.StatusForbidden, gin.H{"error": "Unauthorized access"})
		return
	}

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "5"))
	offset := (page - 1) * limit

	var tasks []models.Task
	var total int64

	// Count total tasks for this project (for frontend logic)
	config.DB.Model(&models.Task{}).Where("project_id = ?", projectID).Count(&total)

	// Fetch paginated tasks
	config.DB.Where("project_id = ?", projectID).Limit(limit).Offset(offset).Find(&tasks)

	c.JSON(http.StatusOK, gin.H{
		"tasks":       tasks,
		"total":       total,
		"currentPage": page,
		"totalPages":  (total + int64(limit) - 1) / int64(limit),
	})
}

func CreateTask(c *gin.Context) {
	// JWT claims are float64 by default
	userIDFloat, _ := c.Get("user_id")
	userID := uint(userIDFloat.(float64))
	projectID := c.Param("projectId")

	var project models.Project

	// Check project ownership
	if err := config.DB.
		Where("id = ? AND user_id = ?", projectID, userID).
		First(&project).Error; err != nil {

		c.JSON(http.StatusForbidden, gin.H{"error": "Unauthorized"})
		return
	}

	task := models.Task{
		Title:       c.PostForm("title"),
		Description: c.PostForm("description"),
		Status:      "todo",
		ProjectID:   project.ID,
	}

	config.DB.Create(&task)
	c.JSON(http.StatusOK, gin.H{"message": "Task created successfully", "task": task})
}

func UpdateTaskStatus(c *gin.Context) {
	// JWT claims are float64 by default
	userIDFloat, _ := c.Get("user_id")
	userID := uint(userIDFloat.(float64))
	taskID := c.Param("taskId")
	newStatus := c.PostForm("status")

	var task models.Task
	var project models.Project

	// 1. Find task
	if err := config.DB.First(&task, taskID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	// 2. Find project of task
	if err := config.DB.First(&project, task.ProjectID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	// 3. Authorization check
	if project.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not allowed to modify this task"})
		return
	}

	// 4. Update status
	task.Status = newStatus
	config.DB.Save(&task)

	c.JSON(http.StatusOK, gin.H{"message": "Task status updated successfully", "status": newStatus})
}

func DeleteTask(c *gin.Context) {
	// JWT claims are float64 by default
	userIDFloat, _ := c.Get("user_id")
	userID := uint(userIDFloat.(float64))
	taskID := c.Param("taskId")

	var task models.Task
	var project models.Project

	// 1. Find task
	if err := config.DB.First(&task, taskID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	// 2. Find project to check ownership
	if err := config.DB.First(&project, task.ProjectID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	// 3. Authorization check
	if project.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not allowed to delete this task"})
		return
	}

	// 4. Soft Delete
	config.DB.Delete(&task)

	c.JSON(http.StatusOK, gin.H{"message": "Task deleted successfully"})
}
