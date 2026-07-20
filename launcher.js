const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const appDir = path.join(os.homedir(), 'archweb-kids-os');

function runCommand(command, args, cwd, hide = false) {
    return new Promise((resolve) => {
        const proc = spawn(command, args, {
            cwd,
            shell: true,
            windowsHide: hide,
            stdio: hide ? 'ignore' : 'inherit'
        });

        proc.on('close', () => resolve());
        proc.on('error', () => resolve());
    });
}

async function main() {
    try {
        if (!fs.existsSync(appDir)) {
            console.log("ArchWeb OS for Kids yukleniyor (Ilk kurulum)...");
            await runCommand('git', ['clone', 'https://github.com/meminalp2434/archweb-os.git', appDir], process.cwd(), false);
        } else {
            console.log("Guncellemeler kontrol ediliyor...");
            await runCommand('git', ['pull'], appDir, false);
        }

        console.log("Bagimliliklar yukleniyor, bu biraz surebilir...");
        await runCommand('npm', ['install'], appDir, false);

        console.log("Uygulama baslatiliyor...");
        const electronProc = spawn('npm', ['run', 'electron:start'], {
            cwd: appDir,
            shell: true,
            windowsHide: false,
            detached: true,
            stdio: 'inherit'
        });
        
        electronProc.unref();
        setTimeout(() => process.exit(0), 3000);
    } catch (e) {
        console.error("Hata:", e);
        setTimeout(() => process.exit(1), 5000);
    }
}

main();
