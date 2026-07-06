// Simulation of T6SS-mediated Bacterial Interactions - ver. 10.4 (6.7.2026)
// Copyright (c) 2025 Marek Basler
// Licensed under the Creative Commons Attribution 4.0 International License (CC BY 4.0)
// Details: https://creativecommons.org/licenses/by/4.0/
//
// If you use, adapt, or redistribute this software or its derivatives, 
// please provide attribution to: Marek Basler - University of Basel

// Master configuration file. It is loaded before the main javascript


const AppConfig = {
    // --- Visualization Colors ---
    colors: {
        ATTACKER: 'rgba(220, 38, 38, 1.0)',
        PREY: 'rgba(37, 99, 235, 1.0)',
        DEFENDER: 'rgba(217, 119, 6, 1.0)',
        DEAD_CELL: 'rgba(10, 10, 10, 1.0)',
        BARRIER: 'rgba(101, 67, 33, 1.0)',
        LYSING_CELL: 'rgba(160, 160, 160, 1.0)',
        EMPTY_STROKE: '#d1d5db',
        FIRING_SECTOR: 'rgba(0, 255, 0, 1.0)',
        MISS_FIRING_SECTOR: 'rgba(0, 100, 0, 0.5)',
        DEFAULT_CANVAS_BG: '#ffffff'
    },

    // --- Core Simulation Defaults ---
    defaults: {
        "Arena_Radius": 20,
		"Simulation_Duration_Minutes": 600,
		"Simulation_Step_Delay_ms": 50,
		"Simulation_Render_Rate_every_N_steps": 1,
		"Simulation_History_Record_Rate": 1,
		"Arena_State_Export_Enabled": true,
		"Full_State_History_Enabled": true,
		"Image_Export_Enabled": false,
		"Image_Export_Size_px": 1000,
		"Image_Buffer_Size_Limit_MB": 500,
		"History_Buffer_Size_Limit_MB": 1200,
		"Arena_State_Buffer_Size_Limit_MB": 200,

		"Attacker_Initial_Count": 30,
		"Attacker_Replication_Mean_min": 30,
		"Attacker_Replication_Range_min": 5,
		"Attacker_T6SS_Fire_Cooldown_Min_min": 3,
		"Attacker_T6SS_Fire_Cooldown_Max_min": 5,
		"Attacker_T6SS_Precision_Percent": 25,
		"Attacker_T6SS_Contact_Sensing_Bias_Percent": 0,
		"Attacker_T6SS_Kin_Exclusion_Percent": 0,
		"Attacker_T6SS_Kin_Exclusion_Penalty_min": -1,
		"Attacker_T6SS_NL_Units_per_Hit": 3,
		"Attacker_T6SS_NL_Delivery_Chance_Percent": 90,
		"Attacker_T6SS_L_Units_per_Hit": 3,
		"Attacker_T6SS_L_Delivery_Chance_Percent": 90,
		"Attacker_Sensitivity_NL_Units_to_Die": 5,
		"Attacker_Sensitivity_L_Units_to_Lyse": 5,
		"Attacker_Sensitivity_Base_Lysis_Delay_min": 20,
		"Attacker_Resistance_vs_Prey_Toxin_NL_Percent": 25,
		"Attacker_Resistance_vs_Prey_Toxin_L_Percent": 25,
		"Attacker_Prey_Toxin_NL_Threshold": 5,
		"Attacker_Prey_Toxin_L_Threshold": 5,
		"Attacker_Prey_Toxin_NL_Absorption_Rate_Percent": 20,
		"Attacker_Prey_Toxin_L_Absorption_Rate_Percent": 20,
		"Attacker_Movement_Cooldown_Min_min": 5,
		"Attacker_Movement_Cooldown_Max_min": 10,
		"Attacker_Movement_Probability_Percent": 0,
		"Attacker_Movement_Directionality_Percent": 100,
		"Attacker_Movement_Prey_AI_Attraction_Percent": 100,
		"Attacker_Movement_Prey_AI_Attraction_Threshold": 5,
		"Attacker_QS_Production_Rate_per_min": 0,
		"Attacker_QS_Degradation_Rate_Percent_per_min": 2,
		"Attacker_QS_Diffusion_Rate": 0.05,
		"Attacker_QS_Activation_Midpoint_K": -1,
		"Attacker_QS_Cooperativity_n": 4,
		"Attacker_Replication_Reward_Lyses_per_Reward": 0,
		"Attacker_Replication_Reward_Mean_min": 30,
		"Attacker_Replication_Reward_Range_min": 5,

		"Prey_Initial_Count": 20,
		"Prey_Replication_Mean_min": 20,
		"Prey_Replication_Range_min": 5,
		"Prey_Sensitivity_vs_Att_NL_Units_to_Die": 3,
		"Prey_Sensitivity_vs_Att_L_Units_to_Lyse": 5,
		"Prey_Sensitivity_vs_Att_Base_Lysis_Delay_min": 20,
		"Prey_Resistance_vs_Att_NL_Percent": 10,
		"Prey_Resistance_vs_Att_L_Percent": 10,
		"Prey_Sensitivity_vs_Def_NL_Units_to_Die": 3,
		"Prey_Sensitivity_vs_Def_L_Units_to_Lyse": 5,
		"Prey_Sensitivity_vs_Def_Base_Lysis_Delay_min": 20,
		"Prey_Resistance_vs_Def_NL_Percent": 10,
		"Prey_Resistance_vs_Def_L_Percent": 10,
		"Prey_LacZ_Units_per_Lysis": 5,
		"Prey_Movement_Cooldown_Min_min": 5,
		"Prey_Movement_Cooldown_Max_min": 10,
		"Prey_Movement_Probability_Percent": 0,
		"Prey_Movement_Directionality_Percent": 100,
		"Prey_QS_Production_Rate_per_min": 0,
		"Prey_QS_Degradation_Rate_Percent_per_min": 2,
		"Prey_QS_Diffusion_Rate": 0.05,
		"Prey_Toxin_NL_Production_Rate_per_min": 10,
		"Prey_Toxin_NL_Degradation_Rate_Percent_per_min": 2,
		"Prey_Toxin_NL_Diffusion_Rate": 0.01,
		"Prey_Toxin_L_Production_Rate_per_min": 10,
		"Prey_Toxin_L_Degradation_Rate_Percent_per_min": 2,
		"Prey_Toxin_L_Diffusion_Rate": 0.01,
		"Prey_Toxin_Trigger_Mode": "standard",
		"Prey_Toxin_QS_Derepression_Midpoint_K": -1,
		"Prey_Toxin_QS_Cooperativity_n": 4,
		"Prey_Toxin_Release_On_Lysis": false,
		"Prey_Toxin_Lysis_Threshold_Min": 200,
		"Prey_Toxin_Lysis_Threshold_Max": 1000,
		"Prey_Toxin_Start_Probability_Percent": 0,
		"Prey_Toxin_Initiation_Threshold": 2,
		"Prey_Capsule_System_Enabled": false,
		"Prey_Capsule_Max_Protection_Percent": 100,
		"Prey_Capsule_Derepression_Midpoint_K": -1,
		"Prey_Capsule_Cooperativity_n": 4,
		"Prey_Capsule_Cooldown_Min_min": 10,
		"Prey_Capsule_Cooldown_Max_min": 20,

		"Defender_Initial_Count": 10,
		"Defender_Replication_Mean_min": 25,
		"Defender_Replication_Range_min": 5,
		"Defender_Replication_Reward_Lyses_per_Reward": 0,
		"Defender_Replication_Reward_Mean_min": 25,
		"Defender_Replication_Reward_Range_min": 5,
		"Defender_Retaliation_Sense_Chance_Percent": 50,
		"Defender_Retaliation_Max_Shots": 7,
		"Defender_Random_Fire_Cooldown_Min_min": 25,
		"Defender_Random_Fire_Cooldown_Max_min": 35,
		"Defender_Random_Fire_Chance_Percent": 0.1,
		"Defender_T6SS_NL_Units_per_Hit": 2,
		"Defender_T6SS_NL_Delivery_Chance_Percent": 80,
		"Defender_T6SS_L_Units_per_Hit": 2,
		"Defender_T6SS_L_Delivery_Chance_Percent": 80,
		"Defender_Sensitivity_vs_Att_NL_Units_to_Die": 10,
		"Defender_Sensitivity_vs_Att_L_Units_to_Lyse": 10,
		"Defender_Sensitivity_vs_Att_Base_Lysis_Delay_min": 40,
		"Defender_Resistance_vs_Att_NL_Percent": 50,
		"Defender_Resistance_vs_Att_L_Percent": 50,
		"Defender_Resistance_vs_Prey_Toxin_NL_Percent": 90,
		"Defender_Resistance_vs_Prey_Toxin_L_Percent": 90,
		"Defender_Prey_Toxin_NL_Threshold": 20,
		"Defender_Prey_Toxin_L_Threshold": 20,
		"Defender_Prey_Toxin_NL_Absorption_Rate_Percent": 10,
		"Defender_Prey_Toxin_L_Absorption_Rate_Percent": 10,
		"Defender_Movement_Cooldown_Min_min": 5,
		"Defender_Movement_Cooldown_Max_min": 10,
		"Defender_Movement_Probability_Percent": 0,
		"Defender_Movement_Directionality_Percent": 100,

		"CPRG_Initial_Substrate_Units": 1000000,
		"CPRG_LacZ_kcat_Units_per_min_per_LacZ": 5,
		"CPRG_LacZ_Km_Units": 1000000
    },

    // --- Baseline Preset Overrides ---
    baselineOverrides: {
        'density': {
			"Defender_Initial_Count": 0
		},
		'sensitivity': {
			"Defender_Initial_Count": 0
		},
		'contactkin': {
			"Defender_Initial_Count": 0
		},
		'titfortat': {
			"Prey_Sensitivity_vs_Att_NL_Units_to_Die": 50,
			"Prey_Sensitivity_vs_Att_L_Units_to_Lyse": 50,
			"Prey_Resistance_vs_Att_NL_Percent": 90,
			"Prey_Resistance_vs_Att_L_Percent": 90,
			"Prey_Sensitivity_vs_Def_NL_Units_to_Die": 3,
			"Prey_Sensitivity_vs_Def_L_Units_to_Lyse": 3,
			"Prey_Resistance_vs_Def_NL_Percent": 0,
			"Prey_Resistance_vs_Def_L_Percent": 0,
			"Attacker_Sensitivity_NL_Units_to_Die": 3,
			"Attacker_Sensitivity_L_Units_to_Lyse": 3,
			"Defender_T6SS_NL_Units_per_Hit": 2,
			"Defender_T6SS_L_Units_per_Hit": 1,
			"Defender_T6SS_NL_Delivery_Chance_Percent": 75,
			"Defender_T6SS_L_Delivery_Chance_Percent": 75,
			"Defender_Retaliation_Max_Shots": 5,
			"Defender_Random_Fire_Cooldown_Min_min": 8,
			"Defender_Random_Fire_Cooldown_Max_min": 12,
			"CPRG_LacZ_kcat_Units_per_min_per_LacZ": 0,

		},
		'capsule': {
			"Defender_Initial_Count": 0,
			"Prey_Capsule_System_Enabled": true,
			"Prey_Capsule_Derepression_Midpoint_K": -1,
			"CPRG_LacZ_kcat_Units_per_min_per_LacZ": 0,

		},
		'predation': {
			"Defender_Initial_Count": 0,
			"Attacker_Replication_Mean_min": -1,
			"Attacker_T6SS_Precision_Percent": 100,
			"Attacker_T6SS_Contact_Sensing_Bias_Percent": 100,
			"Attacker_T6SS_Kin_Exclusion_Percent": 100,
			"CPRG_LacZ_kcat_Units_per_min_per_LacZ": 0,

		},
		'movement': {
			"Simulation_Duration_Minutes": 3000,
			"Arena_State_Export_Enabled": false,
			"Defender_Initial_Count": 0,
			"Attacker_Replication_Mean_min": 300,
			"Attacker_Replication_Range_min": 50,
			"Attacker_Movement_Cooldown_Min_min": 2,
			"Attacker_Movement_Cooldown_Max_min": 4,
			"Attacker_T6SS_Precision_Percent": 100,
			"Attacker_T6SS_Contact_Sensing_Bias_Percent": 100,
			"Attacker_T6SS_Kin_Exclusion_Percent": 100,
			"Attacker_Replication_Reward_Lyses_per_Reward": 3,
			"Prey_Replication_Mean_min": 30,
			"Prey_Replication_Range_min": 5,
			"CPRG_LacZ_kcat_Units_per_min_per_LacZ": 0,

		},
		'qs': {
			"Simulation_Duration_Minutes": 1200,
			"Defender_Initial_Count": 0,
			"Prey_Capsule_System_Enabled": true,
			"Prey_Capsule_Max_Protection_Percent": 100,
			"Attacker_T6SS_Precision_Percent": 100,
			"Attacker_T6SS_Contact_Sensing_Bias_Percent": 100,
			"CPRG_LacZ_kcat_Units_per_min_per_LacZ": 0,
		},
		'battleroyale': {
			"Simulation_Duration_Minutes": 3000,
			"Arena_State_Export_Enabled": false,
			"Attacker_T6SS_Fire_Cooldown_Min_min": 1,
			"Attacker_T6SS_Fire_Cooldown_Max_min": 3,
			"Attacker_T6SS_Precision_Percent": 100,
			"Prey_Replication_Mean_min": 60,
			"Prey_Replication_Range_min": 10,
			"Prey_Capsule_Max_Protection_Percent": 75,
			"Defender_Resistance_vs_Att_NL_Percent": 80,
			"Defender_Resistance_vs_Att_L_Percent": 80,
			"CPRG_LacZ_kcat_Units_per_min_per_LacZ": 0,
		},
		'preytoxin': {
			"Defender_Initial_Count": 0
		}
    },
    
    // --- Preset Modal Default State ---
    presetDefaults: {
        group: 'density',
        densityFillPercent: 10,
        densityAttPreyRatioIndex: 4,
        sensitivityType: 'both_sensitive',
        sensitivityFillPercent: 10,
        sensitivityAttPreyRatioIndex: 4,
        contactKinFillPercent: 20,
        contactKinAttPreyRatioIndex: 4,
        contactKinContactSensingBias: 50,
        contactKinKinExclusion: 50,
        titfortatLevel: 'medium',
        titfortatFillPercent: 50,
        capsuleProtectionPercent: 100,
        capsuleLayerTime: 5,
        capsuleFillPercent: 10,
        capsuleAttPreyRatioIndex: 4,
        predationEffectorType: 'both_sensitive',
        predationLysesPerRep: 3,
        predationFillPercent: 10,
        predationAttPreyRatioIndex: 4,
        movementPredation: 'on',
        movementPreyAiProd: 100,
        movementAttMoveProb: 50,
        movementAttMoveDir: 100,
        movementArenaRadius: 50,
        movementFillPercent: 5,
        movementAttPreyRatioIndex: 6,
        attackerQSProd: 20,
        attackerQSK: 1000,
        attackerQSN: 4,
        attackerQSFillPercent: 10,
        attackerQSAttPreyRatioIndex: 4,
        preyQSProd: 30,
        preyQSK: 3000,
        preyQSN: 4,
        brArenaRadius: 50,
        brFillPercent: 30,
        brAttackerPercent: 10,
        brDefenderPercent: 10,
        brAttMovement: 2,
        brAttQs: false,
        brAttKin: true,
        brAttContact: true,
        brAttPredation: true,
        brPreyMovement: false,
        brPreyAi: true,
        brPreyCapsule: true,
        brPreyToxin: true,
        brPreyToxinStartProb: 0.01,
        brDefMovement: true,
        brDefSelectivity: 2,
        brDefPredation: true,
        preyToxinArenaRadius: 30,
        preyToxinFillPercent: 10,
        preyToxinAttPreyRatioIndex: 4,
        preyToxinLysis: 'yes',
        preyToxinStartProb: 0.1,
        preyToxinNLProd: 10,
        preyToxinLProd: 10,
        preyToxinTriggerMode: 'standard',
    },

    // --- UI Preset Mappings ---
    ui: {
        RATIO_MAP: ["100:1", "30:1", "10:1", "3:1", "1:1", "1:3", "1:10", "1:30", "1:100"],
        RATIO_VALUES: [100, 30, 10, 3, 1, 1/3, 1/10, 1/30, 1/100],
        BR_ATT_MOVEMENT_MAP: ['No', 'Yes', 'AI'],
        BR_DEF_SELECTIVITY_MAP: ['Low', 'Med', 'High']
    },

    // --- Extracted Preset Logic ---
    // This section now includes a "handler" function for each preset.
    presetLogic: {
        'density': {
            handler: (config) => {
                const ratio = AppConfig.ui.RATIO_VALUES[config.densityAttPreyRatioIndex];
                calculateAndSetCellCounts(config.densityFillPercent, ratio, false);
                return {}; // No extra dynamic settings to apply
            }
        },
        'sensitivity': {
            types: {
                lytic_only: { "Prey_Sensitivity_vs_Att_NL_Units_to_Die": 999, "Prey_Sensitivity_vs_Att_L_Units_to_Lyse": 3, "Prey_Resistance_vs_Att_NL_Percent": 100, "Prey_Resistance_vs_Att_L_Percent": 0, "Prey_Sensitivity_vs_Def_NL_Units_to_Die": 999, "Prey_Sensitivity_vs_Def_L_Units_to_Lyse": 3, "Prey_Resistance_vs_Def_NL_Percent": 100, "Prey_Resistance_vs_Def_L_Percent": 0 },
                nonlytic_only: { "Prey_Sensitivity_vs_Att_NL_Units_to_Die": 3, "Prey_Sensitivity_vs_Att_L_Units_to_Lyse": 999, "Prey_Resistance_vs_Att_NL_Percent": 0, "Prey_Resistance_vs_Att_L_Percent": 100, "Prey_Sensitivity_vs_Def_NL_Units_to_Die": 3, "Prey_Sensitivity_vs_Def_L_Units_to_Lyse": 999, "Prey_Resistance_vs_Def_NL_Percent": 0, "Prey_Resistance_vs_Def_L_Percent": 100 },
                both_sensitive: { "Prey_Sensitivity_vs_Att_NL_Units_to_Die": 4, "Prey_Sensitivity_vs_Att_L_Units_to_Lyse": 4, "Prey_Resistance_vs_Att_NL_Percent": 10, "Prey_Resistance_vs_Att_L_Percent": 10, "Prey_Sensitivity_vs_Def_NL_Units_to_Die": 4, "Prey_Sensitivity_vs_Def_L_Units_to_Lyse": 4, "Prey_Resistance_vs_Def_NL_Percent": 10, "Prey_Resistance_vs_Def_L_Percent": 10 }
            },
            handler: (config) => {
                const ratio = AppConfig.ui.RATIO_VALUES[config.sensitivityAttPreyRatioIndex];
                calculateAndSetCellCounts(config.sensitivityFillPercent, ratio, false);
                // It returns the dynamic settings object
                return AppConfig.presetLogic.sensitivity.types[config.sensitivityType] || {};
            }
        },
        'contactkin': {
            handler: (config) => {
                const ratio = AppConfig.ui.RATIO_VALUES[config.contactKinAttPreyRatioIndex];
                calculateAndSetCellCounts(config.contactKinFillPercent, ratio, false);
                // It returns the dynamic settings object
                return {
                    "Attacker_T6SS_Contact_Sensing_Bias_Percent": config.contactKinContactSensingBias,
                    "Attacker_T6SS_Kin_Exclusion_Percent": config.contactKinKinExclusion
                };
            }
        },
        'titfortat': {
            ratioValue: 1, // Att:Prey
            defenderRatioPart: 1,
            levels: {
                high: { "Defender_Retaliation_Sense_Chance_Percent": 90, "Defender_Random_Fire_Chance_Percent": 0.1 },
                medium: { "Defender_Retaliation_Sense_Chance_Percent": 50, "Defender_Random_Fire_Chance_Percent": 1 },
                poor: { "Defender_Retaliation_Sense_Chance_Percent": 10, "Defender_Random_Fire_Chance_Percent": 10 }
            },
            handler: (config) => {
                const logic = AppConfig.presetLogic.titfortat;
                calculateAndSetCellCounts(config.titfortatFillPercent, logic.ratioValue, true, logic.defenderRatioPart);
                return logic.levels[config.titfortatLevel] || {};
            }
        },
        'capsule': {
            handler: (config) => {
                const ratio = AppConfig.ui.RATIO_VALUES[config.capsuleAttPreyRatioIndex];
                calculateAndSetCellCounts(config.capsuleFillPercent, ratio, false);
                return {
                    "Prey_Capsule_Max_Protection_Percent": config.capsuleProtectionPercent,
                    "Prey_Capsule_Cooldown_Min_min": config.capsuleLayerTime,
                    "Prey_Capsule_Cooldown_Max_min": config.capsuleLayerTime
                };
            }
        },
        'predation': {
            types: {
                lytic_only: { "Prey_Sensitivity_vs_Att_NL_Units_to_Die": 999, "Prey_Sensitivity_vs_Att_L_Units_to_Lyse": 3, "Prey_Resistance_vs_Att_NL_Percent": 100, "Prey_Resistance_vs_Att_L_Percent": 0 },
                nonlytic_only: { "Prey_Sensitivity_vs_Att_NL_Units_to_Die": 3, "Prey_Sensitivity_vs_Att_L_Units_to_Lyse": 999, "Prey_Resistance_vs_Att_NL_Percent": 0, "Prey_Resistance_vs_Att_L_Percent": 100 },
                both_sensitive: { "Prey_Sensitivity_vs_Att_NL_Units_to_Die": 4, "Prey_Sensitivity_vs_Att_L_Units_to_Lyse": 4, "Prey_Resistance_vs_Att_NL_Percent": 10, "Prey_Resistance_vs_Att_L_Percent": 10 }
            },
            handler: (config) => {
                const ratio = AppConfig.ui.RATIO_VALUES[config.predationAttPreyRatioIndex];
                calculateAndSetCellCounts(config.predationFillPercent, ratio, false);
                let dynamicSettings = AppConfig.presetLogic.predation.types[config.predationEffectorType] || {};
                dynamicSettings["Attacker_Replication_Reward_Lyses_per_Reward"] = config.predationLysesPerRep;
                return dynamicSettings;
            }
        },
        'movement': {
            predation: {
                'on': { "Attacker_Replication_Mean_min": -1 },
                'off': { "Attacker_Replication_Reward_Lyses_per_Reward": 0 }
            },
            handler: (config) => {
                updateInputElement('arenaGridRadiusInput', config.movementArenaRadius);
                const ratio = AppConfig.ui.RATIO_VALUES[config.movementAttPreyRatioIndex];
                calculateAndSetCellCounts(config.movementFillPercent, ratio, false);
                let dynamicSettings = AppConfig.presetLogic.movement.predation[config.movementPredation] || {};
                dynamicSettings["Prey_QS_Production_Rate_per_min"] = config.movementPreyAiProd;
                dynamicSettings["Attacker_Movement_Probability_Percent"] = config.movementAttMoveProb;
                dynamicSettings["Attacker_Movement_Directionality_Percent"] = config.movementAttMoveDir;
                return dynamicSettings;
            }
        },
        'qs': {
            handler: (config) => {
                const ratio = AppConfig.ui.RATIO_VALUES[config.attackerQSAttPreyRatioIndex];
                calculateAndSetCellCounts(config.attackerQSFillPercent, ratio, false);
                return {
                    "Attacker_QS_Production_Rate_per_min": config.attackerQSProd,
                    "Attacker_QS_Activation_Midpoint_K": config.attackerQSK,
                    "Attacker_QS_Cooperativity_n": config.attackerQSN,
                    "Prey_QS_Production_Rate_per_min": config.preyQSProd,
                    "Prey_Capsule_Derepression_Midpoint_K": config.preyQSK,
                    "Prey_Capsule_Cooperativity_n": config.preyQSN
                };
            }
        },
        'preytoxin': {
            handler: (config) => {
                updateInputElement('arenaGridRadiusInput', config.preyToxinArenaRadius);
                const ratio = AppConfig.ui.RATIO_VALUES[config.preyToxinAttPreyRatioIndex];
                calculateAndSetCellCounts(config.preyToxinFillPercent, ratio, false);
                return {
                    "Prey_Toxin_Release_On_Lysis": config.preyToxinLysis === 'yes',
                    "Prey_Toxin_Start_Probability_Percent": config.preyToxinStartProb,
                    "Prey_Toxin_NL_Production_Rate_per_min": config.preyToxinNLProd,
                    "Prey_Toxin_L_Production_Rate_per_min": config.preyToxinLProd,
                    "Prey_Toxin_Trigger_Mode": config.preyToxinTriggerMode
                };
            }
        },
        'battleroyale': {
            attacker: {
                movement: {
                    '0': { "Attacker_Movement_Probability_Percent": 0 }, // 'No'
                    '1': { "Attacker_Movement_Probability_Percent": 50, "Attacker_Movement_Prey_AI_Attraction_Percent": 0 }, // 'Yes'
                    '2': { "Attacker_Movement_Probability_Percent": 50, "Attacker_Movement_Prey_AI_Attraction_Percent": 100 } // 'AI'
                },
                qs: {
                    'true': { "Attacker_QS_Activation_Midpoint_K": 1000 },
                    'false': { "Attacker_QS_Activation_Midpoint_K": -1 }
                },
                kin: {
                    'true': { "Attacker_T6SS_Kin_Exclusion_Percent": 100 },
                    'false': { "Attacker_T6SS_Kin_Exclusion_Percent": 0 }
                },
                contact: {
                    'true': { "Attacker_T6SS_Contact_Sensing_Bias_Percent": 100 },
                    'false': { "Attacker_T6SS_Contact_Sensing_Bias_Percent": 0 }
                },
                predation: {
                    'true': { "Attacker_Replication_Mean_min": -1, "Attacker_Replication_Reward_Lyses_per_Reward": 3 },
                    'false': { "Attacker_Replication_Mean_min": 120, "Attacker_Replication_Reward_Lyses_per_Reward": 0 }
                }
            },
            prey: {
                movement: {
                    'true': { "Prey_Movement_Probability_Percent": 50 },
                    'false': { "Prey_Movement_Probability_Percent": 0 }
                },
                ai: {
                    'true': { "Prey_QS_Production_Rate_per_min": 100 },
                    'false': { "Prey_QS_Production_Rate_per_min": 0 }
                },
                capsule: {
                    'true': { "Prey_Capsule_System_Enabled": true },
                    'false': { "Prey_Capsule_System_Enabled": false }
                },
                capsuleAiLink: { // This holds the linked logic
                    'true': { "Prey_Capsule_Derepression_Midpoint_K": 5000 }, // AI is ON
                    'false': { "Prey_Capsule_Derepression_Midpoint_K": -1 } // AI is OFF
                },
                toxin: {
                    'true': {
                        "Prey_Toxin_Release_On_Lysis": true,
                        "Prey_Toxin_NL_Production_Rate_per_min": 20,
                        "Prey_Toxin_L_Production_Rate_per_min": 20,
                        "Prey_Toxin_Trigger_Mode": "standard"
                    },
                    'false': {
                        "Prey_Toxin_Release_On_Lysis": true,
                        "Prey_Toxin_Start_Probability_Percent": 0,
                        "Prey_Toxin_NL_Production_Rate_per_min": 0,
                        "Prey_Toxin_L_Production_Rate_per_min": 0,
                        "Prey_Toxin_Trigger_Mode": "standard"
                    }
                }
            },
            defender: {
                movement: {
                    'true': { "Defender_Movement_Probability_Percent": 50 },
                    'false': { "Defender_Movement_Probability_Percent": 0 }
                },
                selectivity: {
                    '0': { "Defender_Retaliation_Sense_Chance_Percent": 10, "Defender_Random_Fire_Chance_Percent": 10 }, // 'Low'
                    '1': { "Defender_Retaliation_Sense_Chance_Percent": 50, "Defender_Random_Fire_Chance_Percent": 1 }, // 'Med'
                    '2': { "Defender_Retaliation_Sense_Chance_Percent": 90, "Defender_Random_Fire_Chance_Percent": 0.1 } // 'High'
                },
                predation: {
                    'true': { "Defender_Replication_Mean_min": -1, "Defender_Replication_Reward_Lyses_per_Reward": 3 },
                    'false': { "Defender_Replication_Mean_min": 180, "Defender_Replication_Reward_Lyses_per_Reward": 0 }
                }
            },
            handler: (config) => {
                const logic = AppConfig.presetLogic.battleroyale;

                updateInputElement('arenaGridRadiusInput', config.brArenaRadius);
                calculateAndSetCellCountsByPercentage(config.brFillPercent, config.brAttackerPercent, config.brDefenderPercent);
                
                let settingsToApply = {};

                Object.assign(settingsToApply, logic.attacker.movement[config.brAttMovement]);
                Object.assign(settingsToApply, logic.attacker.qs[config.brAttQs]);
                Object.assign(settingsToApply, logic.attacker.kin[config.brAttKin]);
                Object.assign(settingsToApply, logic.attacker.contact[config.brAttContact]);
                Object.assign(settingsToApply, logic.attacker.predation[config.brAttPredation]);
                Object.assign(settingsToApply, logic.prey.movement[config.brPreyMovement]);
                Object.assign(settingsToApply, logic.prey.ai[config.brPreyAi]);
                Object.assign(settingsToApply, logic.prey.capsule[config.brPreyCapsule]);
                Object.assign(settingsToApply, logic.prey.toxin[config.brPreyToxin]);
                
                if (config.brPreyToxin) {
                    settingsToApply["Prey_Toxin_Start_Probability_Percent"] = config.brPreyToxinStartProb;
                }
                
                if (config.brPreyCapsule) {
                    const aiLinkLogic = logic.prey.capsuleAiLink[config.brPreyAi];
                    Object.assign(settingsToApply, aiLinkLogic);
                }

                Object.assign(settingsToApply, logic.defender.movement[config.brDefMovement]);
                Object.assign(settingsToApply, logic.defender.selectivity[config.brDefSelectivity]);
                Object.assign(settingsToApply, logic.defender.predation[config.brDefPredation]);
                
                return settingsToApply;
            }
        }
    }
};