import { spawn, ChildProcess } from 'child_process';
import { WebSocketServer } from 'ws';
import * as path from 'path';

export class TestExecutor {
  private currentProcess: ChildProcess | null = null;
  private startTime: number = 0;

  constructor(
    private tool: 'puppeteer' | 'playwright',
    private mode: 'headed' | 'headless',
    private wss: WebSocketServer,
    private config: Record<string, string> = {}
  ) {}

  async run(journeys: string[]): Promise<void> {
    for (const journey of journeys) {
      try {
        await this.runSingleJourney(journey, journeys.length);
      } catch (error) {
        // Continue to next journey
      }
    }
  }

  private async runSingleJourney(journey: string, totalJourneys: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.startTime = Date.now();
      
      const isPuppeteer = this.tool === 'puppeteer';
      // Adjust CWD to where the runners are
      // Need to be careful with paths here. 
      // __dirname is packages/test-runner-ui/server
      // dev-runner is ../../dev-runner
      // e2e is ../../../e2e
      const cwd = isPuppeteer 
        ? path.join(__dirname, '../../puppeteer-runner')
        : path.join(__dirname, '../../playwright-runner');
      
      const command = 'npm';
      
      const args = [];
      if (isPuppeteer) {
        // use the script we defined in dev-runner package
        args.push('run', 'execute', '--', journey);
      } else {
        // Playwright args
        // We need to pass the arguments directly to the npm script
        // Note: npm run test-single -- -g sample --headed
        args.push('run', 'test-single', '--', '-g', journey);
        if (this.mode === 'headed') args.push('--headed');
      }

      const env: any = {
        ...process.env,
        HEADLESS: this.mode === 'headless' ? 'true' : 'false',
        CLOSE_BROWSER: totalJourneys > 1 ? 'true' : 'false'
      };

      // Apply dynamic config from UI (only if not empty)
      Object.entries(this.config).forEach(([key, value]) => {
        if (value) {
          env[key] = value;
        }
      });

      this.broadcast({ type: 'test-start', journey, tool: this.tool });

      // Shell true to easily find npm
      this.currentProcess = spawn(command, args, { env, cwd, shell: true });

      this.currentProcess.stdout?.on('data', (d) => this.broadcast({ type: 'log', message: d.toString() }));
      this.currentProcess.stderr?.on('data', (d) => this.broadcast({ type: 'error', message: d.toString() }));

      this.currentProcess.on('close', (code) => {
        const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
        this.broadcast({ 
          type: 'test-end', 
          journey, 
          status: code === 0 ? 'passed' : 'failed', 
          duration 
        });
        
        this.currentProcess = null;
        code === 0 ? resolve() : reject(new Error(`Exit code ${code}`));
      });
    });
  }

  stop() {
    this.currentProcess?.kill();
    this.currentProcess = null;
  }

  private broadcast(msg: any) {
    this.wss.clients.forEach(c => {
      if (c.readyState === 1) c.send(JSON.stringify(msg));
    });
  }
}
