import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import cron from 'node-cron';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Strict allow-list for backup filenames. Prevents path traversal and shell
// metacharacters from ever reaching a child process or the filesystem.
const SAFE_FILENAME = /^[A-Za-z0-9._-]+\.sql$/;

function assertSafeFilename(filename: string): void {
  if (!filename || !SAFE_FILENAME.test(filename) || filename.includes('..')) {
    throw new Error('Invalid backup filename');
  }
}

/**
 * Run a postgres CLI tool with arguments passed as an array (no shell), so
 * user-influenced values cannot be interpreted as commands. The DB password
 * is provided via the PGPASSWORD env var, never interpolated into a string.
 */
function runPgTool(
  command: 'pg_dump' | 'psql',
  args: string[],
  password: string,
  io: { stdoutFile?: string; stdinFile?: string }
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: { ...process.env, PGPASSWORD: password },
    });

    if (io.stdoutFile) {
      child.stdout.pipe(fs.createWriteStream(io.stdoutFile));
    }
    if (io.stdinFile) {
      fs.createReadStream(io.stdinFile).pipe(child.stdin);
    }

    let stderr = '';
    child.stderr.on('data', (d) => (stderr += d.toString()));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}: ${stderr}`));
    });
  });
}

interface BackupConfig {
    enabled: boolean;
    schedule: string; // Cron expression
}

export class BackupService {
    private backupDir: string;
    private configPath: string;
    private s3Client: S3Client | null = null;
    private s3Bucket: string | null = null;
    private scheduledTask: any = null;
    private config: BackupConfig = {
        enabled: true,
        schedule: '0 3 * * *' // Default: 3:00 AM
    };

    constructor() {
        this.backupDir = path.join(process.cwd(), 'backups');
        this.configPath = path.join(this.backupDir, 'config.json');

        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }

        // Load config
        this.loadConfig();

        // Initialize S3 if env vars are present
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION && process.env.AWS_S3_BUCKET) {
            this.s3Client = new S3Client({
                region: process.env.AWS_REGION,
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
                }
            });
            this.s3Bucket = process.env.AWS_S3_BUCKET;
            console.log('AWS S3 Backup Configured');
        } else {
            console.log('AWS S3 Backup Not Configured (Missing env vars)');
        }

        // Initialize scheduled task
        this.initScheduler();
    }

    private loadConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                const data = fs.readFileSync(this.configPath, 'utf-8');
                this.config = { ...this.config, ...JSON.parse(data) };
            } else {
                this.saveConfig(); // Save defaults
            }
        } catch (error) {
            console.error('Failed to load backup config, using defaults:', error);
        }
    }

    private saveConfig() {
        try {
            fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
        } catch (error) {
            console.error('Failed to save backup config:', error);
        }
    }

    private initScheduler() {
        // Stop existing task if any
        if (this.scheduledTask) {
            this.scheduledTask.stop();
            this.scheduledTask = null;
        }

        if (this.config.enabled) {
            console.log(`Scheduling daily backup with cron: ${this.config.schedule}`);
            this.scheduledTask = cron.schedule(this.config.schedule, async () => {
                console.log('Running scheduled daily backup...');
                try {
                    await this.createBackup('auto-daily');
                } catch (error) {
                    console.error('Scheduled backup failed:', error);
                }
            });
        } else {
            console.log('Scheduled backups are disabled.');
        }
    }

    public getConfig(): BackupConfig {
        return this.config;
    }

    public updateConfig(newConfig: Partial<BackupConfig>): BackupConfig {
        this.config = { ...this.config, ...newConfig };
        this.saveConfig();
        this.initScheduler();
        return this.config;
    }

    private async uploadToS3(filepath: string, filename: string) {
        if (!this.s3Client || !this.s3Bucket) return;

        try {
            const fileStream = fs.createReadStream(filepath);
            const command = new PutObjectCommand({
                Bucket: this.s3Bucket,
                Key: `backups/${filename}`,
                Body: fileStream
            });

            await this.s3Client.send(command);
            console.log(`Successfully uploaded ${filename} to S3`);
        } catch (error) {
            console.error('Failed to upload backup to S3:', error);
            // We don't throw here to ensure local backup success persists
        }
    }

    async createBackup(prefix: string = 'manual'): Promise<{ filename: string; path: string; size: number }> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${prefix}-${timestamp}.sql`;
        const filepath = path.join(this.backupDir, filename);

        const dbConfig = {
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            database: process.env.DB_NAME || 'institute_db',
            password: process.env.DB_PASSWORD || 'password',
            port: process.env.DB_PORT || '5432'
        };

        try {
            await runPgTool(
                'pg_dump',
                ['-U', dbConfig.user, '-h', dbConfig.host, '-p', dbConfig.port, dbConfig.database],
                dbConfig.password,
                { stdoutFile: filepath }
            );

            const stats = fs.statSync(filepath);

            // Attempt S3 Upload
            await this.uploadToS3(filepath, filename);

            return {
                filename,
                path: filepath,
                size: stats.size
            };
        } catch (error) {
            console.error('Backup creation failed:', error);
            throw new Error(`Backup failed: ${(error as any).message}`);
        }
    }

    async listBackups(): Promise<Array<{ filename: string; size: number; createdAt: Date }>> {
        try {
            const files = fs.readdirSync(this.backupDir);

            const backups = files
                .filter(f => f.endsWith('.sql'))
                .map(filename => {
                    const filepath = path.join(this.backupDir, filename);
                    const stats = fs.statSync(filepath);
                    return {
                        filename,
                        size: stats.size,
                        createdAt: stats.birthtime
                    };
                })
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

            return backups;
        } catch (error) {
            console.error('List backups failed:', error);
            throw new Error('Failed to list backups');
        }
    }

    async deleteBackup(filename: string): Promise<void> {
        assertSafeFilename(filename);
        const filepath = path.join(this.backupDir, filename);

        // Security check: prevent directory traversal
        if (path.dirname(filepath) !== this.backupDir) {
            throw new Error('Invalid file path');
        }

        if (!fs.existsSync(filepath)) {
            throw new Error('Backup file not found');
        }

        fs.unlinkSync(filepath);
    }

    async restoreBackup(filename: string): Promise<void> {
        assertSafeFilename(filename);
        const filepath = path.join(this.backupDir, filename);

        // Defense in depth: ensure the resolved path is inside backupDir.
        if (path.dirname(filepath) !== this.backupDir) {
            throw new Error('Invalid file path');
        }
        if (!fs.existsSync(filepath)) {
            throw new Error('Backup file not found');
        }

        const dbConfig = {
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            database: process.env.DB_NAME || 'institute_db',
            password: process.env.DB_PASSWORD || 'password',
            port: process.env.DB_PORT || '5432'
        };

        try {
            await runPgTool(
                'psql',
                ['-U', dbConfig.user, '-h', dbConfig.host, '-p', dbConfig.port, '-d', dbConfig.database],
                dbConfig.password,
                { stdinFile: filepath }
            );
        } catch (error) {
            console.error('Restore failed:', error);
            throw new Error(`Restore failed: ${(error as any).message}`);
        }
    }

    getBackupPath(filename: string): string {
        assertSafeFilename(filename);
        const filepath = path.join(this.backupDir, filename);
        if (path.dirname(filepath) !== this.backupDir) {
            throw new Error('Invalid file path');
        }
        if (!fs.existsSync(filepath)) {
            throw new Error('File not found');
        }
        return filepath;
    }
}

export const backupService = new BackupService();
