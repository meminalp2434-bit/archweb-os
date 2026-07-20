import { spawn } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';
import { homedir } from 'os';

const appDir = join(homedir(), 'archweb-kids-os');

function runCommand(command: string, args: string[], cwd: string, hide = false): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const proc = spawn(command, args, {
            cwd,
            shell: true,
            windowsHide: hide,
            stdio: hide ? 'ignore' : 'inherit'
        });

        proc.on('close', (code) => {
            if (code === 0) resolve();
            else resolve(); // continue even if error
        });
        
        proc.on('error', () => {
            resolve();
        });
    });
}

async function main() {
    try {
        if (!existsSync(appDir)) {
            console.log("ArchWeb OS for Kids yukleniyor (Ilk kurulum)...");
            await runCommand('git', ['clone', 'https://github.com/meminalp2434/archweb-os.git', appDir], process.cwd(), false);
        } else {
            console.log("Guncellemeler kontrol ediliyor...");
            await runCommand('git', ['pull'], appDir, true);
        }

        console.log("Bagimliliklar yukleniyor, bu biraz surebilir...");
        await runCommand('npm', ['install'], appDir, true);

        console.log("Uygulama baslatiliyor...");
        // Run electron process detached so it survives if launcher closes
        const electronProc = spawn('npm', ['run', 'electron:start'], {
            cwd: appDir,
            shell: true,
            windowsHide: true,
            detached: true,
            stdio: 'ignore'
        });
        
        electronProc.unref();
        
        // Wait 1 second before closing the launcher
        setTimeout(() => process.exit(0), 1000);
    } catch (e) {
        console.error("Hata:", e);
        setTimeout(() => process.exit(1), 5000);
    }
}

main();
