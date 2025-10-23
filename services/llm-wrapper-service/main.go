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
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
)

type LLMProvider interface {
	GenerateCompletion(prompt string, params map[string]interface{}) (string, error)
	CreateEmbedding(text string) ([]float64, error)
}

type OpenAIProvider struct {
	apiKey string
}

func (p *OpenAIProvider) GenerateCompletion(prompt string, params map[string]interface{}) (string, error) {
	url := "https://api.openai.com/v1/chat/completions"
	
	requestBody := map[string]interface{}{
		"model": "gpt-4",
		"messages": []map[string]string{
			{"role": "user", "content": prompt},
		},
		"max_tokens": 1000,
	}
	
	// Merge custom params
	for k, v := range params {
		requestBody[k] = v
	}
	
	jsonData, _ := json.Marshal(requestBody)
	
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}
	
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+p.apiKey)
	
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}
	
	if resp.StatusCode != 200 {
		return "", fmt.Errorf("OpenAI API error: %s", string(body))
	}
	
	var response struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	
	if err := json.Unmarshal(body, &response); err != nil {
		return "", err
	}
	
	if len(response.Choices) > 0 {
		return response.Choices[0].Message.Content, nil
	}
	
	return "", fmt.Errorf("no response from OpenAI")
}

func (p *OpenAIProvider) CreateEmbedding(text string) ([]float64, error) {
	url := "https://api.openai.com/v1/embeddings"
	
	requestBody := map[string]interface{}{
		"model": "text-embedding-ada-002",
		"input": text,
	}
	
	jsonData, _ := json.Marshal(requestBody)
	
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}
	
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+p.apiKey)
	
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	
	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("OpenAI API error: %s", string(body))
	}
	
	var response struct {
		Data []struct {
			Embedding []float64 `json:"embedding"`
		} `json:"data"`
	}
	
	if err := json.Unmarshal(body, &response); err != nil {
		return nil, err
	}
	
	if len(response.Data) > 0 {
		return response.Data[0].Embedding, nil
	}
	
	return nil, fmt.Errorf("no embedding from OpenAI")
}

var provider LLMProvider
var rdb *redis.Client

func main() {
	initRedis()
	
	// Initialize provider based on env
	providerType := os.Getenv("LLM_PROVIDER")
	switch providerType {
	case "openai":
		provider = &OpenAIProvider{apiKey: os.Getenv("OPENAI_API_KEY")}
	default:
		log.Fatal("Unsupported LLM provider")
	}
	
	r := gin.Default()
	
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})
	
	r.POST("/generate", generateCompletion)
	r.POST("/embed", createEmbedding)
	r.POST("/validate-plan", validatePlan)
	
	log.Println("LLM Wrapper Service starting on :8084")
	r.Run(":8084")
}

func initRedis() {
	rdb = redis.NewClient(&redis.Options{
		Addr: os.Getenv("REDIS_URL"),
	})
	if err := rdb.Ping(context.Background()).Err(); err != nil {
		log.Fatal(err)
	}
}

func generateCompletion(c *gin.Context) {
	var req struct {
		Prompt string                 `json:"prompt"`
		Params map[string]interface{} `json:"params"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Log request for monitoring
	logEntry := map[string]interface{}{
		"timestamp": time.Now().Unix(),
		"type":      "completion_request",
		"prompt":    req.Prompt,
	}
	logData, _ := json.Marshal(logEntry)
	rdb.LPush(context.Background(), "llm_logs", logData)
	
	response, err := provider.GenerateCompletion(req.Prompt, req.Params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	// Log response
	logEntry["response"] = response
	logData, _ = json.Marshal(logEntry)
	rdb.LPush(context.Background(), "llm_logs", logData)
	
	c.JSON(http.StatusOK, gin.H{"response": response})
}

func createEmbedding(c *gin.Context) {
	var req struct {
		Text string `json:"text"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	embedding, err := provider.CreateEmbedding(req.Text)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"embedding": embedding})
}

func validatePlan(c *gin.Context) {
	var req struct {
		Plan map[string]interface{} `json:"plan"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Basic validation - in real implementation, this would check against constitutional rules
	// For now, just ensure plan has required fields
	if _, hasActions := req.Plan["actions"]; !hasActions {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Plan must contain actions"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"valid": true, "message": "Plan validated"})
}