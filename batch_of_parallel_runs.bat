@echo off

node run_parallel.js --workers 16 --iterations 100 --outdir "c:\_Temp\TP0005" --startseed 1001 --params "preset=battleroyale&Prey_Toxin_Start_Probability_Percent=0.005&Simulation_Duration_Minutes=1000000&Simulation_History_Record_Rate=100"

node run_parallel.js --workers 16 --iterations 100 --outdir "c:\_Temp\TP0008" --startseed 1001 --params "preset=battleroyale&Prey_Toxin_Start_Probability_Percent=0.008&Simulation_Duration_Minutes=1000000&Simulation_History_Record_Rate=100"

node run_parallel.js --workers 16 --iterations 100 --outdir "c:\_Temp\TP001" --startseed 1001 --params "preset=battleroyale&Prey_Toxin_Start_Probability_Percent=0.01&Simulation_Duration_Minutes=1000000&Simulation_History_Record_Rate=100"

node run_parallel.js --workers 16 --iterations 100 --outdir "c:\_Temp\TP005" --startseed 1001 --params "preset=battleroyale&Prey_Toxin_Start_Probability_Percent=0.05&Simulation_Duration_Minutes=1000000&Simulation_History_Record_Rate=100"

node run_parallel.js --workers 16 --iterations 100 --outdir "c:\_Temp\TP008" --startseed 1001 --params "preset=battleroyale&Prey_Toxin_Start_Probability_Percent=0.08&Simulation_Duration_Minutes=1000000&Simulation_History_Record_Rate=100"

node run_parallel.js --workers 16 --iterations 100 --outdir "c:\_Temp\TP01" --startseed 1001 --params "preset=battleroyale&Prey_Toxin_Start_Probability_Percent=0.1&Simulation_Duration_Minutes=1000000&Simulation_History_Record_Rate=100"


echo All simulations finished!
pause