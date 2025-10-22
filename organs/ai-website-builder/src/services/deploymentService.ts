/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import fs from 'fs-extra';
import path from 'path';
import archiver from 'archiver';
import { WebsiteDeployment, WebsiteGeneration } from '../models/Website';
import { customMetrics } from '../middleware/metrics';
import logger from '../utils/logger';

const DEPLOYMENT_DIR = path.join(process.cwd(), 'deployments');
const SITES_DIR = path.join(DEPLOYMENT_DIR, 'sites');

/**
 * Deploy a website to the hosting platform
 */
export async function deployWebsite(deploymentId: string): Promise<void> {
  try {
    const deployment = await WebsiteDeployment.findById(deploymentId);
    if (!deployment) {
      throw new Error('Deployment not found');
    }

    // Update status to deploying
    deployment.status = 'deploying';
    deployment.buildLogs = ['Starting deployment...'];
    await deployment.save();

    const website = await WebsiteGeneration.findById(deployment.websiteId);
    if (!website || website.status !== 'completed') {
      throw new Error('Website not found or not ready for deployment');
    }

    // Create deployment directory
    const siteDir = path.join(SITES_DIR, deployment.subdomain);
    await fs.ensureDir(siteDir);

    deployment.buildLogs.push('Creating deployment directory...');
    await deployment.save();

    // Generate complete HTML file
    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${website.name}</title>
    <meta name="description" content="${website.description}">
    <style>
${website.generatedContent.css}
    </style>
</head>
<body>
${website.generatedContent.html}
<script>
${website.generatedContent.js}
</script>
</body>
</html>`;

    // Write files
    const indexPath = path.join(siteDir, 'index.html');
    await fs.writeFile(indexPath, fullHtml);

    deployment.buildLogs.push('Writing website files...');
    await deployment.save();

    // Create additional assets if needed
    if (website.generatedContent.assets && website.generatedContent.assets.length > 0) {
      // Handle asset files (images, etc.)
      deployment.buildLogs.push('Processing assets...');
      await deployment.save();
    }

    // Update deployment status
    deployment.status = 'deployed';
    deployment.lastDeployedAt = new Date();
    deployment.buildLogs.push('Deployment completed successfully');

    await deployment.save();

    customMetrics.activeWebsites.inc();

    logger.info(`Website deployed successfully: ${deploymentId}, URL: ${deployment.deploymentUrl}`);

  } catch (error) {
    logger.error('Error deploying website:', error);

    // Update deployment status to failed
    try {
      const deployment = await WebsiteDeployment.findById(deploymentId);
      if (deployment) {
        deployment.status = 'failed';
        deployment.errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        deployment.buildLogs.push(`Deployment failed: ${deployment.errorMessage}`);
        await deployment.save();
      }
    } catch (updateError) {
      logger.error('Error updating deployment status:', updateError);
    }

    throw error;
  }
}

/**
 * Redeploy an existing website
 */
export async function redeployWebsite(deploymentId: string): Promise<void> {
  try {
    const deployment = await WebsiteDeployment.findById(deploymentId);
    if (!deployment) {
      throw new Error('Deployment not found');
    }

    // Clean up existing deployment
    const siteDir = path.join(SITES_DIR, deployment.subdomain);
    await fs.emptyDir(siteDir);

    // Deploy again
    await deployWebsite(deploymentId);

    logger.info(`Website redeployed successfully: ${deploymentId}`);

  } catch (error) {
    logger.error('Error redeploying website:', error);
    throw error;
  }
}

/**
 * Delete a website deployment
 */
export async function deleteDeployment(deploymentId: string): Promise<void> {
  try {
    const deployment = await WebsiteDeployment.findById(deploymentId);
    if (!deployment) {
      throw new Error('Deployment not found');
    }

    // Remove deployment files
    const siteDir = path.join(SITES_DIR, deployment.subdomain);
    await fs.remove(siteDir);

    // Remove DNS records if custom domain
    if (deployment.domain) {
      // TODO: Remove DNS records
      logger.info(`Would remove DNS records for: ${deployment.domain}`);
    }

    customMetrics.activeWebsites.dec();

    logger.info(`Deployment deleted successfully: ${deploymentId}`);

  } catch (error) {
    logger.error('Error deleting deployment:', error);
    throw error;
  }
}

/**
 * Generate deployment archive for download
 */
export async function generateDeploymentArchive(deploymentId: string): Promise<string> {
  try {
    const deployment = await WebsiteDeployment.findById(deploymentId);
    if (!deployment || deployment.status !== 'deployed') {
      throw new Error('Deployment not found or not deployed');
    }

    const siteDir = path.join(SITES_DIR, deployment.subdomain);
    const archivePath = path.join(DEPLOYMENT_DIR, 'archives', `${deployment.subdomain}.zip`);

    // Ensure archive directory exists
    await fs.ensureDir(path.dirname(archivePath));

    // Create archive
    const output = fs.createWriteStream(archivePath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level
    });

    return new Promise((resolve, reject) => {
      output.on('close', () => {
        logger.info(`Archive created: ${archivePath} (${archive.pointer()} bytes)`);
        resolve(archivePath);
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);
      archive.directory(siteDir, false);
      archive.finalize();
    });

  } catch (error) {
    logger.error('Error generating deployment archive:', error);
    throw error;
  }
}

/**
 * Check deployment health
 */
export async function checkDeploymentHealth(deploymentId: string): Promise<boolean> {
  try {
    const deployment = await WebsiteDeployment.findById(deploymentId);
    if (!deployment || deployment.status !== 'deployed') {
      return false;
    }

    const siteDir = path.join(SITES_DIR, deployment.subdomain);
    const indexPath = path.join(siteDir, 'index.html');

    // Check if files exist
    const filesExist = await fs.pathExists(indexPath);

    return filesExist;

  } catch (error) {
    logger.error('Error checking deployment health:', error);
    return false;
  }
}

/**
 * Initialize deployment directories
 */
export async function initializeDeploymentDirectories(): Promise<void> {
  try {
    await fs.ensureDir(DEPLOYMENT_DIR);
    await fs.ensureDir(SITES_DIR);
    await fs.ensureDir(path.join(DEPLOYMENT_DIR, 'archives'));

    logger.info('Deployment directories initialized');
  } catch (error) {
    logger.error('Error initializing deployment directories:', error);
    throw error;
  }
}