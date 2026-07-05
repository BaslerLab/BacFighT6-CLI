const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline'); // Built-in Node library for terminal UI

// --- Default Configuration ---
let WORKERS = 8;
let TOTAL_ITERATIONS = 100;
let OUTPUT_DIR = "c:\\_Temp"; 
let URL_PARAMS = "preset=battleroyale";
let WINNER_FLAG = "true"; 
let SUMMARIZE_FLAG = "true"; 
let OPTIMIZED_FLAG = "true";
let START_SEED = 1;

// --- Command-Line Argument Parser ---
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--workers' && args[i+1]) WORKERS = parseInt(args[++i], 10);
    else if (args[i] === '--iterations' && args[i+1]) TOTAL_ITERATIONS = parseInt(args[++i], 10);
    else if (args[i] === '--outdir' && args[i+1]) OUTPUT_DIR = args[++i];
    else if (args[i] === '--params' && args[i+1]) URL_PARAMS = args[++i];
    else if (args[i] === '--winner' && args[i+1]) WINNER_FLAG = args[++i];
    else if (args[i] === '--summarize' && args[i+1]) SUMMARIZE_FLAG = args[++i]; 
    else if (args[i] === '--startseed' && args[i+1]) START_SEED = parseInt(args[++i], 10);
    else if (args[i] === '--optimized' && args[i+1]) OPTIMIZED_FLAG = args[++i];
}

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// --- Global Queue & State ---
let nextSeedToRun = START_SEED;
let tasksDispatched = 0;
let completedSimulations = 0;
let isShuttingDown = false; 

const workersState = Array.from({ length: WORKERS }, (_, i) => ({
    id: i + 1,
    seed: '-',
    startTime: null,
    statusText: 'Initializing...',
    lastOutcome: '' 
}));

console.clear();
const dashboardInterval = setInterval(renderDashboard, 1000);

for (let w = 1; w <= WORKERS; w++) {
    startWorker(w);
}

// --- The Live Terminal UI ---
function renderDashboard() {
    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);
    
    const termWidth = process.stdout.columns || 120;
    
    let ui = `\n🚀 BacFighT6 Live Dashboard | ${completedSimulations} / ${TOTAL_ITERATIONS} Completed\n`;
    ui += `📦 Output:   ${OUTPUT_DIR}\n`;
    ui += `⚙️ Settings: ${URL_PARAMS}\n`;
    ui += `🏁 Stop on Winner: ${WINNER_FLAG} | 📊 Auto-Summarize: ${SUMMARIZE_FLAG}\n`; 
    ui += `=========================================================================================\n`;
    
    for (let i = 0; i < WORKERS; i++) {
        const w = workersState[i];
        const name = `[Worker ${w.id.toString().padStart(2, '0')}]`;
        const seedStr = `Seed: ${w.seed.toString().padEnd(6)}`;
        
        let timeStr = "0.0s";
        if (w.startTime) {
             timeStr = ((Date.now() - w.startTime) / 1000).toFixed(1) + "s";
        }
        timeStr = timeStr.padEnd(6);

		const prefix = `${name} ${seedStr} | ⏱️ ${timeStr} | `;
		ui += `${prefix}${w.statusText}\n`;
    }
    
    process.stdout.write(ui);
}

// --- The TSV Summarizer Logic ---
function summarizeBatch(targetDir) {
    console.log(`\n📊 Generating batch summary...`);
    const files = fs.readdirSync(targetDir).filter(f => f.endsWith('_report.txt'));
    
    if (files.length === 0) {
        console.log(`⚠️ No report files found in ${targetDir}`);
        return;
    }

    const now = new Date();
    const timestamp = now.getFullYear().toString() +
                      (now.getMonth() + 1).toString().padStart(2, '0') +
                      now.getDate().toString().padStart(2, '0') +
                      now.getHours().toString().padStart(2, '0') +
                      now.getMinutes().toString().padStart(2, '0') +
                      now.getSeconds().toString().padStart(2, '0');
                      
    const outPath = path.join(targetDir, `batch_summary_${timestamp}.tsv`);
    
    const headers = ["File Name Prefix", "Seed", "Settings", "Total Steps", "Winner Decided Step", "Calculation Time", "LiveAttackers", "LivePrey", "LiveDefenders", "Winner"];
    const results = [];
    results.push(headers.join('\t'));

    for (const file of files) {
        try {
            const filePath = path.join(targetDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const filePrefix = file.replace('_report.txt', '');

            let seed = "N/A", settings = "N/A", totalSteps = "N/A", winnerDecidedStep = "N/A", calcTime = "N/A";
            let attackers = "N/A", prey = "N/A", defenders = "N/A", winner = "N/A";

            const winnerMatch = content.match(/Outcome:\s*(.+)/);
            if (winnerMatch) winner = winnerMatch[1].trim();

            const settingsMatch = content.match(/Settings:\s*(.+)/);
            if (settingsMatch) settings = settingsMatch[1].trim();

            const seedMatch = content.match(/Seed:\s*(.+)/);
            if (seedMatch) seed = seedMatch[1].trim();

            const iterMatch = content.match(/Duration:\s*(\d+)\s*minutes/);
            if (iterMatch) totalSteps = iterMatch[1].trim();
            const iterMatch2 = content.match(/Winner decided:\s*(\d+)\s*minutes/);
            if (iterMatch2) winnerDecidedStep = iterMatch2[1].trim();
            const calcMatch = content.match(/Calculation Time(?:\s*\(s\))?:\s*(.+)/);
            if (calcMatch) calcTime = calcMatch[1].trim();

            const popMatch = content.match(/Remaining - Attackers:\s*([\d,]+);\s*Prey:\s*([\d,]+);\s*Defenders:\s*([\d,]+)/);
            if (popMatch) {
                attackers = popMatch[1].replace(/,/g, '').trim();
                prey = popMatch[2].replace(/,/g, '').trim();
                defenders = popMatch[3].replace(/,/g, '').trim();
            }

            results.push([filePrefix, seed, settings, totalSteps, winnerDecidedStep, calcTime, attackers, prey, defenders, winner].join("\t"));
        } catch (err) {
            console.log(`⚠️ Warning: Could not parse ${file}. Error: ${err.message}`);
        }
    }

    try {
        fs.writeFileSync(outPath, results.join('\n') + '\n', 'utf8');
        console.log(`✅ Successfully processed ${files.length} reports.`);
        console.log(`💾 Batch summary saved to: ${outPath}\n`);
    } catch (err) {
        console.log(`❌ Error saving summary: ${err.message}\n`);
    }
}

// --- The Worker Logic ---
async function startWorker(workerId) {
    const wIndex = workerId - 1; 

    // Loop runs until we have DISPATCHED the total number of iterations required
    while (tasksDispatched < TOTAL_ITERATIONS) {
        tasksDispatched++; // Claim a task slot
        const currentSeed = nextSeedToRun++; // Claim the specific seed
        
        workersState[wIndex].seed = currentSeed;
        workersState[wIndex].startTime = Date.now();
        workersState[wIndex].statusText = 'Starting simulation...';
        
        const fullParams = `Simulation_Seed=${currentSeed}&${URL_PARAMS}`;
        
        const result = await new Promise((resolve) => {
            let outputLog = "";

            const child = spawn('node', [
                '--max-old-space-size=8192', 
                'headless.js', 
                '-output', OUTPUT_DIR, 
                '-winner', WINNER_FLAG,
                '-optimized', OPTIMIZED_FLAG,
                fullParams
            ]);

            child.stdout.on('data', (data) => {
                const text = data.toString();
                outputLog += text; 
                
                const lines = text.split(/[\r\n]+/);
                const lastLine = lines.filter(l => l.trim().length > 0).pop();
                if (lastLine) {
                    workersState[wIndex].statusText = lastLine.trim();
                }
            });

            child.stderr.on('data', (data) => {
                outputLog += data.toString();
            });

            child.on('close', (code) => {
                resolve({ code, outputLog });
            });
        });

        completedSimulations++;
        
        let outcomeMsg = "Finished";
        if (result.outputLog.includes("Simulation stopped early:")) {
            const winnerLine = result.outputLog.split('\n').find(l => l.includes("Simulation stopped early:"));
            if (winnerLine) outcomeMsg = winnerLine.replace('Simulation stopped early:', '').trim();
        }

        workersState[wIndex].lastOutcome = outcomeMsg;
    }
    
    workersState[wIndex].seed = '-';
    workersState[wIndex].startTime = null; 
    const finalResult = workersState[wIndex].lastOutcome || "Finished";
    workersState[wIndex].statusText = `✅ Done! (Last Run: ${finalResult})`;
    
    if (completedSimulations >= TOTAL_ITERATIONS && !isShuttingDown) {
        isShuttingDown = true; 
        clearInterval(dashboardInterval); 
        renderDashboard(); 
        
        console.log(`\n🎉 All ${TOTAL_ITERATIONS} simulations completed successfully!`);
        
        if (SUMMARIZE_FLAG.toLowerCase() === 'true') {
            summarizeBatch(OUTPUT_DIR);
        } else {
            console.log(); 
        }
        
        process.exit(0);
    }
}
