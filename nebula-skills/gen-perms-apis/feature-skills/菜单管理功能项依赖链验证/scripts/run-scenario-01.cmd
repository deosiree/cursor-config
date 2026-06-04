@echo off
powershell -Command "$script = [System.IO.File]::ReadAllText('%~dp0run-scenario.js'); & opencli --profile p2ejw7ww browser admin eval $script"
