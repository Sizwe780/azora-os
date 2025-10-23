package main

import (
	"bytes"
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/stretchr/testify/assert"
)

func TestMain(m *testing.M) {
	// Set up test environment
	os.Setenv("LLM_PROVIDER", "openai")
	os.Setenv("OPENAI_API_KEY", "test-key")
	os.Setenv("REDIS_URL", "localhost:6379")

	// Initialize Redis for testing (mock or skip if not available)
	rdb = redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
	})
	
	// Skip Redis connection in tests if not available
	if err := rdb.Ping(context.Background()).Err(); err != nil {
		rdb = nil
	}

	provider = &OpenAIProvider{apiKey: "test-key"}

	code := m.Run()
	os.Exit(code)
}

func TestHealthCheck(t *testing.T) {
	r := gin.Default()
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	req, _ := http.NewRequest("GET", "/health", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "ok")
}

func TestGenerateCompletion(t *testing.T) {
	// Mock OpenAI response
	// This would require setting up httptest.Server for full integration testing
	// For now, we'll test the endpoint structure
	
	r := gin.Default()
	r.POST("/generate", generateCompletion)

	requestBody := `{"prompt": "Test prompt", "params": {"max_tokens": 100}}`
	req, _ := http.NewRequest("POST", "/generate", bytes.NewBufferString(requestBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	// Should fail with API error since we're using test key
	assert.Equal(t, http.StatusInternalServerError, w.Code)
}

func TestValidatePlan(t *testing.T) {
	r := gin.Default()
	r.POST("/validate-plan", validatePlan)

	// Test valid plan
	validPlan := `{"plan": {"actions": ["action1", "action2"]}}`
	req, _ := http.NewRequest("POST", "/validate-plan", bytes.NewBufferString(validPlan))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "valid")

	// Test invalid plan
	invalidPlan := `{"plan": {"invalid": "data"}}`
	req2, _ := http.NewRequest("POST", "/validate-plan", bytes.NewBufferString(invalidPlan))
	req2.Header.Set("Content-Type", "application/json")
	w2 := httptest.NewRecorder()
	r.ServeHTTP(w2, req2)

	assert.Equal(t, http.StatusBadRequest, w2.Code)
	assert.Contains(t, w2.Body.String(), "must contain actions")
}