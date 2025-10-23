package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

type Enrollment struct {
	ID       int `json:"id"`
	UserID   int `json:"user_id"`
	CourseID int `json:"course_id"`
	Progress int `json:"progress"` // percentage
}

var db *sql.DB

func main() {
	initDB()
	defer db.Close()

	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	r.POST("/enroll", enrollUser)
	r.GET("/progress/:userId/:courseId", getProgress)

	log.Println("Enrollment Service starting on :8083")
	r.Run(":8083")
}

func initDB() {
	var err error
	db, err = sql.Open("postgres", os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal(err)
	}

	if err = db.Ping(); err != nil {
		log.Fatal(err)
	}

	// Create enrollments table if not exists
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS enrollments (
		id SERIAL PRIMARY KEY,
		user_id INTEGER NOT NULL,
		course_id INTEGER NOT NULL,
		progress INTEGER DEFAULT 0,
		UNIQUE(user_id, course_id)
	)`)
	if err != nil {
		log.Fatal(err)
	}
}

func enrollUser(c *gin.Context) {
	var enrollment Enrollment
	if err := c.ShouldBindJSON(&enrollment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := db.Exec("INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) ON CONFLICT (user_id, course_id) DO NOTHING", enrollment.UserID, enrollment.CourseID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to enroll user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User enrolled successfully"})
}

func getProgress(c *gin.Context) {
	userIDStr := c.Param("userId")
	courseIDStr := c.Param("courseId")

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	courseID, err := strconv.Atoi(courseIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
		return
	}

	var enrollment Enrollment
	err = db.QueryRow("SELECT id, user_id, course_id, progress FROM enrollments WHERE user_id = $1 AND course_id = $2", userID, courseID).Scan(&enrollment.ID, &enrollment.UserID, &enrollment.CourseID, &enrollment.Progress)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Enrollment not found"})
		return
	}

	c.JSON(http.StatusOK, enrollment)
}
