# BacFighT6 CLI Engine

The BacFighT6 Command Line Interface (CLI) Engine is a headless, highly optimized environment designed for running massive batch simulations of the BacFighT6 model.

## Perfect WebApp Compatibility

This CLI is meticulously designed to **maintain 100% perfect compatibility with the BacFighT6 WebApp**. 
It runs by directly importing and wrapping the exact same `script.js` core file used by the browser application. Because it shares the identical underlying engine, physics, and pseudo-random number generators (PRNG), the CLI guarantees that a simulation run via the command line will yield the exact same deterministic results (and `.bft6` visual playbacks) as running the same parameters in your browser.

## High-Performance Execution

- **Zero Rendering Overhead**: The CLI safely neuters and strips all HTML DOM interactions, canvas drawing routines, and UI update loops from the engine, allowing your CPU to dedicate 100% of its power directly to the mathematical simulation.
- **Infinite Streaming I/O**: Instead of holding history playback frames in memory, the CLI natively inherits the WebApp's 1200MB memory buffering logic. It dynamically streams and flushes recorded frames directly to your hard drive on-the-fly, completely bypassing Node.js memory limits. This allows you to generate mathematically unlimited `.bft6` file sizes (e.g., 30GB+) for days-long simulations without crashing or slowing down.
- **Parallel Safety**: The CLI utilizes PID (Process ID) sandboxing for its dynamic compilation, meaning you can safely run 10, 20, or 100 instances of the CLI in parallel simultaneously without them crashing or interfering with each other's execution context.

## Usage

You can run a simulation by passing standard BacFighT6 URL query string parameters directly to the `headless.js` script. 

### Basic Syntax

    node headless.js [OPTIONS] "ParameterString"

### Options

| Flag | Argument | Description |
|---|---|---|
| `-output` | `<directory_name>` | Defines the output folder for the resulting files. If the folder does not exist, the CLI will create it automatically. (Default: `.`) |
| `-winner` | `true` or `false` | When set to `true`, the CLI will automatically monitor the simulation and trigger an early stop if only one (or zero) cell types remain alive on the grid. It gracefully waits for the next exact history recording interval before exiting so the final frame is guaranteed to be saved. (Default: `false`) |
| `-optimized <bool>` | `true` or `false` | Load `optimized_functions.js`. Default: `true` |
| `-settings` | `<file_path.tsv>` | Pass the path to a `.tsv` settings file (exported from the WebApp) to automatically override the default configuration parameters with the settings contained in the file. |
| `-arena` | `<file_path.tsv>` | Pass the path to a `.tsv` arena file (exported from the WebApp) to trigger manual placement mode and spawn cells exactly where they are defined in the file. |

Any remaining arguments are treated as simulation parameters (e.g. `Simulation_Seed=42&preset=battleroyale`).

### Setting Parameters

The parameter string format is identical to the URL parameters used to share setups in the WebApp. It must be wrapped in quotes `""`. 
Any setting you define in the parameter string overrides the preset's defaults.

**Important Parameters to Note:**
- `Simulation_Duration_Minutes`: You **must** provide this to tell the CLI how long to run!
- `Simulation_History_Record_Rate`: Adding this parameter automatically enables full `.bft6` history recording at the given step interval. If omitted, only the `.tsv` statistics file is generated.
- `Simulation_Render_Rate_every_N_steps` and `Simulation_Step_Delay_ms`: These are completely overridden by the CLI. The engine is hardcoded to run at 0ms delay and bypass rendering loops entirely.

### Example Commands

**1. Run a silent background simulation (stats only):**

    node --max-old-space-size=8192 headless.js -output "batch_results" "Simulation_Duration_Minutes=500&Simulation_Seed=42&preset=battleroyale"

**2. Run a full visual history recording that stops early when a winner emerges:**

    node --max-old-space-size=8192 headless.js -output "visual_outputs" -winner true "Simulation_Duration_Minutes=1000&Simulation_Seed=999&preset=default&Simulation_History_Record_Rate=10"

**3. Run a simulation using WebApp exported settings and arena files:**

    node --max-old-space-size=8192 headless.js -output "results" -settings "my_settings.tsv" -arena "my_arena.tsv"

**4. Benchmark original vs optimized engine:**

    node --max-old-space-size=8192 headless.js -output "opt_run" -optimized true ...   # uses optimized_functions.js (default)
    node --max-old-space-size=8192 headless.js -output "orig_run" -optimized false ... # uses original script.js only

> [!IMPORTANT]
> Because the WebApp defaults to buffering up to `1200 MB` of history data before saving, and V8's internal objects have high memory overhead, you **should** run the CLI with the `node --max-old-space-size=8192` flag to increase Node's RAM limit to 8 GB. If you omit this, Node may crash with a `JavaScript heap out of memory` error.

## Outputs

When a simulation finishes, the CLI outputs up to three files seamlessly to your requested `-output` directory using the standard WebApp timestamp format: `[YYMMDDHHMMSS]_[PID]`

1. `[TIMESTAMP]_[PID]_report.txt`: A clean, readable summary text file identical to the WebApp's Simulation Report. Includes Time Elapsed, Settings, final Populations, Outcomes, and Cumulative Kills/Lysed numbers.
2. `[TIMESTAMP]_[PID]_data_table.tsv`: A full statistics table logging the live populations, deaths, lysed states, and CPRG converted states over time.
3. `[TIMESTAMP]_[PID]_history_steps_00000_to_01000.bft6`: (Only if `Simulation_History_Record_Rate` is specified) A flawlessly formatted binary history file that can be dragged and dropped into the BacFighT6 WebApp for 3D visual playback. *(Note: Browsers physically restrict loading ArrayBuffers over ~2GB. Keep your Record_Rate high if running massive simulations so the WebApp can still open the resulting file!)*

## Batch Execution & Utilities

To run massive experimental batches and analyze their outcomes, the CLI includes a dedicated Node.js Orchestrator, a per-folder batch summarizer, and a cross-folder aggregator.

### 1. Parallel Node.js Orchestrator (run_parallel.js)

The `run_parallel.js` script is a high-performance, dynamic task manager that allows you to run thousands of BacFighT6 simulations across multiple CPU cores simultaneously. It runs entirely inside a single terminal window.

**Key Features:**
* **Dynamic Job Queue:** Uses a shared worker pool rather than fixed assignments. If one simulation finishes instantly while another takes an hour, the fast worker immediately grabs the next seed from the queue. Zero CPU idle time.
* **Live Terminal Dashboard:** Replaces spammy console logs with a clean, static, real-time UI showing the exact progress bar, time elapsed, and seed of every active worker.
* **Auto-Memory Management:** Automatically injects the `--max-old-space-size=8192` flag into every child process to prevent V8 memory crashes.
* **Auto-Summarizer:** Instantly compiles all results into a single `.tsv` spreadsheet the second the final simulation finishes.
* **Winner Tracking:** If `-winner true` is used, the orchestrator records both the actual simulation duration (`Iterations Saved`) and the early-stop time (`Iterations`) in the batch summary.

**Basic Syntax:**

    node run_parallel.js [OPTIONS]

**Orchestrator Options:**
* **--workers** (Default: `8`): The number of parallel CPU threads to spawn.
* **--iterations** (Default: `100`): The total number of simulations to run across all workers.
* **--outdir** (Default: `c:\_Temp`): The directory where all output files and the final summary will be saved.
* **--params** (Default: `"preset=battleroyale"`): The standard BacFighT6 URL query string (must be in quotes).
* **--winner** (Default: `true`): Passed directly to `headless.js`. If `true`, simulations stop early when a winner emerges.
* **--optimized** (Default: `true`): Passed to `headless.js`. Set `false` to skip `optimized_functions.js`.
* **--summarize** (Default: `true`): If `true`, the orchestrator automatically generates a master `.tsv` summary file of all completed reports before shutting down.
* **--startseed** (Default: 1): The starting number for the sequential seed generator. Useful for continuing previous batches without reusing the same seeds.


**Batch Summary TSV Columns:**
| Column | Description |
|---|---|
| File Name Prefix | Generated timestamp + PID identifier |
| Seed | The simulation seed |
| Settings | Full URL query parameters used |
| Total Steps | Actual simulation steps completed (minutes or `N/A`) |
| Winner Decided Step | Winner decision step, or `N/A` if no early winner |
| Calculation Time | Runtime in seconds (e.g., `5m 24s` or `324.5`) |
| LiveAttackers | Final attacker count on the grid |
| LivePrey | Final prey count on the grid |
| LiveDefenders | Final defender count on the grid |
| Winner | Outcome string (e.g., `Attackers`, `Draw (Multiple surviving strains)`) |

**Example Commands:**

Run a massive, 5,000-iteration batch overnight utilizing 16 CPU cores:

    node run_parallel.js --workers 16 --iterations 5000 --outdir "C:\_Temp\MassiveRun" --params "preset=battleroyale&Prey_Toxin_Start_Probability_Percent=0.01&Simulation_Duration_Minutes=500000"

Run a quick test forcing the simulations to run to the time limit without stopping early:

    node run_parallel.js --workers 4 --iterations 50 --winner false --params "preset=default&Simulation_Duration_Minutes=500"

Continue a previous batch of 1,000 simulations by shifting the starting seed to 1001:

	node run_parallel.js --workers 16 --iterations 1000 --startseed 1001 --outdir "C:\_Temp\Batch_Part2" --params "preset=battleroyale"

---

### 2. Universal Batch Summarizer (universal_summary.py)

This script scans a parent directory and all of its subfolders directly for `_report.txt` files. It completely bypasses the need for intermediate TSV files, making it highly robust.

**It performs two tasks simultaneously:**
1. **Local Summaries:** For every folder it finds reports in, it extracts the data and generates a `batch_summary_YYYYMMDDHHMMSS.tsv` file inside that folder.
2. **Master Cross-Batch Summary:** It aggregates the statistics for every folder and saves a single `universal_cross_summary_YYYYMMDDHHMMSS.tsv` file at the root of the parent directory.

**Usage:**

    pixi exec python universal_summary.py "c:\_Temp\MyMassiveExperiment"

**Two-section cross-batch output format:**

**Section 1 — Summary statistics per folder:**
| Column | Description |
|---|---|
| Folder | Subfolder name |
| Runs | Total number of successful simulations found in this folder |
| Settings | Settings string from the first run found |
| Calc Time (s) | Total cumulative runtime |
| Attackers / Prey / Defenders / Extinction / Att+Prey / Att+Def / Prey+Def / Att+Prey+Def | Outcome counts |

**Section 2 — Per-run iteration values (after a blank separator line):**

Each folder gets one row listing the iteration value (either the Winner Decided Step, or the Total Steps if no winner) for every run in that folder, separated by tabs. This is specifically formatted for easy copy-pasting into graphing software for survival/time-to-extinction plots.