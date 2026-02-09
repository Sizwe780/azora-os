/**
 * Deployment Service
 * Handles deployments to Kubernetes and Vercel
 */

import { runCommand } from './command-runner';

export interface DeploymentConfig {
  target: 'kubernetes' | 'vercel' | 'docker';
  service?: string;
  namespace?: string;
  image?: string;
  environment?: Record<string, string>;
}

export interface DeploymentResult {
  success: boolean;
  deploymentId?: string;
  url?: string;
  message?: string;
  error?: string;
  duration: number;
}

/**
 * Deploy to Kubernetes using kubectl
 */
export async function deployToKubernetes(
  config: DeploymentConfig
): Promise<DeploymentResult> {
  const startTime = Date.now();

  try {
    if (!config.service || !config.namespace) {
      throw new Error('Service and namespace required for Kubernetes deployment');
    }

    // Check if kubectl is available
    const checkResult = await runCommand({
      type: 'shell',
      command: 'kubectl version --short',
      timeout: 10000,
    });

    if (!checkResult.success) {
      throw new Error('kubectl not available or not configured');
    }

    // Get current deployment
    const getResult = await runCommand({
      type: 'shell',
      command: `kubectl get deployment ${config.service} -n ${config.namespace} -o json`,
      timeout: 10000,
    });

    if (!getResult.success) {
      // Deployment doesn't exist, create it
      return createKubernetesDeployment(config, startTime);
    }

    // Update existing deployment
    const rolloutResult = await runCommand({
      type: 'shell',
      command: `kubectl rollout status deployment/${config.service} -n ${config.namespace} --timeout=300s`,
      timeout: 300000,
    });

    if (!rolloutResult.success) {
      throw new Error(`Rollout failed: ${rolloutResult.error}`);
    }

    return {
      success: true,
      deploymentId: `k8s-${config.service}-${config.namespace}`,
      message: `Deployment ${config.service} rolled out successfully`,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Deploy to Vercel
 */
export async function deployToVercel(
  config: DeploymentConfig
): Promise<DeploymentResult> {
  const startTime = Date.now();

  try {
    if (!process.env.VERCEL_TOKEN) {
      throw new Error('VERCEL_TOKEN environment variable not set');
    }

    // Use Vercel CLI via subprocess
    const deployResult = await runCommand({
      type: 'shell',
      command: `vercel --prod --token ${process.env.VERCEL_TOKEN}`,
      env: {
        VERCEL_ORG_ID: process.env.VERCEL_ORG_ID || '',
        VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID || '',
      },
      timeout: 300000, // 5 minutes for deployment
    });

    if (!deployResult.success) {
      throw new Error(`Vercel deployment failed: ${deployResult.error}`);
    }

    // Extract deployment URL from output
    const urlMatch = deployResult.output?.match(
      /https:\/\/[^\s]+/
    );
    const url = urlMatch ? urlMatch[0] : undefined;

    return {
      success: true,
      deploymentId: `vercel-${Date.now()}`,
      url,
      message: 'Deployment to Vercel completed successfully',
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Build and push Docker image
 */
export async function deployDocker(
  config: DeploymentConfig
): Promise<DeploymentResult> {
  const startTime = Date.now();

  try {
    if (!config.image) {
      throw new Error('Docker image required');
    }

    // Build image
    const buildResult = await runCommand({
      type: 'shell',
      command: `docker build -t ${config.image} .`,
      timeout: 600000, // 10 minutes
    });

    if (!buildResult.success) {
      throw new Error(`Docker build failed: ${buildResult.error}`);
    }

    // Push image
    const pushResult = await runCommand({
      type: 'shell',
      command: `docker push ${config.image}`,
      timeout: 300000, // 5 minutes
    });

    if (!pushResult.success) {
      throw new Error(`Docker push failed: ${pushResult.error}`);
    }

    return {
      success: true,
      deploymentId: `docker-${config.image}-${Date.now()}`,
      message: `Docker image ${config.image} built and pushed successfully`,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Helper to create Kubernetes deployment
 */
async function createKubernetesDeployment(
  config: DeploymentConfig,
  startTime: number
): Promise<DeploymentResult> {
  try {
    if (!config.image) {
      throw new Error('Image required to create new deployment');
    }

    const yaml = `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${config.service}
  namespace: ${config.namespace}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${config.service}
  template:
    metadata:
      labels:
        app: ${config.service}
    spec:
      containers:
      - name: ${config.service}
        image: ${config.image}
        ports:
        - containerPort: 3000
    `;

    const result = await runCommand({
      type: 'shell',
      command: `kubectl apply -f - <<EOF\n${yaml}\nEOF`,
      timeout: 30000,
    });

    if (!result.success) {
      throw new Error(`Failed to create deployment: ${result.error}`);
    }

    return {
      success: true,
      deploymentId: `k8s-new-${config.service}-${config.namespace}`,
      message: `Deployment ${config.service} created successfully`,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Main deploy router
 */
export async function deploy(
  config: DeploymentConfig
): Promise<DeploymentResult> {
  console.log(`[Deployment] Deploying to ${config.target}:`, config);

  switch (config.target) {
    case 'kubernetes':
      return deployToKubernetes(config);
    case 'vercel':
      return deployToVercel(config);
    case 'docker':
      return deployDocker(config);
    default:
      return {
        success: false,
        error: `Unknown deployment target: ${config.target}`,
        duration: 0,
      };
  }
}
