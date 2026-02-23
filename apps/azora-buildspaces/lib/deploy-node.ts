// @ts-ignore
import { Client } from 'ssh2';
import { readFileSync } from 'fs';

interface DeploymentResult {
    success: boolean;
    logs: string[];
    error?: string;
}

export async function deployToWorkerNode(
    host: string = '10.0.0.1', // Default to AzVPN X515 IP
    username: string = 'azora',
    privateKeyPath: string = process.env.SSH_KEY_PATH || '/home/azora/.ssh/id_rsa',
    dockerComposeContent: string
): Promise<DeploymentResult> {

    return new Promise((resolve) => {
        const conn = new Client();
        const logs: string[] = [];

        conn.on('ready', () => {
            logs.push('SSH Connection established.');

            // 1. Create a temporary directory for the deployment
            const deployDir = `/home/${username}/deployments/${Date.now()}`;
            const mkdirCmd = `mkdir -p ${deployDir}`;

            conn.exec(mkdirCmd, (err: any, stream: any) => {
                if (err) {
                    conn.end();
                    return resolve({ success: false, logs, error: err.message });
                }

                stream.on('close', (code: any) => {
                    if (code !== 0) {
                        conn.end();
                        return resolve({ success: false, logs, error: `Failed to create directory. Exit code: ${code}` });
                    }

                    // 2. Write docker-compose.yml (Simulated via echo for simplicity, sftp preferred for large files)
                    // Escaping quotes for echo is tricky, so we base64 encode/decode to be safe
                    const base64Content = Buffer.from(dockerComposeContent).toString('base64');
                    const writeCmd = `echo "${base64Content}" | base64 -d > ${deployDir}/docker-compose.yml`;

                    conn.exec(writeCmd, (err: any, stream: any) => {
                        if (err) {
                            conn.end();
                            return resolve({ success: false, logs, error: err.message });
                        }

                        stream.on('close', (code: any) => {
                            if (code !== 0) {
                                conn.end();
                                return resolve({ success: false, logs, error: `Failed to write compose file. Exit code: ${code}` });
                            }

                            // 3. Run Docker Compose Up
                            const deployCmd = `cd ${deployDir} && docker compose up -d`;
                            logs.push(`Executing: ${deployCmd}`);

                            conn.exec(deployCmd, (err: any, stream: any) => {
                                if (err) {
                                    conn.end();
                                    return resolve({ success: false, logs, error: err.message });
                                }

                                stream.on('data', (data: any) => logs.push(data.toString()));
                                stream.stderr.on('data', (data: any) => logs.push(`ERR: ${data.toString()}`));

                                stream.on('close', (code: any) => {
                                    conn.end();
                                    if (code === 0) {
                                        resolve({ success: true, logs });
                                    } else {
                                        resolve({ success: false, logs, error: `Deployment failed. Exit code: ${code}` });
                                    }
                                });
                            });
                        });
                    });
                });
            });
        }).on('error', (err: any) => {
            resolve({ success: false, logs, error: `SSH Connection Failed: ${err.message}` });
        }).connect({
            host,
            port: 22,
            username,
            privateKey: process.env.NODE_ENV === 'production' ? readFileSync(privateKeyPath) : undefined,
            // Mock for dev if key not found
            password: process.env.NODE_ENV !== 'production' ? 'mock_password' : undefined
        });
    });
}
