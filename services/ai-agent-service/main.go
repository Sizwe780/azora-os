package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
)

type Plan struct {
	ID          string                 `json:"id"`
	Objective   string                 `json:"objective"`
	Actions     []Action               `json:"actions"`
	Status      string                 `json:"status"` // pending, executing, completed, failed
	CreatedAt   time.Time              `json:"created_at"`
	UpdatedAt   time.Time              `json:"updated_at"`
	Metadata    map[string]interface{} `json:"metadata"`
}

type Action struct {
	ID          string                 `json:"id"`
	Type        string                 `json:"type"`
	Description string                 `json:"description"`
	Parameters  map[string]interface{} `json:"parameters"`
	Status      string                 `json:"status"` // pending, executing, completed, failed
	Result      interface{}            `json:"result,omitempty"`
	Error       string                 `json:"error,omitempty"`
}

type ConstitutionalGovernor struct {
	Rules []SafetyRule `json:"rules"`
}

type SafetyRule struct {
	ID          string `json:"id"`
	Category    string `json:"category"` // ethical, legal, technical, operational
	Description string `json:"description"`
	Severity    string `json:"severity"` // critical, high, medium, low
	Pattern     string `json:"pattern"`  // regex pattern to match against
}

type AgentRequest struct {
	Objective string                 `json:"objective"`
	Context   map[string]interface{} `json:"context,omitempty"`
}

type AgentResponse struct {
	PlanID    string `json:"plan_id"`
	Status    string `json:"status"`
	Message   string `json:"message"`
	Plan      *Plan  `json:"plan,omitempty"`
}

var (
	rdb         *redis.Client
	governor    *ConstitutionalGovernor
	llmServiceURL string
)

func main() {
	initRedis()
	loadConstitutionalGovernor()
	llmServiceURL = os.Getenv("LLM_SERVICE_URL")

	if llmServiceURL == "" {
		llmServiceURL = "http://llm-wrapper-service:8084"
	}

	r := gin.Default()

	r.GET("/health", healthCheck)
	r.POST("/execute", executeTask)
	r.GET("/plans/:id", getPlan)
	r.GET("/plans", listPlans)
	r.POST("/validate-plan", validatePlan)

	log.Println("AI Agent Service starting on :8085")
	r.Run(":8085")
}

func initRedis() {
	rdb = redis.NewClient(&redis.Options{
		Addr: os.Getenv("REDIS_URL"),
	})
	if err := rdb.Ping(context.Background()).Err(); err != nil {
		log.Fatal("Failed to connect to Redis:", err)
	}
}

func loadConstitutionalGovernor() {
	governor = &ConstitutionalGovernor{
		Rules: []SafetyRule{
			{
				ID:          "no-harm",
				Category:    "ethical",
				Description: "Prevent actions that could cause harm to users or systems",
				Severity:    "critical",
				Pattern:     "(?i)(harm|damage|destroy|delete.*all|wipe.*data)",
			},
			{
				ID:          "no-illegal",
				Category:    "legal",
				Description: "Prevent illegal activities",
				Severity:    "critical",
				Pattern:     "(?i)(hack|exploit|illegal|fraud|scam)",
			},
			{
				ID:          "data-privacy",
				Category:    "legal",
				Description: "Protect user data privacy",
				Severity:    "high",
				Pattern:     "(?i)(expose.*data|leak.*information|share.*personal)",
			},
			{
				ID:          "system-limits",
				Category:    "technical",
				Description: "Prevent system resource exhaustion",
				Severity:    "medium",
				Pattern:     "(?i)(infinite.*loop|endless.*process|unlimited.*resources)",
			},
		},
	}
}

func healthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "ai-agent"})
}

func executeTask(c *gin.Context) {
	var req AgentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create plan using LLM
	plan, err := createPlan(req.Objective, req.Context)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create plan: " + err.Error()})
		return
	}

	// Validate plan against constitutional rules
	if violations := governor.ValidatePlan(plan); len(violations) > 0 {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Plan violates constitutional rules",
			"violations": violations,
		})
		return
	}

	// Store plan
	planJSON, _ := json.Marshal(plan)
	rdb.Set(context.Background(), "plan:"+plan.ID, planJSON, 24*time.Hour)

	// Start execution asynchronously
	go executePlan(plan)

	response := AgentResponse{
		PlanID:  plan.ID,
		Status:  "executing",
		Message: "Plan created and execution started",
		Plan:    plan,
	}

	c.JSON(http.StatusAccepted, response)
}

func createPlan(objective string, context map[string]interface{}) (*Plan, error) {
	prompt := fmt.Sprintf(`Create a detailed execution plan for the following objective. Break it down into specific, actionable steps.

Objective: %s

Context: %v

Provide the plan as a JSON object with the following structure:
{
  "objective": "restated objective",
  "actions": [
    {
      "type": "action_type",
      "description": "detailed description of what to do",
      "parameters": {
        "key": "value"
      }
    }
  ]
}

Make each action specific and executable.`, objective, context)

	llmReq := map[string]interface{}{
		"prompt": prompt,
		"params": map[string]interface{}{
			"max_tokens": 1000,
			"temperature": 0.3,
		},
	}

	llmResp, err := callLLMService("/generate", llmReq)
	if err != nil {
		return nil, err
	}

	var planData struct {
		Objective string `json:"objective"`
		Actions   []struct {
			Type        string                 `json:"type"`
			Description string                 `json:"description"`
			Parameters  map[string]interface{} `json:"parameters"`
		} `json:"actions"`
	}

	if err := json.Unmarshal([]byte(llmResp["response"].(string)), &planData); err != nil {
		return nil, fmt.Errorf("failed to parse LLM response: %v", err)
	}

	plan := &Plan{
		ID:        uuid.New().String(),
		Objective: planData.Objective,
		Status:    "pending",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		Metadata:  context,
	}

	for _, actionData := range planData.Actions {
		action := Action{
			ID:          uuid.New().String(),
			Type:        actionData.Type,
			Description: actionData.Description,
			Parameters:  actionData.Parameters,
			Status:      "pending",
		}
		plan.Actions = append(plan.Actions, action)
	}

	return plan, nil
}

func (g *ConstitutionalGovernor) ValidatePlan(plan *Plan) []string {
	var violations []string

	for _, action := range plan.Actions {
		for _, rule := range g.Rules {
			matched, err := regexp.MatchString(rule.Pattern, strings.ToLower(action.Description))
			if err != nil {
				log.Printf("Invalid regex pattern %s: %v", rule.Pattern, err)
				continue
			}
			if matched {
				violations = append(violations, fmt.Sprintf("Rule %s (%s): %s", rule.ID, rule.Severity, rule.Description))
			}

			// Also check parameters
			paramStr := strings.ToLower(fmt.Sprintf("%v", action.Parameters))
			matched, err = regexp.MatchString(rule.Pattern, paramStr)
			if err != nil {
				continue
			}
			if matched {
				violations = append(violations, fmt.Sprintf("Rule %s (%s): %s", rule.ID, rule.Severity, rule.Description))
			}
		}
	}

	return violations
}

func executePlan(plan *Plan) {
	plan.Status = "executing"
	updatePlan(plan)

	for i := range plan.Actions {
		action := &plan.Actions[i]
		action.Status = "executing"
		updatePlan(plan)

		// Execute action based on type
		err := executeAction(action)
		if err != nil {
			action.Status = "failed"
			action.Error = err.Error()
			plan.Status = "failed"
			updatePlan(plan)
			return
		}

		action.Status = "completed"
		updatePlan(plan)
	}

	plan.Status = "completed"
	updatePlan(plan)
}

func executeAction(action *Action) error {
	// This is a simplified execution engine
	// In a real implementation, this would integrate with various services
	switch action.Type {
	case "http_request":
		return executeHTTPRequest(action)
	case "database_query":
		return executeDatabaseQuery(action)
	case "file_operation":
		return executeFileOperation(action)
	case "llm_call":
		return executeLLMCall(action)
	default:
		return fmt.Errorf("unsupported action type: %s", action.Type)
	}
}

func executeHTTPRequest(action *Action) error {
	url, ok := action.Parameters["url"].(string)
	if !ok {
		return fmt.Errorf("missing url parameter")
	}

	method := "GET"
	if m, ok := action.Parameters["method"].(string); ok {
		method = m
	}

	req, err := http.NewRequest(method, url, nil)
	if err != nil {
		return err
	}

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	action.Result = map[string]interface{}{
		"status_code": resp.StatusCode,
		"body":        string(body),
	}

	return nil
}

func executeDatabaseQuery(action *Action) error {
	// Placeholder for database operations
	action.Result = map[string]interface{}{
		"message": "Database query executed (placeholder)",
	}
	return nil
}

func executeFileOperation(action *Action) error {
	// Placeholder for file operations
	action.Result = map[string]interface{}{
		"message": "File operation executed (placeholder)",
	}
	return nil
}

func executeLLMCall(action *Action) error {
	prompt, ok := action.Parameters["prompt"].(string)
	if !ok {
		return fmt.Errorf("missing prompt parameter")
	}

	llmReq := map[string]interface{}{
		"prompt": prompt,
		"params": action.Parameters,
	}

	result, err := callLLMService("/generate", llmReq)
	if err != nil {
		return err
	}

	action.Result = result
	return nil
}

func callLLMService(endpoint string, payload interface{}) (map[string]interface{}, error) {
	jsonData, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	url := llmServiceURL + endpoint
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("LLM service error: %s", string(body))
	}

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}

	return result, nil
}

func updatePlan(plan *Plan) {
	plan.UpdatedAt = time.Now()
	planJSON, _ := json.Marshal(plan)
	rdb.Set(context.Background(), "plan:"+plan.ID, planJSON, 24*time.Hour)
}

func getPlan(c *gin.Context) {
	planID := c.Param("id")

	planJSON, err := rdb.Get(context.Background(), "plan:"+planID).Result()
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Plan not found"})
		return
	}

	var plan Plan
	if err := json.Unmarshal([]byte(planJSON), &plan); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse plan"})
		return
	}

	c.JSON(http.StatusOK, plan)
}

func listPlans(c *gin.Context) {
	keys, err := rdb.Keys(context.Background(), "plan:*").Result()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list plans"})
		return
	}

	var plans []Plan
	for _, key := range keys {
		planJSON, err := rdb.Get(context.Background(), key).Result()
		if err != nil {
			continue
		}

		var plan Plan
		if err := json.Unmarshal([]byte(planJSON), &plan); err != nil {
			continue
		}
		plans = append(plans, plan)
	}

	c.JSON(http.StatusOK, gin.H{"plans": plans})
}

func validatePlan(c *gin.Context) {
	var plan Plan
	if err := c.ShouldBindJSON(&plan); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	violations := governor.ValidatePlan(&plan)

	if len(violations) > 0 {
		c.JSON(http.StatusOK, gin.H{
			"valid": false,
			"violations": violations,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"valid": true})
}