const v8 = require('v8');
const { spawn } = require('child_process');

// Auto-restart with 8GB RAM if the memory limit is too low (prevents V8 heap crashes with 1200MB buffers)
const currentLimitMB = Math.round(v8.getHeapStatistics().heap_size_limit / 1024 / 1024);
if (currentLimitMB < 8000) {
    console.log(`[Boot] V8 Memory limit is ${currentLimitMB}MB. Auto-restarting with 8192MB to prevent crashes...`);
    const args = ['--max-old-space-size=8192', __filename, ...process.argv.slice(2)];
    const child = spawn(process.execPath, args, { stdio: 'inherit' });
    child.on('exit', code => process.exit(code));
    return; // Stop execution in the original process
}

const fs = require('fs');
const path = require('path');
const msgpack = require('./libs/msgpack.min.js');
const seedrandom = require('./libs/seedrandom.min.js');

// 1. Setup global mocks to simulate the browser environment
global.Math.seedrandom = seedrandom;
// Start performance.now at 1 to initialize UI once, then freeze it to completely disable the massive overhead of headless drawGrid loops
global.performance = { now: () => 1 };
let urlParamStr = '';
global.outputDir = '.';
global.stopOnWinner = false;
global.useOptimized = true;
for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] === '-output' && i + 1 < process.argv.length) {
        global.outputDir = process.argv[i + 1];
        i++;
    } else if (process.argv[i] === '-winner' && i + 1 < process.argv.length) {
        global.stopOnWinner = process.argv[i + 1].toLowerCase() === 'true';
        i++;
    } else if (process.argv[i] === '-optimized' && i + 1 < process.argv.length) {
        global.useOptimized = process.argv[i + 1].toLowerCase() !== 'false';
        i++;
    } else if (process.argv[i] === '-settings' && i + 1 < process.argv.length) {
        if (urlParamStr.length > 0) urlParamStr += '&';
        urlParamStr += 'settingsFileURL=' + encodeURIComponent(process.argv[i + 1]);
        i++;
    } else if (process.argv[i] === '-arena' && i + 1 < process.argv.length) {
        if (urlParamStr.length > 0) urlParamStr += '&';
        urlParamStr += 'arenaFileURL=' + encodeURIComponent(process.argv[i + 1]);
        i++;
    } else {
        if (urlParamStr.length > 0) urlParamStr += '&';
        urlParamStr += process.argv[i];
    }
}

global.window = {
    location: { search: '?' + urlParamStr },
    addEventListener: () => {},
    dispatchEvent: () => {}
};
global.navigator = { locks: { request: async (name, cb) => { await cb(); } } };

global.fetch = async function(url) {
    return {
        ok: true,
        text: async () => fs.readFileSync(url, 'utf8'),
        arrayBuffer: async () => new Uint8Array(fs.readFileSync(url)).buffer
    };
};

global.indexedDB = {
    open: () => {
        const req = {};
        const dbMock = {
            transaction: () => {
                const tx = {
                    objectStore: () => ({
                        clear: () => {
                            const clearReq = {};
                            process.nextTick(() => clearReq.onsuccess && clearReq.onsuccess());
                            return clearReq;
                        },
                        put: () => {}
                    })
                };
                process.nextTick(() => tx.oncomplete && tx.oncomplete());
                return tx;
            },
            close: () => {}
        };
        process.nextTick(() => req.onsuccess && req.onsuccess({ target: { result: dbMock } }));
        return req;
    },
    deleteDatabase: () => {
        const req = {};
        process.nextTick(() => req.onsuccess && req.onsuccess());
        return req;
    },
    databases: async () => []
};

global.Path2D = class {
    moveTo() {}
    lineTo() {}
    closePath() {}
};

// We need a robust DOM element mock that stores values
class MockElement {
    constructor(id) {
        this.id = id;
        this.value = '0'; // default to string '0' to avoid NaN if parsed
        this.checked = false;
        this.classList = { add: () => {}, remove: () => {}, toggle: () => {} };
        this.style = {};
        this.textContent = '';
        this.innerHTML = '';
        this.disabled = false;
        if (id.toLowerCase().includes('checkbox')) {
            this.type = 'checkbox';
        }
    }
    addEventListener() {}
    dispatchEvent() {}
    getContext() { 
        return { 
            createImageData: () => ({ data: [] }), 
            putImageData: () => {},
            clearRect: () => {},
            beginPath: () => {},
            moveTo: () => {},
            lineTo: () => {},
            closePath: () => {},
            fill: () => {},
            stroke: () => {},
            fillRect: () => {},
            fillText: () => {},
            drawImage: () => {}
        }; 
    }
}

const mockedElements = {};
global.document = {
    getElementById: (id) => {
        if (!mockedElements[id]) mockedElements[id] = new MockElement(id);
        return mockedElements[id];
    },
    createElement: () => new MockElement('temp'),
    addEventListener: () => {}, // For DOMContentLoaded
    querySelectorAll: () => [],
    querySelector: () => new MockElement('temp')
};

global.OffscreenCanvas = class {
    getContext() { 
        return { 
            createImageData: () => ({ data: [] }), 
            putImageData: () => {},
            clearRect: () => {},
            beginPath: () => {},
            moveTo: () => {},
            lineTo: () => {},
            closePath: () => {},
            fill: () => {},
            stroke: () => {}
        }; 
    }
};

// 2. Load the actual web app source code files
const configCode = fs.readFileSync(path.join(__dirname, 'config.js'), 'utf8');
let scriptCode = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');

// No source code regex modifications needed! The WebApp uses a modular initializeSimulationCore().

// Optional optimizations: inject functions from optimized_functions.js into scriptCode.
// These shadow script.js functions via last-declaration-wins.
// Controlled by the -optimized CLI flag (default: true).
// If disabled, file missing, or empty, the original script.js functions are used.
if (global.useOptimized) {
    try {
        scriptCode += fs.readFileSync(path.join(__dirname, 'optimized_functions.js'), 'utf8');
    } catch (e) {
        // No optimized_functions.js - use original script.js (no-op)
    }
}

// Inject some variables that were defined locally inside DOMContentLoaded but are used globally
scriptCode = `
global.historyStepBackButton = document.getElementById('historyStepBackButton');
global.historyStepForwardButton = document.getElementById('historyStepForwardButton');
` + scriptCode;

// 3. Execution Engine Code (Appended and evaluated together to share scope)
global.__HEADLESS_CRITICAL_ONLY = false;
const cliCode = `
const fs = require('fs');
const path = require('path');
const msgpack = require('./libs/msgpack.min.js');

let bft6Fd = null;
let bft6ArrayLengthPos = 0;
let bft6TotalFrames = 0;

async function offloadHistoryToDB() {
    if (!bft6Fd) return;
    const allKeys = [...simState.optimizedHistoryFrames.keys()].sort((a, b) => a - b);
    if (allKeys.length === 0) return;
    
    for (const key of allKeys) {
        const frame = simState.optimizedHistoryFrames.get(key);
        const encoded = msgpack.encode(frame);
        fs.writeSync(bft6Fd, encoded);
        bft6TotalFrames++;
    }
    
    simState.optimizedHistoryFrames.clear();
    simState.capturedHistoryTotalSize = 0; // reset trigger
}

async function runCLI() {
    console.log("==================================================");
    console.log(" BacFighT6 CLI Headless Engine");
    console.log("==================================================");
    console.log("Settings Source: ", global.window.location.search);

    console.log("DEBUG: Calling initializeSimulationCore...");
    await initializeSimulationCore();
    console.log("DEBUG: initializeSimulationCore finished!");

    const totalMinutes = simState.config.simulationControl.totalSimulationMinutes;
    if (!totalMinutes || totalMinutes <= 0) {
        console.error("Error: Simulation_Duration_Minutes must be > 0. Pass it in the arguments.");
        process.exit(1);
    }

    console.log("Initializing Arena (Radius: " + simState.config.hexGridActualRadius + ")...");
    simState.isInitialized = true;
    simState.isRunning = true;
    
    console.log(\`\\nStarting simulation for \${totalMinutes} steps...\\n\`);

    // Check for history params anywhere in the URL
    for (let i = 2; i < process.argv.length; i++) {
        const arg = process.argv[i];
        if (arg === '-output' || arg === '-winner' || arg === '-optimized' || arg === '-settings' || arg === '-arena') {
            i++;
        }
        if (arg.includes('Simulation_History_Record_Rate')) {
            simState.config.historyEnabled = true;
            break;
        }
    }
    
    const nowObj = new Date();
    const yy = String(nowObj.getFullYear()).slice(-2);
    const mm = String(nowObj.getMonth() + 1).padStart(2, '0');
    const dd = String(nowObj.getDate()).padStart(2, '0');
    const hh = String(nowObj.getHours()).padStart(2, '0');
    const min = String(nowObj.getMinutes()).padStart(2, '0');
    const ss = String(nowObj.getSeconds()).padStart(2, '0');
    const timestamp = yy + mm + dd + hh + min + ss;
    const sessionId = timestamp + "_" + process.pid;
    let outputDir = global.outputDir;
    if (!fs.existsSync(outputDir)) { fs.mkdirSync(outputDir, { recursive: true }); }
    
    let bft6Name = "";
    if (simState.config.historyEnabled) {
        bft6Name = path.join(outputDir, sessionId + '_history_steps_00000_to_' + String(totalMinutes).padStart(5, '0') + '.bft6');
        bft6Fd = fs.openSync(bft6Name, 'w');
        
        fs.writeSync(bft6Fd, new Uint8Array([0x84]));
        
        const encodeStr = (str) => msgpack.encode(str);
        fs.writeSync(bft6Fd, encodeStr("schema_version"));
        fs.writeSync(bft6Fd, msgpack.encode(3));
        fs.writeSync(bft6Fd, encodeStr("cell_schema"));
        fs.writeSync(bft6Fd, msgpack.encode(CELL_SCHEMA));
        fs.writeSync(bft6Fd, encodeStr("settingsTSV"));
        fs.writeSync(bft6Fd, msgpack.encode(generateSettingsTSV()));
        fs.writeSync(bft6Fd, encodeStr("history"));
        
        // Write placeholder for array length (0xdd followed by 4 zeros)
        const placeholder = new Uint8Array([0xdd, 0x00, 0x00, 0x00, 0x00]);
        bft6ArrayLengthPos = fs.fstatSync(bft6Fd).size; // Get exact offset before placeholder
        fs.writeSync(bft6Fd, placeholder);
    }
    
    // Force zero delay and mock setTimeout to run as fast as possible in CLI
    simState.config.simulationControl.stepDelayMs = 0;
    global.setTimeout = (fn, delay) => { };
    
    let lastPrintTime = Date.now();
    const simStartTimeMs = Date.now();
    let winnerDecidedStep = null;
    let exactWinnerString = null;
    
    while (simState.simulationStepCount <= totalMinutes && simState.isRunning) {
        await runSimulationStep();

        const lastData = simState.historicalData[simState.historicalData.length - 1];
        
        // 1. Precise Early-Exit Winner Detection
        if (winnerDecidedStep === null) {
            let typesAlive = 0;
            let attFound = false, preyFound = false, defFound = false;
            const currentGridRadius = simState.config.hexGridActualRadius;
            
            for (const c of simState.cells.values()) {
                if (c.isDead || c.isLysing || c.isEffectivelyGone || !isWithinHexBounds(c.q, c.r, currentGridRadius)) continue;
                if (!attFound && c.type === 'attacker') { attFound = true; typesAlive++; }
                else if (!preyFound && c.type === 'prey') { preyFound = true; typesAlive++; }
                else if (!defFound && c.type === 'defender') { defFound = true; typesAlive++; }
                
                if (typesAlive > 1) break; // Instantly abort check, no winner yet!
            }
            
            if (typesAlive <= 1) {
                winnerDecidedStep = simState.simulationStepCount - 1; 
                let winnerString = "Empty Grid (Draw)";
                if (attFound) winnerString = "Attackers";
                else if (preyFound) winnerString = "Prey";
                else if (defFound) winnerString = "Defenders";
                
                exactWinnerString = winnerString;
            }
        }

        if (global.stopOnWinner) {
            // 2. Safely break on the STRICTLY NEXT recording boundary
            const stepJustFinished = simState.simulationStepCount - 1;
            if (winnerDecidedStep !== null && stepJustFinished > winnerDecidedStep && stepJustFinished % (simState.config.historyRecordRate || 1) === 0) {
                let winner = "Empty Grid (Draw)";
                if (lastData) {
                    if (lastData.liveAttackers > 0) winner = "Attackers Won";
                    else if (lastData.livePrey > 0) winner = "Prey Won";
                    else if (lastData.liveDefenders > 0) winner = "Defenders Won";
                }
                console.log('\\nSimulation stopped early: ' + winner + '! (Winner at step ' + winnerDecidedStep + ', stopped at ' + stepJustFinished + ')');
                break;
            }
        }
        
        // Yield to event loop every 100 steps to let Node GC breathe
        if (simState.simulationStepCount % 100 === 0) {
            await new Promise(resolve => setImmediate(resolve));
        }

        const now = Date.now();
        if (now - lastPrintTime >= 1000 || simState.simulationStepCount === totalMinutes) {
            lastPrintTime = now;
            const percent = Math.floor((simState.simulationStepCount / totalMinutes) * 100);
            const bar = '█'.repeat(Math.floor(percent / 5)) + '░'.repeat(20 - Math.floor(percent / 5));
            let preyCount = 0, attCount = 0, defCount = 0;
            for (let c of simState.cells.values()) {
                if (!isWithinHexBounds(c.q, c.r, simState.config.hexGridActualRadius) || c.isEffectivelyGone) continue;
                if (c.isDead || c.isLysing) continue;
                if (c.type === 'prey') preyCount++;
                else if (c.type === 'attacker') attCount++;
                else if (c.type === 'defender') defCount++;
            }
            let extra = "   ";
            if (winnerDecidedStep !== null) extra = " | Winner: " + exactWinnerString + " @" + winnerDecidedStep + "   ";
            process.stdout.write("\\r[" + bar + "] " + percent + "% | Step: " + simState.simulationStepCount + "/" + totalMinutes + " | Att: " + attCount + ", Prey: " + preyCount + ", Def: " + defCount + extra);
        }
    }
    console.log(); 
    
    const simEndTimeMs = Date.now();
    const simElapsedMs = simEndTimeMs - simStartTimeMs;
    simState.isRunning = false;

    function formatTime(ms) {
        let s = Math.floor(ms / 1000);
        let m = Math.floor(s / 60);
        let h = Math.floor(m / 60);
        s %= 60;
        m %= 60;
        const msLeft = ms % 1000;
        let parts = [];
        if (h > 0) parts.push(h + ' h');
        if (m > 0 || h > 0) parts.push(m + ' m');
        if (s > 0 || m > 0 || h > 0) parts.push(s + ' s');
        parts.push(msLeft + ' ms');
        return parts.join(' ');
    }

    console.log("\\nSimulation Complete in: " + formatTime(simElapsedMs));

    function generateTSVOutput() {
        const lines = [];
        const headers = ['Time', 'LiveAttackers', 'LivePrey', 'LiveDefenders', 'DeadLysingAttackers', 'DeadLysingPrey', 'DeadLysingDefenders', 'CumulativeFirings', 'CumulativeAttKilled', 'CumulativePreyKilled', 'CumulativeDefKilled', 'CumulativeAttLysed', 'CumulativePreyLysed', 'CumulativeDefLysed', 'CPRGConverted'];
        lines.push(headers.join("\\t")); 
        for (const row of simState.historicalData) {
            const values = [ row.time, row.liveAttackers, row.livePrey, row.liveDefenders, row.deadLysingAttackers, row.deadLysingPrey, row.deadLysingDefenders, row.firings, row.killedAttackers, row.killedPrey, row.killedDefenders, row.lysedAttackers, row.lysedPrey, row.lysedDefenders, row.cprgConverted ];
            lines.push(values.map(val => (val !== undefined && val !== null) ? val : '').join("\\t")); 
        }
        return lines.join("\\n") + "\\n";
    }

    console.log("Generating Data Table...");
    
    const tsvData = generateTSVOutput();
    const statsFilename = path.join(outputDir, sessionId + '_data_table.tsv');
    fs.writeFileSync(statsFilename, tsvData);
    console.log("Saved: " + statsFilename);

    if (simState.config.historyEnabled && bft6Fd) {
        console.log("Finalizing .bft6 history file...");
        await offloadHistoryToDB(); // flush remaining

        // Overwrite the placeholder array length with actual 32-bit big-endian length
        const lengthBuffer = new Uint8Array([0xdd, (bft6TotalFrames >> 24) & 0xff, (bft6TotalFrames >> 16) & 0xff, (bft6TotalFrames >> 8) & 0xff, bft6TotalFrames & 0xff]);
        fs.writeSync(bft6Fd, lengthBuffer, 0, 5, bft6ArrayLengthPos);
        
        fs.closeSync(bft6Fd);
        bft6Fd = null;
        console.log("Saved: " + bft6Name);
    } else {
        console.log("History saving was disabled or no frames were recorded.");
    }
    
    // Generate text report
    const reportName = path.join(outputDir, sessionId + '_report.txt');
    let reportTxt = "Simulation Report\\n";
    
    const lastData = simState.historicalData.length > 0 ? simState.historicalData[simState.historicalData.length - 1] : null;
    if (lastData) {
        let typesAlive = 0;
        let winner = "Draw (Multiple surviving strains)";
        if (lastData.liveAttackers > 0) { typesAlive++; winner = "Attackers"; }
        if (lastData.livePrey > 0) { typesAlive++; winner = "Prey"; }
        if (lastData.liveDefenders > 0) { typesAlive++; winner = "Defenders"; }
        if (typesAlive > 1) winner = "Draw (Multiple surviving strains)";
        if (typesAlive === 0) winner = "Extinction (No survivors)";
        if (global.stopOnWinner && typesAlive <= 1) winner = "Simulation Stopped by Winner (" + winner + ")";
        
        reportTxt += "Outcome: " + winner + "\\n\\n";
		reportTxt += "Settings: " + global.window.location.search + "\\n\\n";
        reportTxt += "Seed: " + global.document.getElementById('simulationSeedInput').value + "\\n\\n";
        reportTxt += "Duration: " + (lastData ? lastData.time : 0) + " minutes\\n\\n";
        if (winnerDecidedStep !== null) {
            reportTxt += "Winner decided: " + winnerDecidedStep + " minutes\\n\\n";
        }
        reportTxt += "Calculation Time (s): " + (simElapsedMs / 1000).toFixed(2) + "\\n\\n";
        
        reportTxt += "Remaining - Attackers: " + lastData.liveAttackers.toLocaleString('en-US') + "; Prey: " + lastData.livePrey.toLocaleString('en-US') + "; Defenders: " + lastData.liveDefenders.toLocaleString('en-US') + "\\n\\n";
        reportTxt += "Dead/Lysing - Attackers: " + lastData.deadLysingAttackers.toLocaleString('en-US') + "; Prey: " + lastData.deadLysingPrey.toLocaleString('en-US') + "; Defenders: " + lastData.deadLysingDefenders.toLocaleString('en-US') + "\\n\\n";
        reportTxt += "Cumulative Killed - Attackers: " + lastData.killedAttackers.toLocaleString('en-US') + "; Prey: " + lastData.killedPrey.toLocaleString('en-US') + "; Defenders: " + lastData.killedDefenders.toLocaleString('en-US') + "\\n\\n";
        reportTxt += "Cumulative Lysed - Attackers: " + lastData.lysedAttackers.toLocaleString('en-US') + "; Prey: " + lastData.lysedPrey.toLocaleString('en-US') + "; Defenders: " + lastData.lysedDefenders.toLocaleString('en-US') + "\\n\\n";
        reportTxt += "Cumulative T6SS Firings (All Types): " + lastData.firings.toLocaleString('en-US') + "\\n\\n";
        reportTxt += "Total CPRG Converted: " + lastData.cprgConverted.toLocaleString('en-US') + "\\n";
    }
    
    fs.writeFileSync(reportName, reportTxt);
    console.log("Saved: " + reportName);

    console.log("Done.");
}

runCLI().catch(e => console.error("Fatal Error: " + e.stack));


// --- STUBS: Override browser/UI functions from script.js (last-declaration-wins) ---
// CRITICAL: These MUST be stubbed or headless crashes (no canvas/IndexedDB/file APIs)
function drawGrid() {}
function drawArenaOnContext() {}
function drawHexagonOutline() {}
function drawHexagon() {}
function drawFilledHexagon() {}
function captureArenaImage() {}
function captureArenaImageForState() {}
function saveFile() {}
function exportCurrentStepState() {}
function generateShareableLink() {}
function getDirectoryHandle() { return null; }
function loadFullSimulationFromFile() {}
function importStepStateFromFile() {}
async function offloadImagesToDB() {}
async function offloadArenaStatesToDB() {}
async function truncateFutureHistory() {}
async function getHistoryFrame() { return null; }
async function getHistoryFramesBatch() { return []; }
async function getArenaStateFrame() { return null; }
async function getDB() { return { clearAll: async () => {} }; }
function showInfoAlert() { return Promise.resolve(); }
function showLinkModal() {}
function playHistory() {}
function stopHistory() {}
function advanceHistoryStep() {}
function renderImagesFromHistory() {}

// OPTIONAL: Performance stubs. May break simulation if mis-categorized.
// Set global.__HEADLESS_CRITICAL_ONLY = true to disable all optional stubs.
if (!__HEADLESS_CRITICAL_ONLY) {
    function updateStats() {}
    function updateButtonStatesAndUI() {}
    function updateTimeTravelSlider() {}
    function updateHoverInfoPanel() {}
    function updateImportSessionProgress() {}
    function updateRenderHistoryProgress() {}
    function updateSaveProgress() {}
    function updateRenderRangeInputs() {}
    function showConfirmationModal() { return Promise.resolve(true); }
    function promptForBatchSave() {}
    function downloadImagesAsZIP() {}
    function downloadArenaStatesAsZIP() {}
    function downloadDataAsTSV() {}
    function downloadSettingsAsTSV() {}
    function displayGraph() {}
    function handleSaveArenaStateToManual() {}
    function handleSaveAllData() {}
    function updateSliderDisplay() {}
    function updateBattleRoyaleSliders() {}
    function updatePercentFullDisplay() {}
    function setActivePresetGroup() {}
    function setActiveSubtypeButton() {}
    function updateUiFromState() {}
    function handleTimeTravelScrub() {}
    function setupCanvasAndHexSize() {}
    function updateMainCanvasSizing() {}
    function rebuildPixelCoordinatesCache() {}
    function handleCanvasHover() {}
    function setupTooltips() {}
    function performManualActionAtCoordinates() {}
}
// Always stub these (safe - never affect simulation state)
function rebuildEmptyGridCanvas() {}
function handleLoadArenaStateFromTSV() {}
function rebuildPixelCoordinatesCache() {}
function synchronizeRNG() {}
function checkForRngSpike() {}
function generateTimestamp() { return Date.now().toString(); }
function restoreStateForResume() { simState.isInitialized = true; }

`;

// Write to a temporary file and require it so V8 can fully JIT optimize it (eval disables some TurboFan optimizations)
const tempFilename = path.join(__dirname, `cli_engine_compiled_${process.pid}.js`);
fs.writeFileSync(tempFilename, configCode + "\n" + scriptCode + "\n" + cliCode);
require(tempFilename);
try {
    fs.unlinkSync(tempFilename);
} catch (e) {
    // Ignore cleanup errors
}

