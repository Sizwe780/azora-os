package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

type Course struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	InstructorID int    `json:"instructor_id"`
}

var db *sql.DB

func main() {
	initDB()
	defer db.Close()

	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	r.GET("/courses", getCourses)
	r.POST("/courses", createCourse)

	log.Println("Course Service starting on :8082")
	r.Run(":8082")
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

	// Create courses table if not exists
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS courses (
		id SERIAL PRIMARY KEY,
		title VARCHAR(255) NOT NULL,
		description TEXT,
		instructor_id INTEGER NOT NULL
	)`)
	if err != nil {
		log.Fatal(err)
	}
}

func getCourses(c *gin.Context) {
	rows, err := db.Query("SELECT id, title, description, instructor_id FROM courses")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch courses"})
		return
	}
	defer rows.Close()

	var courses []Course
	for rows.Next() {
		var course Course
		if err := rows.Scan(&course.ID, &course.Title, &course.Description, &course.InstructorID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan course"})
			return
		}
		courses = append(courses, course)
	}

	c.JSON(http.StatusOK, courses)
}

func createCourse(c *gin.Context) {
	var course Course
	if err := c.ShouldBindJSON(&course); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := db.Exec("INSERT INTO courses (title, description, instructor_id) VALUES ($1, $2, $3)", course.Title, course.Description, course.InstructorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create course"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Course created successfully"})
}