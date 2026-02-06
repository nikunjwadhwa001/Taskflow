package controllers

import (
	"net/http"

	"taskflow/internal/config"
	"taskflow/internal/models"

	"github.com/gin-gonic/gin"
)

func GetDashboardStats(c *gin.Context) {
	// JWT claims are float64 by default
	userIDFloat, _ := c.Get("user_id")
	userID := uint(userIDFloat.(float64))

	var projectCount int64
	var taskCount int64
	var todoCount int64
	var inProgressCount int64
	var doneCount int64

	// Count projects
	config.DB.Model(&models.Project{}).
		Where("user_id = ?", userID).
		Count(&projectCount)

	// Get user's project IDs
	var projectIDs []uint
	config.DB.Model(&models.Project{}).
		Where("user_id = ?", userID).
		Pluck("id", &projectIDs)

	// If user has no projects, return 0s immediately
	if len(projectIDs) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"message":         "Dashboard stats",
			"projectCount":    0,
			"taskCount":       0,
			"todoCount":       0,
			"inProgressCount": 0,
			"doneCount":       0,
		})
		return
	}

	// Count tasks
	config.DB.Model(&models.Task{}).
		Where("project_id IN ?", projectIDs).
		Count(&taskCount)

	config.DB.Model(&models.Task{}).
		Where("project_id IN ? AND status = ?", projectIDs, "todo").
		Count(&todoCount)

	config.DB.Model(&models.Task{}).
		Where("project_id IN ? AND status = ?", projectIDs, "in_progress").
		Count(&inProgressCount)

	config.DB.Model(&models.Task{}).
		Where("project_id IN ? AND status = ?", projectIDs, "done").
		Count(&doneCount)

	c.JSON(http.StatusOK, gin.H{
		"message":         "Dashboard stats",
		"projectCount":    projectCount,
		"taskCount":       taskCount,
		"todoCount":       todoCount,
		"inProgressCount": inProgressCount,
		"doneCount":       doneCount,
	})
}
