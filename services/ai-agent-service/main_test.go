package main

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/stretchr/testify/assert"
)

func TestMain(m *testing.M) {
	// Set up test environment
	os.Setenv("REDIS_URL", "localhost:6379")
	os.Setenv("LLM_SERVICE_URL", "http://localhost:8084")

	// Initialize Redis for testing (mock or skip if not available)
	rdb = redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
	})

	// Skip Redis connection in tests if not available
	if err := rdb.Ping(context.Background()).Err(); err != nil {
		rdb = nil
	}

	loadConstitutionalGovernor()

	code := m.Run()
	os.Exit(code)
}

func TestHealthCheck(t *testing.T) {
	r := gin.Default()
	r.GET("/health", healthCheck)

	req, _ := http.NewRequest("GET", "/health", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "ai-agent")
}

func TestValidatePlan(t *testing.T) {
	r := gin.Default()
	r.POST("/validate-plan", validatePlan)

	// Test valid plan
	validPlan := `{
		"id": "test-plan",
		"objective": "Test objective",
		"actions": [
			{
				"id": "action1",
				"type": "http_request",
				"description": "Make a test request",
				"parameters": {"url": "http://example.com"}
			}
		]
	}`
	req, _ := http.NewRequest("POST", "/validate-plan", bytes.NewBufferString(validPlan))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), `"valid":true`)

	// Test plan with violations - use a pattern that matches our rules
	invalidPlan := `{
		"id": "test-plan",
		"objective": "Test objective",
		"actions": [
			{
				"id": "action1",
				"type": "harmful_action",
				"description": "This action will harm the system",
				"parameters": {}
			}
		]
	}`
	req2, _ := http.NewRequest("POST", "/validate-plan", bytes.NewBufferString(invalidPlan))
	req2.Header.Set("Content-Type", "application/json")
	w2 := httptest.NewRecorder()
	r.ServeHTTP(w2, req2)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w2.Body.String(), `"valid":false`)
}

func TestExecuteAction(t *testing.T) {
	// Test HTTP request action
	action := &Action{
		ID:          "test-action",
		Type:        "http_request",
		Description: "Test HTTP request",
		Parameters: map[string]interface{}{
			"url":    "https://httpbin.org/get",
			"method": "GET",
		},
	}

	err := executeAction(action)
	assert.NoError(t, err)
	assert.NotNil(t, action.Result)

	result := action.Result.(map[string]interface{})
	assert.Contains(t, result, "status_code")
}

func TestConstitutionalGovernor(t *testing.T) {
	gov := &ConstitutionalGovernor{
		Rules: []SafetyRule{
			{
				ID:          "test-rule",
				Category:    "test",
				Description: "Test rule",
				Severity:    "high",
				Pattern:     "forbidden",
			},
		},
	}

	plan := &Plan{
		Actions: []Action{
			{
				Description: "This contains forbidden content",
			},
		},
	}

	violations := gov.ValidatePlan(plan)
	assert.Len(t, violations, 1)
	assert.Contains(t, violations[0], "test-rule")

	// Test clean plan
	cleanPlan := &Plan{
		Actions: []Action{
			{
				Description: "This is safe content",
			},
		},
	}

	cleanViolations := gov.ValidatePlan(cleanPlan)
	assert.Len(t, cleanViolations, 0)
}

func TestCreatePlan(t *testing.T) {
	// This test would require mocking the LLM service
	// For now, we'll skip it as it requires external dependencies
	t.Skip("Skipping createPlan test - requires LLM service mock")
}

func TestListPlans(t *testing.T) {
	// Skip test if Redis is not available
	if rdb == nil {
		t.Skip("Redis not available for testing")
	}

	// Setup test data if Redis is available
	testPlan := &Plan{
		ID:        "test-plan-123",
		Objective: "Test objective",
		Status:    "completed",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	planJSON, _ := json.Marshal(testPlan)
	rdb.Set(context.Background(), "plan:test-plan-123", planJSON, time.Hour)

	r := gin.Default()
	r.GET("/plans", listPlans)

	req, _ := http.NewRequest("GET", "/plans", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	// Cleanup
	rdb.Del(context.Background(), "plan:test-plan-123")
}