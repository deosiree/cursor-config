"""Run one E2E scenario via opencli."""
import sys, subprocess, json, os, tempfile

scenario_file = sys.argv[1]
profile = sys.argv[2] if len(sys.argv) > 2 else 'p2ejw7ww'
script_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'run-scenario.js')

# Read scenario config
with open(scenario_file, 'r', encoding='utf-8') as f:
    scenario = json.load(f)

# Read script
with open(script_file, 'r', encoding='utf-8') as f:
    script = f.read()

opencli = r'C:\Program Files\nodejs\opencli.cmd'

# Build combined JS: inject scenario + run script
combined = f'window.__SCENARIO__ = {{check:{json.dumps(scenario["check"])}}};\n' + script

# Write to temp file
tmp = tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False, encoding='utf-8')
tmp.write(combined)
tmp_path = tmp.name
tmp.close()

# Use opencli eval with file via stdin redirect? No, opencli eval < file doesn't work.
# Let me try -f or --file flag if exists
result = subprocess.run([opencli, '--profile', profile, 'browser', 'admin', 'eval', combined],
                       capture_output=True, text=True)
os.unlink(tmp_path)

print(result.stdout)
if result.stderr:
    print('STDERR:', result.stderr.strip())
