import sys
import os
import glob
import re
from datetime import datetime
from collections import defaultdict

def classify_outcome(att, prey, defender):
    counts = sum(1 for x in [att, prey, defender] if x > 0)
    if counts == 0: return "Extinction"
    if counts == 1:
        if att > 0: return "Attackers"
        if prey > 0: return "Prey"
        if defender > 0: return "Defenders"
    if counts == 2:
        if att > 0 and prey > 0: return "Att+Prey"
        if att > 0 and defender > 0: return "Att+Def"
        if prey > 0 and defender > 0: return "Prey+Def"
    if counts == 3: return "Att+Prey+Def"
    return "Unknown"

def parse_calc_time(text):
    text = text.strip()
    if "h" in text or "ms" in text:
        total = 0.0
        for nm in re.finditer(r"([\d.]+)", text):
            val = float(nm.group(1))
            after = text[nm.start():]
            if re.match(r"[\s]*h\b", after): total += val * 3600
            elif re.match(r"[\s]*m\b(?!s)", after): total += val * 60
            elif re.match(r"s\b", after): total += val
            elif re.match(r"ms\b", after): total += val / 1000.0
            else: total += val
        return total
    return float(text)

def process_folder(folder_path, timestamp):
    report_pattern = os.path.join(folder_path, "*_report.txt")
    report_files = glob.glob(report_pattern)
    if not report_files:
        return None
        
    headers = [
        "File Name Prefix", "Seed", "Settings", "Total Steps",
        "Winner Decided Step", "Calculation Time", "LiveAttackers",
        "LivePrey", "LiveDefenders", "Winner"
    ]
    results = []
    runs_for_cross_batch = []
    
    for file_path in report_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            file_prefix = os.path.basename(file_path).replace('_report.txt', '')

            # Default values
            seed = "N/A"
            settings = "N/A"
            total_steps = "N/A"
            winner_decided_step = "N/A"
            calc_time = "N/A"
            attackers = "N/A"
            prey = "N/A"
            defenders = "N/A"
            winner = "N/A"

            # Parse Outcome (Winner)
            match = re.search(r'Outcome:\s*(.+)', content)
            if match: winner = match.group(1).strip()
            
            # Parse Settings
            match = re.search(r'Settings:\s*(.+)', content)
            if match: settings = match.group(1).strip()

            # Parse Seed
            match = re.search(r'Seed:\s*(.+)', content)
            if match: seed = match.group(1).strip()

            # Parse Total Steps (Duration)
            match = re.search(r'Duration:\s*(\d+)\s*minutes', content)
            if match: total_steps = match.group(1).strip()
            
            # Parse Winner Decided Step
            match = re.search(r'Winner decided:\s*(\d+)\s*minutes', content)
            if match: winner_decided_step = match.group(1).strip()

            # Parse Calculation Time 
            match = re.search(r'Calculation Time(?:\s*\(s\))?:\s*(.+)', content)
            if match: calc_time = match.group(1).strip()

            # Parse Remaining Populations
            match = re.search(r'Remaining - Attackers:\s*([\d,]+);\s*Prey:\s*([\d,]+);\s*Defenders:\s*([\d,]+)', content)
            if match:
                attackers = match.group(1).replace(',', '').strip()
                prey = match.group(2).replace(',', '').strip()
                defenders = match.group(3).replace(',', '').strip()

            results.append({
                "File Name Prefix": file_prefix,
                "Seed": seed,
                "Settings": settings,
                "Total Steps": total_steps,
                "Winner Decided Step": winner_decided_step,
                "Calculation Time": calc_time,
                "LiveAttackers": attackers,
                "LivePrey": prey,
                "LiveDefenders": defenders,
                "Winner": winner
            })
            
            # Data for cross batch
            c_att = int(attackers) if attackers != "N/A" else 0
            c_prey = int(prey) if prey != "N/A" else 0
            c_def = int(defenders) if defenders != "N/A" else 0
            c_calc_time = parse_calc_time(calc_time) if calc_time != "N/A" else 0.0
            
            # Use winner_decided_step if available, else total_steps
            iters = 0
            if winner_decided_step != "N/A":
                iters = int(winner_decided_step)
            elif total_steps != "N/A":
                iters = int(total_steps)
                
            runs_for_cross_batch.append({
                "outcome": classify_outcome(c_att, c_prey, c_def),
                "calc_time": c_calc_time,
                "settings": settings,
                "iterations": iters
            })
            
        except Exception as e:
            print(f"  Warning: Could not parse {file_path}. Error: {e}")

    # Write batch summary
    output_filename = f"batch_summary_{timestamp}.tsv"
    output_path = os.path.join(folder_path, output_filename)
    try:
        with open(output_path, 'w', encoding='utf-8') as out_f:
            out_f.write("\t".join(headers) + "\n")
            for r in results:
                row = [
                    r["File Name Prefix"], r["Seed"], r["Settings"], 
                    r["Total Steps"], r["Winner Decided Step"], r["Calculation Time"],
                    r["LiveAttackers"], r["LivePrey"], r["LiveDefenders"], r["Winner"]
                ]
                out_f.write("\t".join(row) + "\n")
        print(f"  Saved local batch summary: {output_path}")
    except Exception as e:
        print(f"  Error saving summary: {e}")
        
    return runs_for_cross_batch

def main(parent_dir):
    if not os.path.isdir(parent_dir):
        print(f"Error: Directory '{parent_dir}' does not exist.")
        sys.exit(1)
        
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    
    # Collect parent directory and all subdirectories
    folders_to_check = [parent_dir]
    for root, dirs, files in os.walk(parent_dir):
        for d in dirs:
            folders_to_check.append(os.path.join(root, d))
            
    # Remove duplicates and sort
    folders_to_check = sorted(list(set(folders_to_check)))
    
    cross_results = []
    
    print(f"Scanning for _report.txt files in {parent_dir} and its subdirectories...\n")
    
    for folder in folders_to_check:
        runs = process_folder(folder, timestamp)
        if runs and len(runs) > 0:
            folder_name = os.path.basename(folder)
            if folder == parent_dir:
                folder_name = os.path.basename(os.path.abspath(folder)) + " (Root)"
                
            outcome_counts = defaultdict(int)
            for r in runs:
                outcome_counts[r["outcome"]] += 1
                
            total_calc_time = sum(r["calc_time"] for r in runs)
            settings = runs[0]["settings"]
            iteration_values = [r["iterations"] for r in runs]
            
            cross_results.append({
                "folder": folder_name,
                "runs": len(runs),
                "settings": settings,
                "calc_time": round(total_calc_time, 2),
                "outcomes": outcome_counts,
                "iterations": iteration_values,
            })
            print(f"Processed '{folder_name}' folder: {len(runs)} successful runs.")

    if not cross_results:
        print("\nNo valid _report.txt files found in any folders. Exiting.")
        sys.exit(0)
        
    summary_file = os.path.join(parent_dir, f"universal_cross_summary_{timestamp}.tsv")
    outcome_labels = ["Attackers", "Prey", "Defenders", "Extinction",
                      "Att+Prey", "Att+Def", "Prey+Def", "Att+Prey+Def"]
                      
    with open(summary_file, "w", encoding="utf-8") as out_f:
        out_headers = ["Folder", "Runs", "Settings", "Calc Time (s)"] + outcome_labels
        out_f.write("\t".join(out_headers) + "\n")
        
        for r in cross_results:
            row = [r["folder"], str(r["runs"]), r["settings"], str(r["calc_time"])]
            for label in outcome_labels:
                row.append(str(r["outcomes"].get(label, 0)))
            out_f.write("\t".join(row) + "\n")
            
        out_f.write("\n")
        
        for r in cross_results:
            row = [r["folder"]] + [str(v) for v in r["iterations"]]
            out_f.write("\t".join(row) + "\n")
            
    print(f"\n✅ All Done! Master Cross-Batch Summary saved to: {summary_file}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: pixi exec python universal_summary.py <parent_folder>")
        print()
        print("Scans parent folder and subfolders for *_report.txt files.")
        print("Automatically generates per-folder summaries and a master cross-batch summary.")
        sys.exit(1)
    
    parent_dir = sys.argv[1]
    main(parent_dir)
