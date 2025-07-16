terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "ecs" {
  source = "terraform-aws-modules/ecs/aws"
  cluster_name = var.cluster_name
  container_insights = true
}
