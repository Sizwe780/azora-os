/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import OpenAI from 'openai';
import { WebsiteGeneration } from '../models/Website';
import { customMetrics, aiRateLimiter } from '../middleware/metrics';
import logger from '../utils/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate website content using AI
 */
export async function generateWebsiteContent(websiteId: string): Promise<void> {
  try {
    // Rate limit AI requests
    await aiRateLimiter.consume('website_generation');

    const website = await WebsiteGeneration.findById(websiteId);
    if (!website) {
      throw new Error('Website not found');
    }

    // Update status to generating
    website.status = 'generating';
    await website.save();

    const startTime = Date.now();

    // Generate HTML content
    const htmlPrompt = `Generate a complete HTML structure for a ${website.businessType} website.
    Website details:
    - Name: ${website.name}
    - Description: ${website.description}
    - Target Audience: ${website.targetAudience}
    - Features: ${website.features.join(', ')}
    - Color Scheme: ${website.colorScheme.join(', ')}

    Requirements:
    - Use semantic HTML5
    - Include proper meta tags
    - Make it responsive with CSS Grid/Flexbox
    - Include sections for: header, hero, about, services/features, contact
    - Use the provided color scheme
    - Make it professional and modern
    - Include placeholder content that matches the business type

    Return only the HTML code without any explanations.`;

    const htmlResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: htmlPrompt }],
      max_tokens: 4000,
      temperature: 0.7,
    });

    const generatedHtml = htmlResponse.choices[0]?.message?.content?.trim() || '';

    // Generate CSS styles
    const cssPrompt = `Generate CSS styles for the following HTML structure. Use the color scheme: ${website.colorScheme.join(', ')}.

    Requirements:
    - Make it fully responsive (mobile-first)
    - Use modern CSS with Grid and Flexbox
    - Include smooth animations and transitions
    - Professional typography
    - Clean, modern design
    - Ensure good contrast and accessibility

    HTML structure:
    ${generatedHtml.substring(0, 2000)}...

    Return only the CSS code without any explanations.`;

    const cssResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: cssPrompt }],
      max_tokens: 3000,
      temperature: 0.5,
    });

    const generatedCss = cssResponse.choices[0]?.message?.content?.trim() || '';

    // Generate JavaScript for interactivity
    const jsPrompt = `Generate JavaScript code for a ${website.businessType} website with the following features: ${website.features.join(', ')}.

    Requirements:
    - Include smooth scrolling for navigation
    - Add form validation if contact forms are present
    - Include mobile menu toggle if navigation exists
    - Add any interactive features based on the business type
    - Use modern ES6+ syntax
    - Include error handling

    Return only the JavaScript code without any explanations.`;

    const jsResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: jsPrompt }],
      max_tokens: 2000,
      temperature: 0.3,
    });

    const generatedJs = jsResponse.choices[0]?.message?.content?.trim() || '';

    // Update website with generated content
    website.generatedContent = {
      html: generatedHtml,
      css: generatedCss,
      js: generatedJs,
      assets: [], // TODO: Generate or select assets
    };
    website.status = 'completed';
    website.completedAt = new Date();

    await website.save();

    const duration = (Date.now() - startTime) / 1000;
    customMetrics.websiteGenerationDuration.observe(duration);
    customMetrics.websitesGeneratedTotal.inc();

    logger.info(`Website generated successfully: ${websiteId}, duration: ${duration}s`);

  } catch (error) {
    logger.error('Error generating website content:', error);

    // Update website status to failed
    try {
      await WebsiteGeneration.findByIdAndUpdate(websiteId, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } catch (updateError) {
      logger.error('Error updating website status:', updateError);
    }

    throw error;
  }
}

/**
 * Customize existing website content
 */
export async function customizeWebsiteContent(
  websiteId: string,
  customizations: Record<string, any>
): Promise<void> {
  try {
    const website = await WebsiteGeneration.findById(websiteId);
    if (!website || website.status !== 'completed') {
      throw new Error('Website not found or not ready for customization');
    }

    // Apply customizations using AI
    const customizationPrompt = `Customize the following website content based on these requirements:
    Current HTML: ${website.generatedContent.html.substring(0, 1000)}...
    Current CSS: ${website.generatedContent.css.substring(0, 1000)}...

    Customizations: ${JSON.stringify(customizations)}

    Return the modified HTML and CSS with the customizations applied.`;

    const customizationResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: customizationPrompt }],
      max_tokens: 4000,
      temperature: 0.5,
    });

    const customizedContent = customizationResponse.choices[0]?.message?.content?.trim() || '';

    // Parse and update content (simplified - in reality would need better parsing)
    website.generatedContent.html = customizedContent;
    website.customizations = customizations;

    await website.save();

    logger.info(`Website customized successfully: ${websiteId}`);

  } catch (error) {
    logger.error('Error customizing website content:', error);
    throw error;
  }
}

/**
 * Generate website preview/screenshot
 */
export async function generateWebsitePreview(websiteId: string): Promise<string> {
  try {
    const website = await WebsiteGeneration.findById(websiteId);
    if (!website || website.status !== 'completed') {
      throw new Error('Website not found or not ready for preview');
    }

    // This would typically use Puppeteer to generate a screenshot
    // For now, return a placeholder
    const previewUrl = `https://api.azora-os.com/previews/${websiteId}.png`;

    logger.info(`Website preview generated: ${websiteId}`);

    return previewUrl;

  } catch (error) {
    logger.error('Error generating website preview:', error);
    throw error;
  }
}