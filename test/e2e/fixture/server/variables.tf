variable "cloudflare_api_token" {
  description = "Cloudflare API token with Access and R2 permissions"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "workers_subdomain" {
  description = "Your workers.dev subdomain (e.g., 'myaccount' for myaccount.workers.dev)"
  type        = string
}

variable "test_run_id" {
  description = "Unique identifier for this test run (e.g., PR number or timestamp)"
  type        = string
  default     = "local"
}
