resource "google_container_cluster" "azora_gke" {
  name     = "azora-gke"
  location = var.region

  initial_node_count = 1

  node_config {
    machine_type = "e2-medium"
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ]
  }
}

variable "region" {
  description = "GCP region"
  type        = string
}