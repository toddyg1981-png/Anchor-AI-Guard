/**
 * GitHub webhook handler for Anchor Security
 * Handles PR events, check suites, and installation events
 */

import crypto from 'crypto';
import { AnchorGitHubApp, WebhookPayload } from './app';
import { ScanResult } from '../types';

export interface WebhookConfig {
  webhookSecret: string;
  appId: string;
  privateKey: string;
}

export interface WebhookRequest {
  headers: {
    'x-hub-signature-256'?: string;
    'x-github-event'?: string;
    'x-github-delivery'?: string;
  };
  body: string;
}

export interface WebhookResponse {
  status: number;
  body: string;
}

export class GitHubWebhookHandler {
  private config: WebhookConfig;
  private scanCallback: (owner: string, repo: string, sha: string) => Promise<ScanResult>;

  constructor(
    config: WebhookConfig,
    scanCallback: (owner: string, repo: string, sha: string) => Promise<ScanResult>
  ) {
    this.config = config;
    this.scanCallback = scanCallback;
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload: string, signature: string): boolean {
    const expected = `sha256=${crypto
      .createHmac('sha256', this.config.webhookSecret)
      .update(payload)
      .digest('hex')}`;
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  }

  /**
   * Handle incoming webhook
   */
  async handleWebhook(request: WebhookRequest): Promise<WebhookResponse> {
    const signature = request.headers['x-hub-signature-256'];
    const event = request.headers['x-github-event'];
    const delivery = request.headers['x-github-delivery'];

    // Verify signature
    if (!signature || !this.verifySignature(request.body, signature)) {
      return { status: 401, body: 'Invalid signature' };
    }

    const payload = JSON.parse(request.body) as WebhookPayload;

    console.log(`[Webhook] Event: ${event}, Delivery: ${delivery}`);

    try {
      switch (event) {
        case 'pull_request':
          await this.handlePullRequest(payload);
          break;
        
        case 'check_suite':
          await this.handleCheckSuite(payload);
          break;
        
        case 'installation':
          await this.handleInstallation(payload);
          break;
        
        case 'installation_repositories':
          await this.handleInstallationRepositories(payload);
          break;
        
        default:
          console.log(`[Webhook] Unhandled event: ${event}`);
      }

      return { status: 200, body: 'OK' };
    } catch (error) {
      console.error('[Webhook] Error:', error);
      return { status: 500, body: 'Internal error' };
    }
  }

  /**
   * Handle pull_request events
   */
  private async handlePullRequest(payload: WebhookPayload): Promise<void> {
    if (!payload.pull_request || !payload.installation) return;

    const validActions = ['opened', 'synchronize', 'reopened'];
    if (!validActions.includes(payload.action)) {
      console.log(`[PR] Skipping action: ${payload.action}`);
      return;
    }

    const { owner, repo, pr, sha } = this.extractPRContext(payload);
    
    console.log(`[PR] Scanning ${owner}/${repo}#${pr} (${sha.slice(0, 7)})`);

    // Run scan
    const result = await this.scanCallback(owner, repo, sha);

    // Create GitHub App instance
    const app = new AnchorGitHubApp({
      appId: this.config.appId,
      privateKey: this.config.privateKey,
      installationId: payload.installation.id,
    });

    // Post results
    const ctx = { owner, repo, pull_number: pr, head_sha: sha };
    
    await Promise.all([
      app.createCheckRun(ctx, result),
      app.postPRComment(ctx, result),
      app.setCommitStatus(ctx, result),
    ]);

    console.log(`[PR] Scan complete: ${result.findings.length} findings`);
  }

  /**
   * Handle check_suite events (requested, rerequested)
   */
  private async handleCheckSuite(payload: any): Promise<void> {
    if (!['requested', 'rerequested'].includes(payload.action)) return;
    
    const { repository, check_suite, installation } = payload;
    
    if (!check_suite.pull_requests?.length) return;

    const pr = check_suite.pull_requests[0];
    const owner = repository.owner.login;
    const repo = repository.name;
    const sha = check_suite.head_sha;

    console.log(`[CheckSuite] Scanning ${owner}/${repo} (${sha.slice(0, 7)})`);

    const result = await this.scanCallback(owner, repo, sha);

    const app = new AnchorGitHubApp({
      appId: this.config.appId,
      privateKey: this.config.privateKey,
      installationId: installation.id,
    });

    await app.createCheckRun(
      { owner, repo, pull_number: pr.number, head_sha: sha },
      result
    );
  }

  /**
   * Handle app installation events
   */
  private async handleInstallation(payload: any): Promise<void> {
    const { action, installation, sender } = payload;
    
    console.log(`[Installation] ${action} by ${sender.login}`);
    
    switch (action) {
      case 'created':
        // New installation - could trigger initial scan
        console.log(`[Installation] New install: ${installation.account.login}`);
        break;
      
      case 'deleted':
        // Installation removed - cleanup
        console.log(`[Installation] Removed: ${installation.account.login}`);
        break;
      
      case 'suspend':
        console.log(`[Installation] Suspended: ${installation.account.login}`);
        break;
      
      case 'unsuspend':
        console.log(`[Installation] Unsuspended: ${installation.account.login}`);
        break;
    }
  }

  /**
   * Handle repository add/remove events
   */
  private async handleInstallationRepositories(payload: any): Promise<void> {
    const { action, repositories_added, repositories_removed } = payload;
    
    if (action === 'added' && repositories_added) {
      for (const repo of repositories_added) {
        console.log(`[Installation] Repo added: ${repo.full_name}`);
      }
    }
    
    if (action === 'removed' && repositories_removed) {
      for (const repo of repositories_removed) {
        console.log(`[Installation] Repo removed: ${repo.full_name}`);
      }
    }
  }

  private extractPRContext(payload: WebhookPayload) {
    return {
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      pr: payload.pull_request!.number,
      sha: payload.pull_request!.head.sha,
    };
  }
}

/**
 * Express middleware for webhook handling
 */
export function createWebhookMiddleware(
  config: WebhookConfig,
  scanCallback: (owner: string, repo: string, sha: string) => Promise<ScanResult>
) {
  const handler = new GitHubWebhookHandler(config, scanCallback);

  return async (req: any, res: any) => {
    const request: WebhookRequest = {
      headers: {
        'x-hub-signature-256': req.headers['x-hub-signature-256'],
        'x-github-event': req.headers['x-github-event'],
        'x-github-delivery': req.headers['x-github-delivery'],
      },
      body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body),
    };

    const response = await handler.handleWebhook(request);
    res.status(response.status).send(response.body);
  };
}
