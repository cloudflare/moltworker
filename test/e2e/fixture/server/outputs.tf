output "worker_url" {
  description = "URL of the deployed e2e worker"
  value       = "https://moltbot-sandbox-e2e-${var.test_run_id}.${var.workers_subdomain}.workers.dev"
}

output "worker_name" {
  description = "Name of the deployed worker"
  value       = "moltbot-sandbox-e2e-${var.test_run_id}"
}

output "service_token_id" {
  description = "Service token ID (for creating Access policies)"
  value       = cloudflare_zero_trust_access_service_token.e2e.id
}

output "service_token_client_id" {
  description = "Service token Client ID for authentication"
  value       = cloudflare_zero_trust_access_service_token.e2e.client_id
}

output "service_token_client_secret" {
  description = "Service token Client Secret for authentication"
  value       = cloudflare_zero_trust_access_service_token.e2e.client_secret
  sensitive   = true
}

output "r2_bucket_name" {
  description = "Name of the R2 bucket for this e2e test run"
  value       = cloudflare_r2_bucket.e2e.name
}
