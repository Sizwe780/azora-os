package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/segmentio/kafka-go"
)

type AnalyticsEvent struct {
	ID        string                 `json:"id"`
	Type      string                 `json:"type"`
	Timestamp time.Time              `json:"timestamp"`
	Service   string                 `json:"service"`
	UserID    string                 `json:"user_id,omitempty"`
	SessionID string                 `json:"session_id,omitempty"`
	Data      map[string]interface{} `json:"data"`
}

type AnalyticsQuery struct {
	StartTime   time.Time `json:"start_time"`
	EndTime     time.Time `json:"end_time"`
	EventType   string    `json:"event_type,omitempty"`
	Service     string    `json:"service,omitempty"`
	UserID      string    `json:"user_id,omitempty"`
	Aggregation string    `json:"aggregation"` // count, sum, avg
	Field       string    `json:"field,omitempty"`
}

type AnalyticsResult struct {
	Query     AnalyticsQuery       `json:"query"`
	Results   []map[string]interface{} `json:"results"`
	Total     int                   `json:"total"`
	Processed int                   `json:"processed"`
}

var (
	rdb         *redis.Client
	kafkaWriter *kafka.Writer
	kafkaReader *kafka.Reader
)

func main() {
	initRedis()
	initKafka()

	r := gin.Default()

	r.GET("/health", healthCheck)
	r.POST("/events", ingestEvent)
	r.POST("/query", queryAnalytics)
	r.GET("/metrics", getMetrics)
	r.GET("/realtime", getRealtimeStream)

	log.Println("Analytics Service starting on :8086")
	r.Run(":8086")
}

func initRedis() {
	rdb = redis.NewClient(&redis.Options{
		Addr: os.Getenv("REDIS_URL"),
	})
	if err := rdb.Ping(context.Background()).Err(); err != nil {
		log.Fatal("Failed to connect to Redis:", err)
	}
}

func initKafka() {
	kafkaBrokers := os.Getenv("KAFKA_BROKERS")
	if kafkaBrokers == "" {
		kafkaBrokers = "kafka:9092"
	}

	kafkaWriter = &kafka.Writer{
		Addr:     kafka.TCP(kafkaBrokers),
		Topic:    "analytics-events",
		Balancer: &kafka.LeastBytes{},
	}

	kafkaReader = kafka.NewReader(kafka.ReaderConfig{
		Brokers:   []string{kafkaBrokers},
		Topic:     "analytics-events",
		GroupID:   "analytics-service",
		MinBytes:  10e3, // 10KB
		MaxBytes:  10e6, // 10MB
	})

	// Start background consumer
	go consumeEvents()
}

func consumeEvents() {
	for {
		m, err := kafkaReader.ReadMessage(context.Background())
		if err != nil {
			log.Printf("Error reading Kafka message: %v", err)
			continue
		}

		var event AnalyticsEvent
		if err := json.Unmarshal(m.Value, &event); err != nil {
			log.Printf("Error unmarshaling event: %v", err)
			continue
		}

		// Store in Redis for real-time analytics
		eventKey := fmt.Sprintf("event:%s", event.ID)
		eventJSON, _ := json.Marshal(event)
		rdb.Set(context.Background(), eventKey, eventJSON, 24*time.Hour)

		// Update aggregations
		updateAggregations(&event)

		// Index by time for queries
		timeKey := fmt.Sprintf("events:%s:%d", event.Type, event.Timestamp.Unix()/3600) // Hourly buckets
		rdb.SAdd(context.Background(), timeKey, event.ID)

		log.Printf("Processed event: %s (%s)", event.ID, event.Type)
	}
}

func updateAggregations(event *AnalyticsEvent) {
	// Update counters
	counterKey := fmt.Sprintf("counter:%s:%s", event.Type, event.Service)
	rdb.Incr(context.Background(), counterKey)

	// Update hourly metrics
	hourKey := fmt.Sprintf("metrics:hourly:%d", event.Timestamp.Unix()/3600)
	rdb.HIncrBy(context.Background(), hourKey, event.Type, 1)

	// Update service metrics
	serviceKey := fmt.Sprintf("metrics:service:%s", event.Service)
	rdb.HIncrBy(context.Background(), serviceKey, event.Type, 1)

	// Update user metrics if user_id present
	if event.UserID != "" {
		userKey := fmt.Sprintf("metrics:user:%s", event.UserID)
		rdb.HIncrBy(context.Background(), userKey, event.Type, 1)
	}
}

func healthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "analytics"})
}

func ingestEvent(c *gin.Context) {
	var event AnalyticsEvent
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set defaults
	if event.ID == "" {
		event.ID = fmt.Sprintf("%d", time.Now().UnixNano())
	}
	if event.Timestamp.IsZero() {
		event.Timestamp = time.Now()
	}

	// Send to Kafka
	eventJSON, err := json.Marshal(event)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal event"})
		return
	}

	err = kafkaWriter.WriteMessages(context.Background(),
		kafka.Message{
			Key:   []byte(event.ID),
			Value: eventJSON,
		},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write to Kafka"})
		return
	}

	c.JSON(http.StatusAccepted, gin.H{"status": "ingested", "event_id": event.ID})
}

func queryAnalytics(c *gin.Context) {
	var query AnalyticsQuery
	if err := c.ShouldBindJSON(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set default time range if not provided
	if query.StartTime.IsZero() {
		query.StartTime = time.Now().Add(-24 * time.Hour)
	}
	if query.EndTime.IsZero() {
		query.EndTime = time.Now()
	}

	results, err := executeQuery(&query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Query execution failed: " + err.Error()})
		return
	}

	response := AnalyticsResult{
		Query:     query,
		Results:   results,
		Total:     len(results),
		Processed: len(results),
	}

	c.JSON(http.StatusOK, response)
}

func executeQuery(query *AnalyticsQuery) ([]map[string]interface{}, error) {
	switch query.Aggregation {
	case "count":
		return executeCountQuery(query)
	case "sum":
		return executeSumQuery(query)
	case "avg":
		return executeAvgQuery(query)
	default:
		return nil, fmt.Errorf("unsupported aggregation: %s", query.Aggregation)
	}
}

func executeCountQuery(query *AnalyticsQuery) ([]map[string]interface{}, error) {
	var results []map[string]interface{}

	// Get hourly buckets in range
	startHour := query.StartTime.Unix() / 3600
	endHour := query.EndTime.Unix() / 3600

	for hour := startHour; hour <= endHour; hour++ {
		timeKey := fmt.Sprintf("events:%s:%d", query.EventType, hour)
		if query.EventType == "" {
			timeKey = fmt.Sprintf("events:*:%d", hour)
		}

		// This is a simplified implementation
		// In a real system, you'd use Redis SCAN or a proper time-series database
		keys, err := rdb.Keys(context.Background(), timeKey).Result()
		if err != nil {
			continue
		}

		count := 0
		for _, key := range keys {
			members, err := rdb.SCard(context.Background(), key).Result()
			if err != nil {
				continue
			}
			count += int(members)
		}

		if count > 0 {
			results = append(results, map[string]interface{}{
				"timestamp": time.Unix(hour*3600, 0).Format(time.RFC3339),
				"count":     count,
			})
		}
	}

	return results, nil
}

func executeSumQuery(query *AnalyticsQuery) ([]map[string]interface{}, error) {
	// Simplified implementation - would aggregate numeric fields
	return []map[string]interface{}{
		{"message": "Sum aggregation not fully implemented"},
	}, nil
}

func executeAvgQuery(query *AnalyticsQuery) ([]map[string]interface{}, error) {
	// Simplified implementation - would calculate averages
	return []map[string]interface{}{
		{"message": "Average aggregation not fully implemented"},
	}, nil
}

func getMetrics(c *gin.Context) {
	eventType := c.Query("event_type")
	service := c.Query("service")

	var metrics map[string]interface{}

	if eventType != "" && service != "" {
		key := fmt.Sprintf("counter:%s:%s", eventType, service)
		count, _ := rdb.Get(context.Background(), key).Int()
		metrics = map[string]interface{}{
			"event_type": eventType,
			"service":    service,
			"count":      count,
		}
	} else {
		// Get all counters
		metrics = make(map[string]interface{})
		keys, _ := rdb.Keys(context.Background(), "counter:*").Result()
		for _, key := range keys {
			count, _ := rdb.Get(context.Background(), key).Int()
			metrics[key] = count
		}
	}

	c.JSON(http.StatusOK, metrics)
}

func getRealtimeStream(c *gin.Context) {
	// Set headers for SSE
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")

	// Simple implementation - in production, use WebSocket or proper SSE
	c.JSON(http.StatusOK, gin.H{"message": "Real-time streaming endpoint - use WebSocket for full implementation"})
}