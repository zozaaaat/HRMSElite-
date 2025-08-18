# HRMS Elite Infrastructure Setup Guide

## Overview

This guide provides step-by-step instructions for setting up the complete infrastructure for the HRMS Elite microservices architecture, including Docker containers, Kubernetes clusters, and database systems.

## Prerequisites

### Required Software

1. **Docker Desktop** (v20.10+)
   ```bash
   # Download from https://www.docker.com/products/docker-desktop
   # Verify installation
   docker --version
   docker-compose --version
   ```

2. **Kubernetes CLI (kubectl)** (v1.25+)
   ```bash
   # macOS
   brew install kubectl
   
   # Windows
   choco install kubernetes-cli
   
   # Linux
   curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
   sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
   
   # Verify installation
   kubectl version --client
   ```

3. **Minikube** (for local development)
   ```bash
   # macOS
   brew install minikube
   
   # Windows
   choco install minikube
   
   # Linux
   curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
   sudo install minikube-linux-amd64 /usr/local/bin/minikube
   
   # Verify installation
   minikube version
   ```

4. **Helm** (v3.10+)
   ```bash
   # macOS
   brew install helm
   
   # Windows
   choco install kubernetes-helm
   
   # Linux
   curl https://get.helm.sh/helm-v3.10.0-linux-amd64.tar.gz | tar xz
   sudo mv linux-amd64/helm /usr/local/bin/
   
   # Verify installation
   helm version
   ```

## Local Development Setup

### 1. Docker Compose Setup

```bash
# Navigate to the deploy directory
cd deploy

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f auth-service
```

### 2. Database Initialization

```bash
# Wait for databases to be ready
sleep 30

# Initialize databases (if not using init scripts)
docker-compose exec postgres-auth psql -U hrmse_user -d auth_service_db -f /docker-entrypoint-initdb.d/init.sql
docker-compose exec postgres-company psql -U hrmse_user -d company_service_db -f /docker-entrypoint-initdb.d/init.sql
# ... repeat for other databases
```

### 3. Service Health Checks

```bash
# Check API Gateway
curl http://localhost:3000/health

# Check Auth Service
curl http://localhost:3001/health

# Check Company Service
curl http://localhost:3002/health

# Check Employee Service
curl http://localhost:3003/health

# Check Document Service
curl http://localhost:3004/health

# Check Notification Service
curl http://localhost:3005/health

# Check Analytics Service
curl http://localhost:3006/health
```

## Production Kubernetes Setup

### 1. Cluster Setup

#### Option A: Cloud Provider (Recommended)

**Google Cloud Platform (GKE)**:
```bash
# Create GKE cluster
gcloud container clusters create hrmse-cluster \
  --zone=us-central1-a \
  --num-nodes=3 \
  --machine-type=e2-standard-4 \
  --enable-autoscaling \
  --min-nodes=1 \
  --max-nodes=10

# Configure kubectl
gcloud container clusters get-credentials hrmse-cluster --zone=us-central1-a
```

**Amazon EKS**:
```bash
# Create EKS cluster
eksctl create cluster \
  --name hrmse-cluster \
  --region us-west-2 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 1 \
  --nodes-max 10 \
  --managed
```

**Azure AKS**:
```bash
# Create AKS cluster
az aks create \
  --resource-group hrmse-rg \
  --name hrmse-cluster \
  --node-count 3 \
  --enable-addons monitoring \
  --generate-ssh-keys

# Configure kubectl
az aks get-credentials --resource-group hrmse-rg --name hrmse-cluster
```

#### Option B: Local Development (Minikube)

```bash
# Start Minikube
minikube start --cpus=4 --memory=8192 --disk-size=20g

# Enable addons
minikube addons enable ingress
minikube addons enable metrics-server

# Configure kubectl
kubectl config use-context minikube
```

### 2. Namespace Setup

```bash
# Apply namespace configurations
kubectl apply -f kubernetes/namespaces.yaml

# Verify namespaces
kubectl get namespaces | grep hrmse
```

### 3. Database Setup

#### Option A: Managed Database Services

**Google Cloud SQL**:
```bash
# Create PostgreSQL instances for each service
gcloud sql instances create hrmse-auth-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1

gcloud sql instances create hrmse-company-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1

# ... repeat for other services
```

**Amazon RDS**:
```bash
# Create RDS instances
aws rds create-db-instance \
  --db-instance-identifier hrmse-auth-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username hrmse_user \
  --master-user-password secure_password \
  --allocated-storage 20
```

#### Option B: Self-Managed Databases in Kubernetes

```bash
# Install PostgreSQL operator (if using)
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install postgres-operator bitnami/postgresql-operator

# Deploy PostgreSQL instances
kubectl apply -f kubernetes/databases/
```

### 4. Secrets and ConfigMaps

```bash
# Create secrets (replace with actual values)
kubectl apply -f kubernetes/production/secrets.yaml

# Create config maps
kubectl apply -f kubernetes/production/configmaps.yaml

# Verify
kubectl get secrets -n hrmse-production
kubectl get configmaps -n hrmse-production
```

### 5. Service Deployments

```bash
# Deploy all services
kubectl apply -f kubernetes/production/deployments.yaml

# Check deployment status
kubectl get deployments -n hrmse-production

# Check pods
kubectl get pods -n hrmse-production

# Check services
kubectl get services -n hrmse-production
```

### 6. Ingress Setup

```bash
# Install NGINX Ingress Controller
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace

# Apply ingress configuration
kubectl apply -f kubernetes/production/ingress.yaml
```

### 7. Monitoring Setup

```bash
# Install Prometheus
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace

# Install Grafana
helm repo add grafana https://grafana.github.io/helm-charts
helm install grafana grafana/grafana \
  --namespace monitoring \
  --set adminPassword=admin

# Apply custom monitoring configurations
kubectl apply -f kubernetes/monitoring/
```

## CI/CD Pipeline Setup

### 1. GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Kubernetes

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ${{ secrets.REGISTRY }}
        username: ${{ secrets.REGISTRY_USERNAME }}
        password: ${{ secrets.REGISTRY_PASSWORD }}
    
    - name: Build and push Docker images
      run: |
        docker build -t ${{ secrets.REGISTRY }}/hrmse/auth-service:${{ github.sha }} ./server/microservices/auth-service
        docker build -t ${{ secrets.REGISTRY }}/hrmse/company-service:${{ github.sha }} ./server/microservices/company-service
        # ... repeat for other services
        docker push ${{ secrets.REGISTRY }}/hrmse/auth-service:${{ github.sha }}
        docker push ${{ secrets.REGISTRY }}/hrmse/company-service:${{ github.sha }}
        # ... repeat for other services
    
    - name: Deploy to Kubernetes
      run: |
        echo "${{ secrets.KUBECONFIG }}" | base64 -d > kubeconfig
        export KUBECONFIG=kubeconfig
        kubectl set image deployment/auth-service auth-service=${{ secrets.REGISTRY }}/hrmse/auth-service:${{ github.sha }} -n hrmse-production
        kubectl set image deployment/company-service company-service=${{ secrets.REGISTRY }}/hrmse/company-service:${{ github.sha }} -n hrmse-production
        # ... repeat for other services
```

### 2. ArgoCD Setup (Optional)

```bash
# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Get ArgoCD admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Port forward to access ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

## Security Setup

### 1. Network Policies

```bash
# Apply network policies
kubectl apply -f kubernetes/security/network-policies.yaml
```

### 2. RBAC Configuration

```bash
# Apply RBAC rules
kubectl apply -f kubernetes/security/rbac.yaml
```

### 3. Pod Security Policies

```bash
# Apply pod security policies
kubectl apply -f kubernetes/security/pod-security-policies.yaml
```

## Backup and Disaster Recovery

### 1. Database Backups

```bash
# Create backup cronjob
kubectl apply -f kubernetes/backup/backup-cronjob.yaml

# Manual backup
kubectl create job --from=cronjob/database-backup manual-backup -n hrmse-production
```

### 2. Application Data Backups

```bash
# Backup persistent volumes
kubectl apply -f kubernetes/backup/pv-backup.yaml
```

## Monitoring and Alerting

### 1. Prometheus Configuration

```bash
# Apply Prometheus configuration
kubectl apply -f kubernetes/monitoring/prometheus-config.yaml
```

### 2. Grafana Dashboards

```bash
# Apply Grafana dashboards
kubectl apply -f kubernetes/monitoring/grafana-dashboards.yaml
```

### 3. Alert Manager

```bash
# Apply alert rules
kubectl apply -f kubernetes/monitoring/alert-rules.yaml
```

## Troubleshooting

### Common Issues

1. **Pod Startup Issues**:
   ```bash
   # Check pod logs
   kubectl logs -f <pod-name> -n hrmse-production
   
   # Check pod events
   kubectl describe pod <pod-name> -n hrmse-production
   ```

2. **Database Connection Issues**:
   ```bash
   # Check database connectivity
   kubectl exec -it <pod-name> -n hrmse-production -- nc -zv <db-service> 5432
   ```

3. **Service Discovery Issues**:
   ```bash
   # Check service endpoints
   kubectl get endpoints -n hrmse-production
   
   # Test service connectivity
   kubectl exec -it <pod-name> -n hrmse-production -- curl <service-name>:<port>/health
   ```

### Performance Tuning

1. **Resource Optimization**:
   ```bash
   # Check resource usage
   kubectl top pods -n hrmse-production
   kubectl top nodes
   ```

2. **Scaling**:
   ```bash
   # Scale services based on load
   kubectl scale deployment auth-service --replicas=5 -n hrmse-production
   ```

## Maintenance

### Regular Tasks

1. **Update Images**:
   ```bash
   # Update to latest images
   kubectl set image deployment/auth-service auth-service=hrmse/auth-service:latest -n hrmse-production
   ```

2. **Database Maintenance**:
   ```bash
   # Run database maintenance
   kubectl create job --from=cronjob/db-maintenance manual-maintenance -n hrmse-production
   ```

3. **Log Rotation**:
   ```bash
   # Check log sizes
   kubectl exec -it <pod-name> -n hrmse-production -- du -sh /app/logs
   ```

## Conclusion

This infrastructure setup provides a robust, scalable, and maintainable foundation for the HRMS Elite microservices architecture. The setup includes:

- **Containerization** with Docker for consistent deployments
- **Orchestration** with Kubernetes for scalability and reliability
- **Database per Service** pattern for data isolation
- **Monitoring and Alerting** for operational visibility
- **Security** measures for production readiness
- **Backup and Recovery** for data protection
- **CI/CD** pipeline for automated deployments

Follow this guide step-by-step to set up your complete infrastructure, and refer to the troubleshooting section for common issues and solutions.
