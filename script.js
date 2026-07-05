// Simulation of T6SS-mediated Bacterial Interactions - ver. 10.1 (28.6.2026)
// Copyright (c) 2025 Marek Basler
// Licensed under the Creative Commons Attribution 4.0 International License (CC BY 4.0)
// Details: https://creativecommons.org/licenses/by/4.0/
//
// If you use, adapt, or redistribute this software or its derivatives, 
// please provide attribution to: Marek Basler - University of Basel

	// --- Global Constants & Colors ---
	// Transparency can be set, but for clarity it is off (alpha = 1.0)
	// --- Global Constants & Colors (Mapped from config.js) ---
	const ATTACKER_COLOR = AppConfig.colors.ATTACKER;
	const PREY_COLOR = AppConfig.colors.PREY;
	const DEFENDER_COLOR = AppConfig.colors.DEFENDER;
	const DEAD_CELL_COLOR = AppConfig.colors.DEAD_CELL;
	const BARRIER_COLOR = AppConfig.colors.BARRIER;
	const LYSING_CELL_COLOR = AppConfig.colors.LYSING_CELL;
	const EMPTY_COLOR_STROKE = AppConfig.colors.EMPTY_STROKE;
	const FIRING_SECTOR_COLOR = AppConfig.colors.FIRING_SECTOR;
	const MISS_FIRING_SECTOR_COLOR = AppConfig.colors.MISS_FIRING_SECTOR;
	const DEFAULT_CANVAS_BG_COLOR = AppConfig.colors.DEFAULT_CANVAS_BG;

	const AXIAL_DIRECTIONS = [
		{ q:  1, r:  0 }, { q:  1, r: -1 }, { q:  0, r: -1 },
		{ q: -1, r:  0 }, { q: -1, r:  1 }, { q:  0, r:  1 }
	];

	// --- DOM Elements ---
	// Canvas and general UI
	const canvasContainer = document.getElementById('canvasContainer');
	const canvas = document.getElementById('simulationCanvas');
	const ctx = canvas.getContext('2d');
	const simulationErrorDisplay = document.getElementById('simulationErrorDisplay');
	const hoverInfoPanel = document.getElementById('hoverInfoPanel');

	// Cell type param selection
	const cellTypeSelectionButtons = document.getElementById('cellTypeSelectionButtons');
	const attackerParamsSection = document.getElementById('attackerParamsSection');
	const preyParamsSection = document.getElementById('preyParamsSection');
	const defenderParamsSection = document.getElementById('defenderParamsSection');
	const selectAttackerParamsButton = document.getElementById('selectAttackerParamsButton');
	const selectPreyParamsButton = document.getElementById('selectPreyParamsButton');
	const selectDefenderParamsButton = document.getElementById('selectDefenderParamsButton');
	// Setup mode
	const manualPlacementControls = document.getElementById('manualPlacementControls');
	const selectAttackerButton = document.getElementById('selectAttackerButton');
	const selectPreyButton = document.getElementById('selectPreyButton');
	const selectDefenderButton = document.getElementById('selectDefenderButton');
	const selectBarrierButton = document.getElementById('selectBarrierButton');
	const selectRemoveButton = document.getElementById('selectRemoveButton');
//	const currentPlacementTypeDisplay = document.getElementById('currentPlacementTypeDisplay');
	const manualRandomPlacementButton = document.getElementById('manualRandomPlacementButton');
	const clearManualPlacementButton = document.getElementById('clearManualPlacementButton');
	const importManualArenaButton = document.getElementById('importManualArenaButton'); // New
	const exportManualArenaButton = document.getElementById('exportManualArenaButton'); // New
	// Simulation control
	const startButton = document.getElementById('startButton');
	const pauseButton = document.getElementById('pauseButton');
	const stepButton = document.getElementById('stepButton');
	const stopButton = document.getElementById('stopButton');
	const resetSimulationButton = document.getElementById('resetSimulationButton');
	const simulationSpeedInput = document.getElementById('simulationSpeedInput');
	const totalSimulationMinutesInput = document.getElementById('totalSimulationMinutesInput');
	const simulationSeedInput = document.getElementById('simulationSeedInput');
	const newSeedButton = document.getElementById('newSeedButton');
    const resetRngButton = document.getElementById('resetRngButton');
    const resyncCellsButton = document.getElementById('resyncCellsButton');

	// General settings
	const arenaGridRadiusInput = document.getElementById('arenaGridRadiusInput');
	const importSettingsButton = document.getElementById('importSettingsButton');
	const exportSettingsButtonMain = document.getElementById('exportSettingsButtonMain');
	const resetSettingsToDefaultsButton = document.getElementById('resetSettingsToDefaultsButton');

	// Exports Settings (Renamed Section)
	const saveImagesCheckbox = document.getElementById('saveImagesCheckbox');
	const saveArenaStatesCheckbox = document.getElementById('saveArenaStatesCheckbox'); // New
	const imageExportWidthInput = document.getElementById('imageExportWidthInput');
	const renderFromHistoryButton = document.getElementById('renderFromHistoryButton');
	const renderFromStepInput = document.getElementById('renderFromStepInput');
	const renderToStepInput = document.getElementById('renderToStepInput');
	const renderRateStepInput = document.getElementById('renderRateStepInput');
	const cancelRenderButton = document.getElementById('cancelRenderButton');
	const cancelImportSessionButton = document.getElementById('cancelImportSessionButton');
	// Attacker params
	const initialAttackersInput = document.getElementById('initialAttackersInput');
	const attackerReplicationMeanInput = document.getElementById('attackerReplicationMeanInput');
	const attackerReplicationRangeInput = document.getElementById('attackerReplicationRangeInput');
	const t6ssFireCooldownMinInput = document.getElementById('t6ssFireCooldownMinInput');
	const t6ssFireCooldownMaxInput = document.getElementById('t6ssFireCooldownMaxInput');
	const attackerPrecisionInput = document.getElementById('attackerPrecisionInput');
	const attackerContactSensingBiasInput = document.getElementById('attackerContactSensingBiasInput');
	const attackerKinExclusionInput = document.getElementById('attackerKinExclusionInput');
	const attackerKinExclusionPenaltyInput = document.getElementById('attackerKinExclusionPenaltyInput');
	const attNonLyticUnitsPerHitInput = document.getElementById('attNonLyticUnitsPerHitInput');
	const attNonLyticDeliveryChanceInput = document.getElementById('attNonLyticDeliveryChanceInput');
	const attLyticUnitsPerHitInput = document.getElementById('attLyticUnitsPerHitInput');
	const attLyticDeliveryChanceInput = document.getElementById('attLyticDeliveryChanceInput');
	const attNonLyticUnitsToDieInput = document.getElementById('attNonLyticUnitsToDieInput');
	const attLyticUnitsToLyseInput = document.getElementById('attLyticUnitsToLyseInput');
	const attBaseLysisDelayInput = document.getElementById('attBaseLysisDelayInput');
	const attackerResistanceVsPreyToxinNLInput = document.getElementById('attackerResistanceVsPreyToxinNLInput');
	const attackerResistanceVsPreyToxinLInput = document.getElementById('attackerResistanceVsPreyToxinLInput');
	const attackerAbsorptRateVsPreyToxinNLInput = document.getElementById('attackerAbsorptRateVsPreyToxinNLInput');
	const attackerAbsorptRateVsPreyToxinLInput = document.getElementById('attackerAbsorptRateVsPreyToxinLInput');
	const attackerThresholdVsPreyToxinNLInput = document.getElementById('attackerThresholdVsPreyToxinNLInput');
	const attackerThresholdVsPreyToxinLInput = document.getElementById('attackerThresholdVsPreyToxinLInput');
	// Attacker movement
	const attackerMoveCooldownMinInput = document.getElementById('attackerMoveCooldownMinInput');
	const attackerMoveCooldownMaxInput = document.getElementById('attackerMoveCooldownMaxInput');
	const attackerMoveProbabilityInput = document.getElementById('attackerMoveProbabilityInput');
	const attackerMoveDirectionalityInput = document.getElementById('attackerMoveDirectionalityInput');
	const attackerMovePreyAiAttractionInput = document.getElementById('attackerMovePreyAiAttractionInput');
	const attackerMovePreyAiAttractionThresholdInput = document.getElementById('attackerMovePreyAiAttractionThresholdInput'); // New
	const attackerLysesPerReplicationInput = document.getElementById('attackerLysesPerReplicationInput');
	const attackerReplicationRewardMeanInput = document.getElementById('attackerReplicationRewardMeanInput');
	const attackerReplicationRewardRangeInput = document.getElementById('attackerReplicationRewardRangeInput');

	// Attacker QS
	const attackerQSProductionRateInput = document.getElementById('attackerQSProductionRateInput');
	const attackerQSDegradationRateInput = document.getElementById('attackerQSDegradationRateInput');
	const attackerQSDiffusionRateInput = document.getElementById('attackerQSDiffusionRateInput');
	const attackerQSMidpointInput = document.getElementById('attackerQSMidpointInput');
	const attackerQSCooperativityInput = document.getElementById('attackerQSCooperativityInput');
	// Prey params
	const initialPreyInput = document.getElementById('initialPreyInput');
	const preyReplicationMeanInput = document.getElementById('preyReplicationMeanInput');
	const preyReplicationRangeInput = document.getElementById('preyReplicationRangeInput');
	const preyNonLyticUnitsToDieAttInput = document.getElementById('preyNonLyticUnitsToDieAttInput');
	const preyLyticUnitsToLyseAttInput = document.getElementById('preyLyticUnitsToLyseAttInput');
	const preyBaseLysisDelayAttInput = document.getElementById('preyBaseLysisDelayAttInput');
	const preyNonLyticResistanceAttInput = document.getElementById('preyNonLyticResistanceAttInput');
	const preyLyticResistanceAttInput = document.getElementById('preyLyticResistanceAttInput');
	const preyNonLyticUnitsToDieDefInput = document.getElementById('preyNonLyticUnitsToDieDefInput');
	const preyLyticUnitsToLyseDefInput = document.getElementById('preyLyticUnitsToLyseDefInput');
	const preyBaseLysisDelayDefInput = document.getElementById('preyBaseLysisDelayDefInput');
	const preyNonLyticResistanceDefInput = document.getElementById('preyNonLyticResistanceDefInput');
	const preyLyticResistanceDefInput = document.getElementById('preyLyticResistanceDefInput');
	const lacZPerPreyInput = document.getElementById('lacZPerPreyInput');
	const preyCapsuleSystemEnabledCheckbox = document.getElementById('preyCapsuleSystemEnabledCheckbox');
	const preyCapsuleMaxProtectionInput = document.getElementById('preyCapsuleMaxProtectionInput');
	const preyCapsuleDerepressionMidpointInput = document.getElementById('preyCapsuleDerepressionMidpointInput');
	const preyCapsuleCooperativityInput = document.getElementById('preyCapsuleCooperativityInput');
	const preyCapsuleCooldownMinInput = document.getElementById('preyCapsuleCooldownMinInput');
	const preyCapsuleCooldownMaxInput = document.getElementById('preyCapsuleCooldownMaxInput');
	const preyToxinNLProductionRateInput = document.getElementById('preyToxinNLProductionRateInput');
	const preyToxinNLDegradationRateInput = document.getElementById('preyToxinNLDegradationRateInput');
	const preyToxinNLDiffusionRateInput = document.getElementById('preyToxinNLDiffusionRateInput');
	const preyToxinLProductionRateInput = document.getElementById('preyToxinLProductionRateInput');
	const preyToxinLDegradationRateInput = document.getElementById('preyToxinLDegradationRateInput');
	const preyToxinLDiffusionRateInput = document.getElementById('preyToxinLDiffusionRateInput');
	const preyToxinTriggerModeSelect = document.getElementById('preyToxinTriggerModeSelect');
	const preyToxinQSDerepressionMidpointInput = document.getElementById('preyToxinQSDerepressionMidpointInput');
	const preyToxinQSCooperativityInput = document.getElementById('preyToxinQSCooperativityInput');
	const preyToxinReleaseOnLysisCheckbox = document.getElementById('preyToxinReleaseOnLysisCheckbox');
	const preyToxinLysisThresholdMinInput = document.getElementById('preyToxinLysisThresholdMinInput');
	const preyToxinLysisThresholdMaxInput = document.getElementById('preyToxinLysisThresholdMaxInput');
	const preyToxinStartProbabilityInput = document.getElementById('preyToxinStartProbabilityInput');
	const preyToxinInitiationThresholdInput = document.getElementById('preyToxinInitiationThresholdInput');
	// Prey movement
	const preyMoveCooldownMinInput = document.getElementById('preyMoveCooldownMinInput');
	const preyMoveCooldownMaxInput = document.getElementById('preyMoveCooldownMaxInput');
	const preyMoveProbabilityInput = document.getElementById('preyMoveProbabilityInput');
	const preyMoveDirectionalityInput = document.getElementById('preyMoveDirectionalityInput');
	// Defender params
	const initialDefendersInput = document.getElementById('initialDefendersInput');
	const defenderReplicationMeanInput = document.getElementById('defenderReplicationMeanInput');
	const defenderReplicationRangeInput = document.getElementById('defenderReplicationRangeInput');
	const defenderSenseChanceInput = document.getElementById('defenderSenseChanceInput');
	const defenderMaxRetaliationsInput = document.getElementById('defenderMaxRetaliationsInput');
	const defenderRandomFireCooldownMinInput = document.getElementById('defenderRandomFireCooldownMinInput');
	const defenderRandomFireCooldownMaxInput = document.getElementById('defenderRandomFireCooldownMaxInput');
	const defenderRandomFireChanceInput = document.getElementById('defenderRandomFireChanceInput');
	const defNonLyticUnitsPerHitInput = document.getElementById('defNonLyticUnitsPerHitInput');
	const defNonLyticDeliveryChanceInput = document.getElementById('defNonLyticDeliveryChanceInput');
	const defLyticUnitsPerHitInput = document.getElementById('defLyticUnitsPerHitInput');
	const defLyticDeliveryChanceInput = document.getElementById('defLyticDeliveryChanceInput');
	const defNonLyticUnitsToDieInput = document.getElementById('defNonLyticUnitsToDieInput');
	const defLyticUnitsToLyseInput = document.getElementById('defLyticUnitsToLyseInput');
	const defBaseLysisDelayInput = document.getElementById('defBaseLysisDelayInput');
	const defNonLyticResistanceInput = document.getElementById('defNonLyticResistanceInput');
	const defLyticResistanceInput = document.getElementById('defLyticResistanceInput');
	const defenderResistanceVsPreyToxinNLInput = document.getElementById('defenderResistanceVsPreyToxinNLInput');
	const defenderResistanceVsPreyToxinLInput = document.getElementById('defenderResistanceVsPreyToxinLInput');
	const defenderAbsorptRateVsPreyToxinNLInput = document.getElementById('defenderAbsorptRateVsPreyToxinNLInput');
	const defenderAbsorptRateVsPreyToxinLInput = document.getElementById('defenderAbsorptRateVsPreyToxinLInput');
	const defenderThresholdVsPreyToxinNLInput = document.getElementById('defenderThresholdVsPreyToxinNLInput');
	const defenderThresholdVsPreyToxinLInput = document.getElementById('defenderThresholdVsPreyToxinLInput');
	// Defender movement
	const defenderMoveCooldownMinInput = document.getElementById('defenderMoveCooldownMinInput');
	const defenderMoveCooldownMaxInput = document.getElementById('defenderMoveCooldownMaxInput');
	const defenderMoveProbabilityInput = document.getElementById('defenderMoveProbabilityInput');
	const defenderMoveDirectionalityInput = document.getElementById('defenderMoveDirectionalityInput');
	const defenderLysesPerReplicationInput = document.getElementById('defenderLysesPerReplicationInput');
	const defenderReplicationRewardMeanInput = document.getElementById('defenderReplicationRewardMeanInput');
	const defenderReplicationRewardRangeInput = document.getElementById('defenderReplicationRewardRangeInput');
	// CPRG reporter settings
	const initialCPRGSubstrateInput = document.getElementById('initialCPRGSubstrateInput');
	const lacZKcatInput = document.getElementById('lacZKcatInput');
	const lacZKmInput = document.getElementById('lacZKmInput');
	// Stats display
	const timeStepsDisplay = document.getElementById('timeStepsDisplay');
	const attackerCountDisplay = document.getElementById('attackerCountDisplay');
	const livePreyCountDisplay = document.getElementById('livePreyCountDisplay');
	const defenderCountDisplay = document.getElementById('defenderCountDisplay');
	const deadLysingAttackersDisplay = document.getElementById('deadLysingAttackersDisplay');
	const deadLysingPreyDisplay = document.getElementById('deadLysingPreyDisplay');
	const deadLysingDefendersDisplay = document.getElementById('deadLysingDefendersDisplay');
	const totalCellCountDisplay = document.getElementById('totalCellCountDisplay');
	const firingsThisStepDisplay = document.getElementById('firingsThisStepDisplay');
	const attKilledThisStepDisplay = document.getElementById('attKilledThisStepDisplay');
	const preyKilledThisStepDisplay = document.getElementById('preyKilledThisStepDisplay');
	const defKilledThisStepDisplay = document.getElementById('defKilledThisStepDisplay');
	const attLysedThisStepDisplay = document.getElementById('attLysedThisStepDisplay');
	const preyLysedThisStepDisplay = document.getElementById('preyLysedThisStepDisplay');
	const defLysedThisStepDisplay = document.getElementById('defLysedThisStepDisplay');
	const cumulativeFiringsDisplay = document.getElementById('cumulativeFiringsDisplay');
	const cumulativeAttKilledDisplay = document.getElementById('cumulativeAttKilledDisplay');
	const cumulativePreyKilledDisplay = document.getElementById('cumulativePreyKilledDisplay');
	const cumulativeDefKilledDisplay = document.getElementById('cumulativeDefKilledDisplay');
	const cumulativeAttLysedDisplay = document.getElementById('cumulativeAttLysedDisplay');
	const cumulativePreyLysedDisplay = document.getElementById('cumulativePreyLysedDisplay');
	const cumulativeDefLysedDisplay = document.getElementById('cumulativeDefLysedDisplay');
	const totalCPRGConvertedDisplay = document.getElementById('totalCPRGConvertedDisplay');
	const totalSpacesDisplay = document.getElementById('totalSpacesDisplay');
	const percentFullDisplay = document.getElementById('percentFullDisplay');
	// Modals
	const reportModalOverlay = document.getElementById('reportModalOverlay');
	const reportModalTitle = document.getElementById('reportModalTitle');
	const reportModalBody = document.getElementById('reportModalBody');
	const closeReportModalButton = document.getElementById('closeReportModalButton');
	const reportOutcome = document.getElementById('reportOutcome');
	const reportDuration = document.getElementById('reportDuration');
	const reportAttackersRemaining = document.getElementById('reportAttackersRemaining');
	const reportLivePreyRemaining = document.getElementById('reportLivePreyRemaining');
	const reportDefendersRemainingContainer = document.getElementById('reportDefendersRemainingContainer');
	const reportDefendersRemaining = document.getElementById('reportDefendersRemaining');
	const reportDeadLysingAttackers = document.getElementById('reportDeadLysingAttackers');
	const reportDeadLysingPrey = document.getElementById('reportDeadLysingPrey');
	const reportDeadLysingDefendersContainer = document.getElementById('reportDeadLysingDefendersContainer');
	const reportDeadLysingDefenders = document.getElementById('reportDeadLysingDefenders');
	const reportCumulativeFirings = document.getElementById('reportCumulativeFirings');
	const reportCumulativeAttKilled = document.getElementById('reportCumulativeAttKilled');
	const reportCumulativePreyKilled = document.getElementById('reportCumulativePreyKilled');
	const reportCumulativeDefKilledContainer = document.getElementById('reportCumulativeDefKilledContainer');
	const reportCumulativeDefKilled = document.getElementById('reportCumulativeDefKilled');
	const reportCumulativeAttLysed = document.getElementById('reportCumulativeAttLysed');
	const reportCumulativePreyLysed = document.getElementById('reportCumulativePreyLysed');
	const reportCumulativeDefLysedContainer = document.getElementById('reportCumulativeDefLysedContainer');
	const reportCumulativeDefLysed = document.getElementById('reportCumulativeDefLysed');
	const reportTotalCPRGConverted = document.getElementById('reportTotalCPRGConverted');
	const openHelpModalButton = document.getElementById('openHelpModal');
	const helpModalOverlay = document.getElementById('helpModalOverlay');
	const closeHelpModalButton = document.getElementById('closeHelpModalButton');
	const openLiteratureModalButton = document.getElementById('openLiteratureModal'); // New
	const literatureModalOverlay = document.getElementById('literatureModalOverlay'); // New
	const closeLiteratureModalButton = document.getElementById('closeLiteratureModalButton'); // New
	const viewGraphButton = document.getElementById('viewGraphButton');
	const loadStateGroup = document.getElementById('loadStateGroup'); // NEW
	const loadStepNumberInput = document.getElementById('loadStepNumberInput'); // NEW
	const loadArenaStateToManualButton = document.getElementById('loadArenaStateToManualButton'); // NEW
	const graphModalOverlay = document.getElementById('graphModalOverlay');
	const closeGraphModalButton = document.getElementById('closeGraphModalButton');

	let simulationChart = null;
	// Presets Modal
	const openPresetsModalButton = document.getElementById('openPresetsModalButton');
	const presetsModalOverlay = document.getElementById('presetsModalOverlay');
	const closePresetsModalButton = document.getElementById('closePresetsModalButton');
	const presetsModalBody = document.getElementById('presetsModalBody');
	const applyActivePresetButton = document.getElementById('applyActivePresetButton');
	// Preset Group 1: Density
	const densityFillSlider = document.getElementById('densityFillSlider');
	const densityFillDisplay = document.getElementById('densityFillDisplay');
	const densityAttPreyRatioSlider = document.getElementById('densityAttPreyRatioSlider');
	const densityRatioDisplay = document.getElementById('densityRatioDisplay');
	// Preset Group 2: Sensitivity
	const sensitivityFillSlider = document.getElementById('sensitivityFillSlider');
	const sensitivityFillDisplay = document.getElementById('sensitivityFillDisplay');
	const sensitivityAttPreyRatioSlider = document.getElementById('sensitivityAttPreyRatioSlider');
	const sensitivityRatioDisplay = document.getElementById('sensitivityRatioDisplay');
	// Preset Group 3: Contact & Kin Exclusion
	const contactKinContactSensingSlider = document.getElementById('contactKinContactSensingSlider');
	const contactKinContactSensingDisplay = document.getElementById('contactKinContactSensingDisplay');
	const contactKinKinExclusionSlider = document.getElementById('contactKinKinExclusionSlider');
	const contactKinKinExclusionDisplay = document.getElementById('contactKinKinExclusionDisplay');
	const contactKinFillSlider = document.getElementById('contactKinFillSlider');
	const contactKinFillDisplay = document.getElementById('contactKinFillDisplay');
	const contactKinAttPreyRatioSlider = document.getElementById('contactKinAttPreyRatioSlider');
	const contactKinRatioDisplay = document.getElementById('contactKinRatioDisplay');
	// Preset Group 4: Tit-for-Tat
	const titfortatFillSlider = document.getElementById('titfortatFillSlider');
	const titfortatFillDisplay = document.getElementById('titfortatFillDisplay');
	// Preset Group 5: Capsule
	const capsuleProtectionSlider = document.getElementById('capsuleProtectionSlider');
	const capsuleProtectionDisplay = document.getElementById('capsuleProtectionDisplay');
	const capsuleTimeSlider = document.getElementById('capsuleTimeSlider');
	const capsuleTimeDisplay = document.getElementById('capsuleTimeDisplay');
	const capsuleFillSlider = document.getElementById('capsuleFillSlider');
	const capsuleFillDisplay = document.getElementById('capsuleFillDisplay');
	const capsuleAttPreyRatioSlider = document.getElementById('capsuleAttPreyRatioSlider');
	const capsuleRatioDisplay = document.getElementById('capsuleRatioDisplay');
	// Preset Group 6: Predation
	const predationLysesPerRepSlider = document.getElementById('predationLysesPerRepSlider');
	const predationLysesPerRepDisplay = document.getElementById('predationLysesPerRepDisplay');
	const predationFillSlider = document.getElementById('predationFillSlider');
	const predationFillDisplay = document.getElementById('predationFillDisplay');
	const predationAttPreyRatioSlider = document.getElementById('predationAttPreyRatioSlider');
	const predationRatioDisplay = document.getElementById('predationRatioDisplay');
	// Preset Group 7: Movement
	const movementPreyAiProdSlider = document.getElementById('movementPreyAiProdSlider');
	const movementPreyAiProdDisplay = document.getElementById('movementPreyAiProdDisplay');
	const movementAttMoveProbSlider = document.getElementById('movementAttMoveProbSlider');
	const movementAttMoveProbDisplay = document.getElementById('movementAttMoveProbDisplay');
	const movementAttMoveDirSlider = document.getElementById('movementAttMoveDirSlider');
	const movementAttMoveDirDisplay = document.getElementById('movementAttMoveDirDisplay');
	const movementArenaRadiusSlider = document.getElementById('movementArenaRadiusSlider');
	const movementArenaRadiusDisplay = document.getElementById('movementArenaRadiusDisplay');
	const movementFillSlider = document.getElementById('movementFillSlider');
	const movementFillDisplay = document.getElementById('movementFillDisplay');
	const movementAttPreyRatioSlider = document.getElementById('movementAttPreyRatioSlider');
	const movementRatioDisplay = document.getElementById('movementRatioDisplay');
	// Preset Group 8: Quorum Sensing
	const attackerQSProdSlider = document.getElementById('attackerQSProdSlider');
	const attackerQSProdDisplay = document.getElementById('attackerQSProdDisplay');
	const attackerQSKSlider = document.getElementById('attackerQSKSlider');
	const attackerQSKDisplay = document.getElementById('attackerQSKDisplay');
	const attackerQSNSlider = document.getElementById('attackerQSNSlider');
	const attackerQSNDisplay = document.getElementById('attackerQSNDisplay');
	const preyQSProdSlider = document.getElementById('preyQSProdSlider');
	const preyQSProdDisplay = document.getElementById('preyQSProdDisplay');
	const preyQSKSlider = document.getElementById('preyQSKSlider');
	const preyQSKDisplay = document.getElementById('preyQSKDisplay');
	const preyQSNSlider = document.getElementById('preyQSNSlider');
	const preyQSNDisplay = document.getElementById('preyQSNDisplay');
	const attackerQSArenaFillSlider = document.getElementById('attackerQSArenaFillSlider');
	const attackerQSArenaFillDisplay = document.getElementById('attackerQSArenaFillDisplay');
	const attackerQSAttPreyRatioSlider = document.getElementById('attackerQSAttPreyRatioSlider');
	const attackerQSRatioDisplay = document.getElementById('attackerQSRatioDisplay');

	// Preset Group 9: Prey Toxin Production
	const preyToxinArenaRadiusSlider = document.getElementById('preyToxinArenaRadiusSlider');
	const preyToxinArenaRadiusDisplay = document.getElementById('preyToxinArenaRadiusDisplay');
	const preyToxinFillSlider = document.getElementById('preyToxinFillSlider');
	const preyToxinFillDisplay = document.getElementById('preyToxinFillDisplay');
	const preyToxinAttPreyRatioSlider = document.getElementById('preyToxinAttPreyRatioSlider');
	const preyToxinRatioDisplay = document.getElementById('preyToxinRatioDisplay');
	const preyToxinStartProbabilitySlider = document.getElementById('preyToxinStartProbabilitySlider');
	const preyToxinStartProbabilityDisplay = document.getElementById('preyToxinStartProbabilityDisplay');
	const preyToxinNLProdSlider = document.getElementById('preyToxinNLProdSlider');
	const preyToxinNLProdDisplay = document.getElementById('preyToxinNLProdDisplay');
	const preyToxinLProdSlider = document.getElementById('preyToxinLProdSlider');
	const preyToxinLProdDisplay = document.getElementById('preyToxinLProdDisplay');

	// Preset Group 10: Battle Royale
	const brArenaRadiusSlider = document.getElementById('brArenaRadiusSlider');
	const brArenaRadiusDisplay = document.getElementById('brArenaRadiusDisplay');
	const brFillSlider = document.getElementById('brFillSlider');
	const brFillDisplay = document.getElementById('brFillDisplay');
	const brAttackerPercentSlider = document.getElementById('brAttackerPercentSlider');
	const brAttackerPercentDisplay = document.getElementById('brAttackerPercentDisplay');
	const brAttackerPercentMaxDisplay = document.getElementById('brAttackerPercentMaxDisplay');
	const brDefenderPercentSlider = document.getElementById('brDefenderPercentSlider');
	const brDefenderPercentDisplay = document.getElementById('brDefenderPercentDisplay');
	const brDefenderPercentMaxDisplay = document.getElementById('brDefenderPercentMaxDisplay');
	const brMixDisplay = document.getElementById('brMixDisplay');
	// Sliders
	const brAttMovementSlider = document.getElementById('brAttMovementSlider');
	const brAttMovementDisplay = document.getElementById('brAttMovementDisplay');
	const brDefSelectivitySlider = document.getElementById('brDefSelectivitySlider');
	const brDefSelectivityDisplay = document.getElementById('brDefSelectivityDisplay');
	// Checkboxes
	const brAttQsCheckbox = document.getElementById('brAttQsCheckbox');
	const brAttKinCheckbox = document.getElementById('brAttKinCheckbox');
	const brAttContactCheckbox = document.getElementById('brAttContactCheckbox');
	const brAttPredationCheckbox = document.getElementById('brAttPredationCheckbox');
	const brPreyMovementCheckbox = document.getElementById('brPreyMovementCheckbox');
	const brPreyAiCheckbox = document.getElementById('brPreyAiCheckbox');
	const brPreyCapsuleCheckbox = document.getElementById('brPreyCapsuleCheckbox');
	const brPreyToxinCheckbox = document.getElementById('brPreyToxinCheckbox');
	const brPreyToxinStartProbabilitySlider = document.getElementById('brPreyToxinStartProbabilitySlider');
	const brPreyToxinStartProbabilityDisplay = document.getElementById('brPreyToxinStartProbabilityDisplay');
	const brDefMovementCheckbox = document.getElementById('brDefMovementCheckbox');
	const brDefPredationCheckbox = document.getElementById('brDefPredationCheckbox');
	
	const parameterToElementIdMap = {
		"Arena_Radius": "arenaGridRadiusInput",
		"Simulation_Duration_Minutes": "totalSimulationMinutesInput",
		"Simulation_Step_Delay_ms": "simulationSpeedInput",
		"Simulation_Render_Rate_every_N_steps": "renderRateInput",
		"Simulation_History_Record_Rate": "historyRecordRateInput",
	    "Simulation_Seed": "simulationSeedInput",
		"Arena_State_Export_Enabled": "saveArenaStatesCheckbox",
        "Full_State_History_Enabled": "saveFullHistoryCheckbox",
		"Image_Export_Enabled": "saveImagesCheckbox",
		"Image_Export_Size_px": "imageExportWidthInput",
		"Image_Buffer_Size_Limit_MB": "imageBufferSizeLimitInput",
        "History_Buffer_Size_Limit_MB": "historyBufferSizeLimitInput",
	    "Arena_State_Buffer_Size_Limit_MB": "arenaStateBufferSizeLimitInput",
		"Attacker_Initial_Count": "initialAttackersInput",
		"Attacker_Replication_Mean_min": "attackerReplicationMeanInput",
		"Attacker_Replication_Range_min": "attackerReplicationRangeInput",
		"Attacker_T6SS_Fire_Cooldown_Min_min": "t6ssFireCooldownMinInput",
		"Attacker_T6SS_Fire_Cooldown_Max_min": "t6ssFireCooldownMaxInput",
		"Attacker_T6SS_Precision_Percent": "attackerPrecisionInput",
		"Attacker_T6SS_Contact_Sensing_Bias_Percent": "attackerContactSensingBiasInput",
		"Attacker_T6SS_Kin_Exclusion_Percent": "attackerKinExclusionInput",
		"Attacker_T6SS_Kin_Exclusion_Penalty_min": "attackerKinExclusionPenaltyInput",
		"Attacker_T6SS_NL_Units_per_Hit": "attNonLyticUnitsPerHitInput",
		"Attacker_T6SS_NL_Delivery_Chance_Percent": "attNonLyticDeliveryChanceInput",
		"Attacker_T6SS_L_Units_per_Hit": "attLyticUnitsPerHitInput",
		"Attacker_T6SS_L_Delivery_Chance_Percent": "attLyticDeliveryChanceInput",
		"Attacker_Sensitivity_NL_Units_to_Die": "attNonLyticUnitsToDieInput",
		"Attacker_Sensitivity_L_Units_to_Lyse": "attLyticUnitsToLyseInput",
		"Attacker_Sensitivity_Base_Lysis_Delay_min": "attBaseLysisDelayInput",
		"Attacker_Movement_Cooldown_Min_min": "attackerMoveCooldownMinInput",
		"Attacker_Movement_Cooldown_Max_min": "attackerMoveCooldownMaxInput",
		"Attacker_Movement_Probability_Percent": "attackerMoveProbabilityInput",
		"Attacker_Movement_Directionality_Percent": "attackerMoveDirectionalityInput",
		"Attacker_Movement_Prey_AI_Attraction_Percent": "attackerMovePreyAiAttractionInput",
		"Attacker_Movement_Prey_AI_Attraction_Threshold": "attackerMovePreyAiAttractionThresholdInput",
		"Attacker_QS_Production_Rate_per_min": "attackerQSProductionRateInput",
		"Attacker_QS_Degradation_Rate_Percent_per_min": "attackerQSDegradationRateInput",
		"Attacker_QS_Diffusion_Rate": "attackerQSDiffusionRateInput",
		"Attacker_QS_Activation_Midpoint_K": "attackerQSMidpointInput",
		"Attacker_QS_Cooperativity_n": "attackerQSCooperativityInput",
        "Attacker_Replication_Reward_Lyses_per_Reward": "attackerLysesPerReplicationInput",
        "Attacker_Replication_Reward_Mean_min": "attackerReplicationRewardMeanInput",
        "Attacker_Replication_Reward_Range_min": "attackerReplicationRewardRangeInput",
		"Prey_Initial_Count": "initialPreyInput",
		"Prey_Replication_Mean_min": "preyReplicationMeanInput",
		"Prey_Replication_Range_min": "preyReplicationRangeInput",
		"Prey_Sensitivity_vs_Att_NL_Units_to_Die": "preyNonLyticUnitsToDieAttInput",
		"Prey_Sensitivity_vs_Att_L_Units_to_Lyse": "preyLyticUnitsToLyseAttInput",
		"Prey_Sensitivity_vs_Att_Base_Lysis_Delay_min": "preyBaseLysisDelayAttInput",
		"Prey_Resistance_vs_Att_NL_Percent": "preyNonLyticResistanceAttInput",
		"Prey_Resistance_vs_Att_L_Percent": "preyLyticResistanceAttInput",
		"Prey_Sensitivity_vs_Def_NL_Units_to_Die": "preyNonLyticUnitsToDieDefInput",
		"Prey_Sensitivity_vs_Def_L_Units_to_Lyse": "preyLyticUnitsToLyseDefInput",
		"Prey_Sensitivity_vs_Def_Base_Lysis_Delay_min": "preyBaseLysisDelayDefInput",
		"Prey_Resistance_vs_Def_NL_Percent": "preyNonLyticResistanceDefInput",
		"Prey_Resistance_vs_Def_L_Percent": "preyLyticResistanceDefInput",
		"Prey_LacZ_Units_per_Lysis": "lacZPerPreyInput",
		"Prey_Movement_Cooldown_Min_min": "preyMoveCooldownMinInput",
		"Prey_Movement_Cooldown_Max_min": "preyMoveCooldownMaxInput",
		"Prey_Movement_Probability_Percent": "preyMoveProbabilityInput",
		"Prey_Movement_Directionality_Percent": "preyMoveDirectionalityInput",
	    "Prey_QS_Production_Rate_per_min": "preyQSProductionRateInput",
	    "Prey_QS_Degradation_Rate_Percent_per_min": "preyQSDegradationRateInput",
	    "Prey_QS_Diffusion_Rate": "preyQSDiffusionRateInput",
		"Prey_Capsule_System_Enabled": "preyCapsuleSystemEnabledCheckbox",
		"Prey_Capsule_Max_Protection_Percent": "preyCapsuleMaxProtectionInput",
		"Prey_Capsule_Derepression_Midpoint_K": "preyCapsuleDerepressionMidpointInput",
	    "Prey_Capsule_Cooperativity_n": "preyCapsuleCooperativityInput",
		"Prey_Capsule_Cooldown_Min_min": "preyCapsuleCooldownMinInput",
		"Prey_Capsule_Cooldown_Max_min": "preyCapsuleCooldownMaxInput",
		"Defender_Initial_Count": "initialDefendersInput",
		"Defender_Replication_Mean_min": "defenderReplicationMeanInput",
		"Defender_Replication_Range_min": "defenderReplicationRangeInput",
		"Defender_Retaliation_Sense_Chance_Percent": "defenderSenseChanceInput",
		"Defender_Retaliation_Max_Shots": "defenderMaxRetaliationsInput",
		"Defender_Random_Fire_Cooldown_Min_min": "defenderRandomFireCooldownMinInput",
		"Defender_Random_Fire_Cooldown_Max_min": "defenderRandomFireCooldownMaxInput",
		"Defender_Random_Fire_Chance_Percent": "defenderRandomFireChanceInput",
		"Defender_T6SS_NL_Units_per_Hit": "defNonLyticUnitsPerHitInput",
		"Defender_T6SS_NL_Delivery_Chance_Percent": "defNonLyticDeliveryChanceInput",
		"Defender_T6SS_L_Units_per_Hit": "defLyticUnitsPerHitInput",
		"Defender_T6SS_L_Delivery_Chance_Percent": "defLyticDeliveryChanceInput",
		"Defender_Sensitivity_vs_Att_NL_Units_to_Die": "defNonLyticUnitsToDieInput",
		"Defender_Sensitivity_vs_Att_L_Units_to_Lyse": "defLyticUnitsToLyseInput",
		"Defender_Sensitivity_vs_Att_Base_Lysis_Delay_min": "defBaseLysisDelayInput",
		"Defender_Resistance_vs_Att_NL_Percent": "defNonLyticResistanceInput",
		"Defender_Resistance_vs_Att_L_Percent": "defLyticResistanceInput",
		"Defender_Movement_Cooldown_Min_min": "defenderMoveCooldownMinInput",
		"Defender_Movement_Cooldown_Max_min": "defenderMoveCooldownMaxInput",
		"Defender_Movement_Probability_Percent": "defenderMoveProbabilityInput",
		"Defender_Movement_Directionality_Percent": "defenderMoveDirectionalityInput",
        "Defender_Replication_Reward_Lyses_per_Reward": "defenderLysesPerReplicationInput",
        "Defender_Replication_Reward_Mean_min": "defenderReplicationRewardMeanInput",
        "Defender_Replication_Reward_Range_min": "defenderReplicationRewardRangeInput",
		"CPRG_Initial_Substrate_Units": "initialCPRGSubstrateInput",
		"CPRG_LacZ_kcat_Units_per_min_per_LacZ": "lacZKcatInput",
		"CPRG_LacZ_Km_Units": "lacZKmInput",
		"Prey_Toxin_NL_Production_Rate_per_min": "preyToxinNLProductionRateInput",
		"Prey_Toxin_NL_Degradation_Rate_Percent_per_min": "preyToxinNLDegradationRateInput",
		"Prey_Toxin_NL_Diffusion_Rate": "preyToxinNLDiffusionRateInput",
		"Prey_Toxin_L_Production_Rate_per_min": "preyToxinLProductionRateInput",
		"Prey_Toxin_L_Degradation_Rate_Percent_per_min": "preyToxinLDegradationRateInput",
		"Prey_Toxin_L_Diffusion_Rate": "preyToxinLDiffusionRateInput",
		"Prey_Toxin_Trigger_Mode": "preyToxinTriggerModeSelect",
		"Prey_Toxin_QS_Derepression_Midpoint_K": "preyToxinQSDerepressionMidpointInput",
		"Prey_Toxin_QS_Cooperativity_n": "preyToxinQSCooperativityInput",
		"Prey_Toxin_Release_On_Lysis": "preyToxinReleaseOnLysisCheckbox",
		"Prey_Toxin_Lysis_Threshold_Min": "preyToxinLysisThresholdMinInput",
		"Prey_Toxin_Lysis_Threshold_Max": "preyToxinLysisThresholdMaxInput",
		"Prey_Toxin_Start_Probability_Percent": "preyToxinStartProbabilityInput",
		"Prey_Toxin_Initiation_Threshold": "preyToxinInitiationThresholdInput",
		"Attacker_Resistance_vs_Prey_Toxin_NL_Percent": "attackerResistanceVsPreyToxinNLInput",
		"Attacker_Resistance_vs_Prey_Toxin_L_Percent": "attackerResistanceVsPreyToxinLInput",
		"Attacker_Prey_Toxin_NL_Threshold": "attackerThresholdVsPreyToxinNLInput",
		"Attacker_Prey_Toxin_L_Threshold": "attackerThresholdVsPreyToxinLInput",
		"Attacker_Prey_Toxin_NL_Absorption_Rate_Percent": "attackerAbsorptRateVsPreyToxinNLInput",
		"Attacker_Prey_Toxin_L_Absorption_Rate_Percent": "attackerAbsorptRateVsPreyToxinLInput",
		"Defender_Resistance_vs_Prey_Toxin_NL_Percent": "defenderResistanceVsPreyToxinNLInput",
		"Defender_Resistance_vs_Prey_Toxin_L_Percent": "defenderResistanceVsPreyToxinLInput",
		"Defender_Prey_Toxin_NL_Threshold": "defenderThresholdVsPreyToxinNLInput",
		"Defender_Prey_Toxin_L_Threshold": "defenderThresholdVsPreyToxinLInput",
		"Defender_Prey_Toxin_NL_Absorption_Rate_Percent": "defenderAbsorptRateVsPreyToxinNLInput",
		"Defender_Prey_Toxin_L_Absorption_Rate_Percent": "defenderAbsorptRateVsPreyToxinLInput"
	};

	// This is the single source of truth for all simulation parameters.
	// It is applied on page load to set the default state.
	// All constants are in config.js
	const SIMULATION_DEFAULTS = AppConfig.defaults;

	// This table lists *only* the parameters that *differ* from the baseline.
	// All constants are in config.js
	const PRESET_OVERRIDES = AppConfig.baselineOverrides;
	
	// This schema is CRUCIAL for saving and loading space-efficiently.
	// --- Mappings to convert repetitive strings to integers for space efficiency ---
	const TYPE_TO_INT = { 'attacker': 0, 'prey': 1, 'defender': 2, 'barrier': 3 };
	const INT_TO_TYPE = ['attacker', 'prey', 'defender', 'barrier'];

	// ---  The schema is updated to store the numerical part of the ID ---
	const CELL_SCHEMA = [
		'q', 'r', 'type', 'id_num', // 'id' is now 'id_num'
		'movementCooldown', 'replicationCooldown',
		'accumulatedNonLyticToxins', 'accumulatedLyticToxins',
		'accumulatedPreyToxinNL', 'accumulatedPreyToxinL',
		'isDead', 'isLysing', 'lysisTimer', 'isEffectivelyGone',
		// Attacker-specific
		't6ssFireCooldownTimer',
		// Defender-specific
		'sensedAttackFromKey', 'isRetaliating', 'retaliationTargetKey',
		'retaliationsRemainingThisBurst', 'currentMaxRetaliationsForBurst',
		't6ssRandomFireCooldownTimer',
		// Prey-specific
		'capsuleLayers', 'capsuleCooldown', 'isFormingCapsule',
		'kills', 'lyses',
		'claimedReplicationRewards',
		'internalPreyToxinNL', 'internalPreyToxinL', 'isPreyToxinProducer',
		'preyToxinLysisThreshold',
		'continuousToxinProduced'
	];

	let rng; // This will hold our PRNG instance

	// --- Optimized Struct-of-Arrays Wrappers ---
	class CellMap extends Map {
		constructor(radius) {
			super();
			this.radius = radius || 0;
			this.width = (this.radius * 2) + 1;
			this.maxCells = this.width * this.width;
			this.grid = new Array(this.maxCells);
		}
		getIndex(q, r) { if (q < -this.radius || q > this.radius || r < -this.radius || r > this.radius) return -1; return (q + this.radius) * this.width + (r + this.radius); }
		clear() {
			super.clear();
			this.grid = new Array(this.maxCells);
		}
		has(key) {
			return super.has(key);
		}
		get(key) {
			return super.get(key);
		}
		getByCoords(q, r) {
			const idx = this.getIndex(q, r);
			if (idx >= 0 && idx < this.maxCells) return this.grid[idx];
			return undefined;
		}
		set(key, cell) {
			const idx = this.getIndex(cell.q, cell.r);
			if (idx < 0 || idx >= this.maxCells) return this;
			this.grid[idx] = cell;
			super.set(key, cell);
			return this;
		}
		delete(key) {
			const [q, r] = key.split(',').map(Number);
			const idx = this.getIndex(q, r);
			if (idx >= 0 && idx < this.maxCells && this.grid[idx] !== undefined) {
				this.grid[idx] = undefined;
				super.delete(key);
				return true;
			}
			return false;
		}
		compact() {}
	}

	class FloatGrid {
		constructor(radius) {
			this.radius = radius || 0;
			this.width = (this.radius * 2) + 1;
			this.maxCells = this.width * this.width;
			this.grid = new Float64Array(this.maxCells);
		}
		getIndex(q, r) { if (q < -this.radius || q > this.radius || r < -this.radius || r > this.radius) return -1; return (q + this.radius) * this.width + (r + this.radius); }
		clear() { this.grid.fill(0); }
		_fastIndex(key) {
			const comma = key.indexOf(',');
			const q = +(key.slice(0, comma));
			const r = +(key.slice(comma + 1));
			return this.getIndex(q, r);
		}
		has(key) {
			const idx = this._fastIndex(key);
			return idx >= 0 && idx < this.maxCells;
		}
		get(key) {
			const idx = this._fastIndex(key);
			return (idx >= 0 && idx < this.maxCells) ? this.grid[idx] : 0;
		}
		set(key, value) {
			const idx = this._fastIndex(key);
			if (idx >= 0 && idx < this.maxCells) {
				this.grid[idx] = value;
			}
			return this;
		}
		forEach(callback) {
			// This is very slow, but maintains compatibility for drawing/exports
			for (let q = -this.radius; q <= this.radius; q++) {
				const rMin = Math.max(-this.radius, -q - this.radius);
				const rMax = Math.min(this.radius, -q + this.radius);
				for (let r = rMin; r <= rMax; r++) {
					const idx = this.getIndex(q, r);
					const val = this.grid[idx];
					if (val > 0) callback(val, `${q},${r}`, this);
				}
			}
		}
		entries() {
			const entriesArr = [];
			this.forEach((val, key) => entriesArr.push([key, val]));
			return entriesArr;
		}
		[Symbol.iterator]() { return this.entries()[Symbol.iterator](); }
	}

	// --- Simulation State ---
	let simState = {
		cells: new CellMap(0),
		nextCellId: 0,
		isInitialized: false,
		isRunning: false,
		isStepping: false,
		manualSetupActive: false,
		selectedManualCellType: 'prey',
		simulationStepCount: 0,
		timeoutId: null,
	    historyEnabled: true,
		saveArenaStatesEnabled: true,
		saveImagesEnabled: false,
		imageExportResolution: { width: 1000, height: 1000 },
		capturedImagesDataURLs: [],
		capturedArenaStatesTSV: [],
		capturedArenaStatesTSVTotalSize: 0,
		directoryHandle: null, // New property to store the directory handle
		isDrawingWithDrag: false,       // True when mouse is down and dragging to draw
		lastPlacedHexKeyDuringDrag: null, // Stores the 'q,r' key of the last hex a cell was placed in during a drag
		activePresetConfig: { ...AppConfig.presetDefaults }, // will be populated from defaults in config.js
		config: {}, // will be populated from defaults in config.js
		offsetX: 0,
		offsetY: 0,
		activeFiringsThisStep: new Map(),
		attackerAiGrid: new FloatGrid(0),
		preyAiGrid: new FloatGrid(0),
		preyToxinNLGrid: new FloatGrid(0),
		preyToxinLGrid: new FloatGrid(0),
		lastHoveredHexKey: null, // To store the 'q,r' key of the last valid hex hovered
		firingsThisStep: 0,
		killedThisStep: { attacker: 0, prey: 0, defender: 0 },
		lysedThisStep: { attacker: 0, prey: 0, defender: 0 },
		cumulativeFirings: 0,
		cumulativeKills: { attacker: 0, prey: 0, defender: 0 },
		cumulativeLyses: { attacker: 0, prey: 0, defender: 0 },
		totalCPRGConverted: 0,
		remainingCPRGSubstrate: 0,
		totalActiveLacZReleased: 0,
		totalArenaSpaces: 0,
		historicalData: [],
		finalStateRecorded: false,
        areCellsInSync: true, // Tracks if cells match the current seed state
        rngDrawCount: 0,      // Tracks how many times the RNG has been used since last seed
		history: [],
		isScrubbing: false, // To know when the user is using the time-travel slider
		isRenderingFromHistory: false,
		renderCancelled: false,
		isImportingSession: false,
		importSessionCancelled: false,
        capturedImagesTotalSize: 0,
        isWaitingForBatchDownload: false,
		optimizedHistoryFrames: new Map(),
        capturedHistoryTotalSize: 0,
		lastMouseX: null,
		lastMouseY: null,
	    runTimestamp: null,
	    realTimeStartTime: null,
	    realTimeElapsedMs: 0,
        lastUiUpdateTime: 0,
	    lastRngCounts: [],
		isHistoryPlaying: false,

	};

	let neighborCache = new Map();
	let neighborCacheIdx = null;
	let pixelCoordinatesCache = new Map();
	let mainEmptyGridCanvas = null;
	let exportEmptyGridCanvas = null;
	let exportEmptyGridCanvasKey = "";
	const BR_TOXIN_START_PROB_VALUES = [0.001, 0.003, 0.01, 0.03, 0.1, 0.3];

	class SimulationDB {
		constructor() {
			this.sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
			this.dbName = "BacFighT6_DB_" + this.sessionId;
			this.dbVersion = 1;
			this.db = null;

			window.addEventListener("beforeunload", () => {
				if (this.db) {
					this.db.close();
				}
				if (indexedDB && indexedDB.deleteDatabase) {
					indexedDB.deleteDatabase(this.dbName);
				}
			});
		}

		async cleanupOldDatabases() {
			try {
				if (indexedDB.databases) {
					const dbs = await indexedDB.databases();
					for (const dbInfo of dbs) {
						if (dbInfo.name && dbInfo.name.startsWith("BacFighT6_DB_") && dbInfo.name !== this.dbName) {
							indexedDB.deleteDatabase(dbInfo.name);
						}
					}
				} else {
					// Fallback legacy cleanup
					if (indexedDB.deleteDatabase) {
						indexedDB.deleteDatabase("BacFighT6_DB");
					}
				}
			} catch (e) {
				console.warn("Could not cleanup old databases", e);
			}
		}

		init() {
			this.cleanupOldDatabases();
			return new Promise((resolve, reject) => {
				const request = indexedDB.open(this.dbName, this.dbVersion);
				request.onupgradeneeded = (event) => {
					const db = event.target.result;
					if (!db.objectStoreNames.contains("history")) {
						db.createObjectStore("history", { keyPath: "step" });
					}
					if (!db.objectStoreNames.contains("images")) {
						db.createObjectStore("images", { keyPath: "step" });
					}
					if (!db.objectStoreNames.contains("arena_states")) {
						db.createObjectStore("arena_states", { keyPath: "step" });
					}
				};
				request.onsuccess = (event) => {
					this.db = event.target.result;
					resolve(this.db);
				};
				request.onerror = (event) => {
					console.error("IndexedDB initialization error:", event.target.error);
					reject(event.target.error);
				};
			});
		}

		clearAll() {
			return new Promise((resolve, reject) => {
				if (!this.db) { resolve(); return; }
				const transaction = this.db.transaction(["history", "images", "arena_states"], "readwrite");
				transaction.objectStore("history").clear();
				transaction.objectStore("images").clear();
				transaction.objectStore("arena_states").clear();
				transaction.oncomplete = () => resolve();
				transaction.onerror = (e) => reject(e.target.error);
			});
		}

		// History methods
		putHistory(step, data) {
			return new Promise((resolve, reject) => {
				const transaction = this.db.transaction("history", "readwrite");
				transaction.objectStore("history").put({ step, data });
				transaction.oncomplete = () => resolve();
				transaction.onerror = (e) => reject(e.target.error);
			});
		}

		getHistory(step) {
			return new Promise((resolve, reject) => {
				const transaction = this.db.transaction("history", "readonly");
				const request = transaction.objectStore("history").get(step);
				request.onsuccess = () => resolve(request.result ? request.result.data : null);
				request.onerror = (e) => reject(e.target.error);
			});
		}

		getAllHistory() {
			return new Promise((resolve, reject) => {
				const transaction = this.db.transaction("history", "readonly");
				const request = transaction.objectStore("history").getAll();
				request.onsuccess = () => resolve(request.result.map(item => item.data));
				request.onerror = (e) => reject(e.target.error);
			});
		}

		clearHistory() {
			return new Promise((resolve, reject) => {
				const transaction = this.db.transaction("history", "readwrite");
				transaction.objectStore("history").clear();
				transaction.oncomplete = () => resolve();
				transaction.onerror = (e) => reject(e.target.error);
			});
		}

		deleteHistoryGreaterThan(step) {
			return new Promise((resolve, reject) => {
				const transaction = this.db.transaction("history", "readwrite");
				const store = transaction.objectStore("history");
				const range = IDBKeyRange.lowerBound(step, true);
				const request = store.openCursor(range);
				request.onsuccess = (event) => {
					const cursor = event.target.result;
					if (cursor) {
						store.delete(cursor.key);
						cursor.continue();
					} else { resolve(); }
				};
				request.onerror = (e) => reject(e.target.error);
			});
		}

		// Images methods
		putImage(step, dataURL) {
			return new Promise((resolve, reject) => {
				const transaction = this.db.transaction("images", "readwrite");
				transaction.objectStore("images").put({ step, dataURL });
				transaction.oncomplete = () => resolve();
				transaction.onerror = (e) => reject(e.target.error);
			});
		}

		getImage(step) {
			return new Promise((resolve, reject) => {
				const transaction = this.db.transaction("images", "readonly");
				const request = transaction.objectStore("images").get(step);
				request.onsuccess = () => resolve(request.result ? request.result.dataURL : null);
				request.onerror = (e) => reject(e.target.error);
			});
		}

		getAllImages() {
			return new Promise((resolve, reject) => {
				const transaction = this.db.transaction("images", "readonly");
				const request = transaction.objectStore("images").getAll();
				request.onsuccess = () => resolve(request.result.map(item => ({ step: item.step, dataURL: item.dataURL })));
				request.onerror = (e) => reject(e.target.error);
			});
		}

		getImagesBySteps(steps) {
			return new Promise((resolve, reject) => {
				if (steps.length === 0) return resolve(new Map());
				const transaction = this.db.transaction("images", "readonly");
				const store = transaction.objectStore("images");
				const results = new Map();
				let completed = 0;
				let hasError = false;

				for (const step of steps) {
					const request = store.get(step);
					request.onsuccess = () => {
						if (hasError) return;
						if (request.result) results.set(step, request.result.dataURL);
						if (++completed === steps.length) resolve(results);
					};
					request.onerror = (e) => {
						if (!hasError) {
							hasError = true;
							reject(e.target.error);
						}
					};
				}
			});
		}

		deleteImage(step) {
			return new Promise((resolve, reject) => {
				const transaction = this.db.transaction("images", "readwrite");
				transaction.objectStore("images").delete(step);
				transaction.oncomplete = () => resolve();
				transaction.onerror = (e) => reject(e.target.error);
			});
		}

		deleteImagesGreaterThan(step) {
			return new Promise((resolve, reject) => {
				const transaction = this.db.transaction("images", "readwrite");
				const store = transaction.objectStore("images");
				const range = IDBKeyRange.lowerBound(step, true);
				const request = store.openCursor(range);
				request.onsuccess = (event) => {
					const cursor = event.target.result;
					if (cursor) {
						store.delete(cursor.key);
						cursor.continue();
					} else { resolve(); }
				};
				request.onerror = (e) => reject(e.target.error);
			});
		}

		clearImages() {
			return new Promise((resolve, reject) => {
				const transaction = this.db.transaction("images", "readwrite");
				transaction.objectStore("images").clear();
				transaction.oncomplete = () => resolve();
				transaction.onerror = (e) => reject(e.target.error);
			});
		}

		// Arena states methods
		putArenaState(step, tsvData) {
			return new Promise((resolve, reject) => {
				const transaction = this.db.transaction("arena_states", "readwrite");
				transaction.objectStore("arena_states").put({ step, tsvData });
				transaction.oncomplete = () => resolve();
				transaction.onerror = (e) => reject(e.target.error);
			});
		}

		getArenaState(step) {
			return new Promise((resolve, reject) => {
				const transaction = this.db.transaction("arena_states", "readonly");
				const request = transaction.objectStore("arena_states").get(step);
				request.onsuccess = () => resolve(request.result ? request.result.tsvData : null);
				request.onerror = (e) => reject(e.target.error);
			});
		}

		getAllArenaStates() {
			return new Promise((resolve, reject) => {
				const transaction = this.db.transaction("arena_states", "readonly");
				const request = transaction.objectStore("arena_states").getAll();
				request.onsuccess = () => resolve(request.result.map(item => ({ step: item.step, tsvData: item.tsvData })));
				request.onerror = (e) => reject(e.target.error);
			});
		}

		getArenaStatesBySteps(steps) {
			return new Promise((resolve, reject) => {
				if (steps.length === 0) return resolve(new Map());
				const transaction = this.db.transaction("arena_states", "readonly");
				const store = transaction.objectStore("arena_states");
				const results = new Map();
				let completed = 0;
				let hasError = false;

				for (const step of steps) {
					const request = store.get(step);
					request.onsuccess = () => {
						if (hasError) return;
						if (request.result) results.set(step, request.result.tsvData);
						if (++completed === steps.length) resolve(results);
					};
					request.onerror = (e) => {
						if (!hasError) {
							hasError = true;
							reject(e.target.error);
						}
					};
				}
			});
		}

		deleteArenaState(step) {
			return new Promise((resolve, reject) => {
				const transaction = this.db.transaction("arena_states", "readwrite");
				transaction.objectStore("arena_states").delete(step);
				transaction.oncomplete = () => resolve();
				transaction.onerror = (e) => reject(e.target.error);
			});
		}

		deleteArenaStatesGreaterThan(step) {
			return new Promise((resolve, reject) => {
				const transaction = this.db.transaction("arena_states", "readwrite");
				const store = transaction.objectStore("arena_states");
				const range = IDBKeyRange.lowerBound(step, true);
				const request = store.openCursor(range);
				request.onsuccess = (event) => {
					const cursor = event.target.result;
					if (cursor) {
						store.delete(cursor.key);
						cursor.continue();
					} else { resolve(); }
				};
				request.onerror = (e) => reject(e.target.error);
			});
		}

		clearArenaStates() {
			return new Promise((resolve, reject) => {
				const transaction = this.db.transaction("arena_states", "readwrite");
				transaction.objectStore("arena_states").clear();
				transaction.oncomplete = () => resolve();
				transaction.onerror = (e) => reject(e.target.error);
			});
		}
	}

	let dbPromise = null;
	function getDB() {
		if (!dbPromise) {
			const simDB = new SimulationDB();
			dbPromise = simDB.init().then(() => simDB);
		}
		return dbPromise;
	}

	function updateSaveProgress(percentage, textStatus = null) {
		const container = document.getElementById('saveProgressContainer');
		const bar = document.getElementById('saveProgressBar');
		const statusDiv = document.getElementById('saveStatusMessage');
		
		if (container && bar) {
			if (percentage === null) {
				container.classList.add('hidden');
			} else {
				container.classList.remove('hidden');
				bar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
			}
		}
		if (statusDiv && textStatus !== null) {
			statusDiv.textContent = textStatus;
		}
	}

	async function offloadHistoryToDB() {
		const db = await getDB();
		const transaction = db.db.transaction("history", "readwrite");
		const store = transaction.objectStore("history");
		
		for (const [step, frame] of simState.optimizedHistoryFrames.entries()) {
			if (!frame.isOffloaded) {
				store.put({ step: step, data: frame });
				frame.isOffloaded = true;
				frame.cells = [];
				frame.attackerAiGrid = [];
				frame.preyAiGrid = [];
				frame.preyToxinNLGrid = [];
				frame.preyToxinLGrid = [];
			}
		}
		
		return new Promise((resolve, reject) => {
			transaction.oncomplete = () => {
				simState.capturedHistoryTotalSize = 0;
				console.log("History buffer offloaded to IndexedDB successfully.");
				resolve();
			};
			transaction.onerror = (e) => reject(e.target.error);
		});
	}

	async function offloadImagesToDB() {
		const db = await getDB();
		const transaction = db.db.transaction("images", "readwrite");
		const store = transaction.objectStore("images");
		
		for (const img of simState.capturedImagesDataURLs) {
			if (!img.isOffloaded) {
				store.put({ step: img.step, dataURL: img.dataURL });
				img.isOffloaded = true;
				img.dataURL = null; // free memory
			}
		}
		
		return new Promise((resolve, reject) => {
			transaction.oncomplete = () => {
				simState.capturedImagesTotalSize = 0;
				console.log("Images buffer offloaded to IndexedDB successfully.");
				resolve();
			};
			transaction.onerror = (e) => reject(e.target.error);
		});
	}

	async function offloadArenaStatesToDB() {
		const db = await getDB();
		const transaction = db.db.transaction("arena_states", "readwrite");
		const store = transaction.objectStore("arena_states");
		
		for (const state of simState.capturedArenaStatesTSV) {
			if (!state.isOffloaded) {
				store.put({ step: state.step, tsvData: state.tsvData });
				state.isOffloaded = true;
				state.tsvData = null; // free memory
			}
		}
		
		return new Promise((resolve, reject) => {
			transaction.oncomplete = () => {
				simState.capturedArenaStatesTSVTotalSize = 0;
				console.log("Arena states buffer offloaded to IndexedDB successfully.");
				resolve();
			};
			transaction.onerror = (e) => reject(e.target.error);
		});
	}

	async function truncateFutureHistory(stepIndex) {
		// Truncate memory Maps/Arrays
		for (const key of simState.optimizedHistoryFrames.keys()) {
			if (key > stepIndex) {
				simState.optimizedHistoryFrames.delete(key);
			}
		}
		simState.capturedArenaStatesTSV = simState.capturedArenaStatesTSV.filter(s => s.step <= stepIndex);
		simState.capturedImagesDataURLs = simState.capturedImagesDataURLs.filter(img => img.step <= stepIndex);
		simState.historicalData = simState.historicalData.filter(d => d.time <= stepIndex);

		// Truncate database stores
		const db = await getDB();
		await db.deleteHistoryGreaterThan(stepIndex);
		await db.deleteArenaStatesGreaterThan(stepIndex);
		await db.deleteImagesGreaterThan(stepIndex);
	}

	async function getHistoryFrame(stepIndex) {
		const ramFrame = simState.optimizedHistoryFrames.get(stepIndex);
		if (ramFrame && !ramFrame.isOffloaded) {
			return ramFrame;
		}
		const db = await getDB();
		return await db.getHistory(stepIndex);
	}

	async function getHistoryFramesBatch(db, steps) {
		return new Promise((resolve, reject) => {
			const transaction = db.db.transaction("history", "readonly");
			const store = transaction.objectStore("history");
			const results = new Map();
			let completed = 0;
			let hasError = false;

			if (steps.length === 0) {
				resolve(results);
				return;
			}

			for (const step of steps) {
				const request = store.get(step);
				request.onsuccess = () => {
					if (hasError) return;
					if (request.result) {
						results.set(step, request.result.data);
					}
					completed++;
					if (completed === steps.length) {
						resolve(results);
					}
				};
				request.onerror = (e) => {
					if (hasError) return;
					hasError = true;
					reject(e.target.error);
				};
			}
		});
	}

	async function getArenaStateFrame(stepNumber) {
		const ramState = simState.capturedArenaStatesTSV.find(s => s.step === stepNumber);
		if (ramState && !ramState.isOffloaded) {
			return ramState.tsvData;
		}
		const db = await getDB();
		return await db.getArenaState(stepNumber);
	}

	function ensureDataStructuresSize() {
		const rad = simState.config.hexGridActualRadius;
		if (simState.cells.radius !== rad) {
			const newCellMap = new CellMap(rad);
			simState.cells.forEach(cell => {
				if (isWithinHexBounds(cell.q, cell.r, rad)) {
					newCellMap.set(cell.key, cell);
				}
			});
			simState.cells = newCellMap;
			simState.attackerAiGrid = new FloatGrid(rad);
			simState.preyAiGrid = new FloatGrid(rad);
			simState.preyToxinNLGrid = new FloatGrid(rad);
			simState.preyToxinLGrid = new FloatGrid(rad);
			rebuildNeighborCache(rad);
		}
	}

	function rebuildNeighborCache(radius) {
		neighborCache.clear();
		const width = (radius * 2) + 1;
		const maxCells = width * width;
		neighborCacheIdx = new Int32Array(maxCells * 6);
		neighborCacheIdx.fill(-1);

		for (let q = -radius; q <= radius; q++) {
			const rMin = Math.max(-radius, -q - radius);
			const rMax = Math.min(radius, -q + radius);
			for (let r = rMin; r <= rMax; r++) {
				const key = `${q},${r}`;
				const neighbors = [];
				const idx = (q + radius) * width + (r + radius);

				for (let i = 0; i < AXIAL_DIRECTIONS.length; i++) {
					const dir = AXIAL_DIRECTIONS[i];
					const nq = q + dir.q;
					const nr = r + dir.r;
					const isValid = isWithinHexBounds(nq, nr, radius);
					neighbors.push({
						q: nq,
						r: nr,
						key: `${nq},${nr}`,
						direction: dir,
						directionIndex: i,
						isValid: isValid
					});
					
					if (isValid) {
						neighborCacheIdx[idx * 6 + i] = (nq + radius) * width + (nr + radius);
					}
				}
				neighborCache.set(key, neighbors);
			}
		}
	}

	function rebuildPixelCoordinatesCache(radius, visualHexRadius, offsetX, offsetY) {
		pixelCoordinatesCache.clear();
		for (let q = -radius; q <= radius; q++) {
			const rMin = Math.max(-radius, -q - radius);
			const rMax = Math.min(radius, -q + radius);
			for (let r = rMin; r <= rMax; r++) {
				const key = `${q},${r}`;
				const x = offsetX + visualHexRadius * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
				const y = offsetY + visualHexRadius * (3 / 2 * r);
				pixelCoordinatesCache.set(key, { x, y });
			}
		}
	}

	function rebuildEmptyGridCanvas() {
		if (!mainEmptyGridCanvas) {
			mainEmptyGridCanvas = document.createElement('canvas');
		}
		mainEmptyGridCanvas.width = canvas.width;
		mainEmptyGridCanvas.height = canvas.height;
		const oCtx = mainEmptyGridCanvas.getContext('2d');
		oCtx.clearRect(0, 0, canvas.width, canvas.height);

		const logicalGridRadius = simState.config.hexGridActualRadius;
		const visualHexRadius = simState.config.hexRadius;

		for (let q = -logicalGridRadius; q <= logicalGridRadius; q++) {
			const rMin = Math.max(-logicalGridRadius, -q - logicalGridRadius);
			const rMax = Math.min(logicalGridRadius, -q + logicalGridRadius);
			for (let r = rMin; r <= rMax; r++) {
				const key = `${q},${r}`;
				const coords = pixelCoordinatesCache.get(key);
				if (coords) {
					drawHexagonOutline(oCtx, coords.x, coords.y, visualHexRadius);
				}
			}
		}
	}

	function updateMainCanvasSizing() {
		const mainCanvasSizing = setupCanvasAndHexSize(
			canvasContainer.clientWidth, 
			canvasContainer.clientHeight, 
			simState.config.hexGridActualRadius
		);
		canvas.width = mainCanvasSizing.actualCanvasWidth;
		canvas.height = mainCanvasSizing.actualCanvasHeight;
		simState.config.hexRadius = mainCanvasSizing.visualHexRadius;
		simState.offsetX = mainCanvasSizing.calculatedOffsetX;
		simState.offsetY = mainCanvasSizing.calculatedOffsetY;

		rebuildNeighborCache(simState.config.hexGridActualRadius);
		rebuildPixelCoordinatesCache(
			simState.config.hexGridActualRadius, 
			simState.config.hexRadius, 
			simState.offsetX, 
			simState.offsetY
		);
		rebuildEmptyGridCanvas();
	}

	// --- Utility Functions ---

	function applySettingsObject(settingsObject) {
		for (let [paramName, value] of Object.entries(settingsObject)) {
			// Convert legacy parameters
			if (paramName === "Prey_Toxin_QS_Regulated") {
				paramName = "Prey_Toxin_Trigger_Mode";
				value = (value === true || value === 'true' || value === '1') ? 'qs' : 'standard';
			} else if (paramName === "Prey_Toxin_Activation_Mode") {
				paramName = "Prey_Toxin_Trigger_Mode";
				if (value === 'constitutive' || value === 'stochastic') {
					value = 'standard';
				} else if (value === 'toxin') {
					value = 'attacker';
				}
			}

			const elementId = parameterToElementIdMap[paramName];
			if (elementId) {
				// Use "true" to dispatch a change event, just in case
				updateInputElement(elementId, value, true);
			} else {
				// We don't warn for Simulation_Seed, it's handled separately
				if (paramName !== "Simulation_Seed") {
					console.warn(`Preset Warning: Parameter "${paramName}" not found in map.`);
				}
			}
		}
	}

	function applyPresetByName(presetName) {
		// 1. Validate the preset name exists in the config
		// We check if it exists in overrides OR logic. 
		// Note: The UI uses keys like 'battleroyale', 'density', etc.
		const group = presetName.toLowerCase();
		
		if (!PRESET_OVERRIDES[group] && !AppConfig.presetLogic[group]) {
			console.warn(`Preset '${group}' not found.`);
			return;
		}

		console.log(`Applying preset defaults for: ${group}`);

		// 2. Update the internal active config state to match the requested group
		simState.activePresetConfig.group = group;

		// 3. Apply Baseline Overrides (Static settings from config.js)
		const baselineOverrides = PRESET_OVERRIDES[group] || {};
		applySettingsObject(baselineOverrides);

		// 4. Execute Dynamic Logic
		// We use AppConfig.presetDefaults as the source of truth for the preset's 
		// "default" slider positions (e.g., brFillPercent: 30).
		const presetLogicHandler = AppConfig.presetLogic[group]?.handler;

		if (presetLogicHandler) {
			// We pass the global preset defaults. The handler picks the specific fields it needs.
			const dynamicSettings = presetLogicHandler(AppConfig.presetDefaults);
			if (dynamicSettings) {
				applySettingsObject(dynamicSettings);
			}
		}

		// 5. Update UI to reflect that a preset is active (Optional, but good for UX)
		// This highlights the correct group in the modal if the user opens it later.
		const groupElementId = `presetGroup${group.charAt(0).toUpperCase() + group.slice(1)}`;
		setActivePresetGroup(groupElementId);
	}

	function generateShareableLink() {
		const baseUrl = window.location.href.split('?')[0];
		const params = new URLSearchParams();

		// 1. Capture the Seed (Always included for reproducibility)
		const currentSeed = document.getElementById('simulationSeedInput').value;
		params.append('Simulation_Seed', currentSeed);

		// 2. Capture All Other Settings (Only if different from Default)
		for (const [paramName, elementId] of Object.entries(parameterToElementIdMap)) {
			// Skip Seed (handled above)
			if (paramName === 'Simulation_Seed') continue;

			const element = document.getElementById(elementId);
			if (!element) continue;

			let currentValue;
			
			// Handle Checkboxes vs Numbers/Strings
			if (element.type === 'checkbox') {
				currentValue = element.checked;
			} else {
				const val = parseFloat(element.value);
				currentValue = isNaN(val) ? element.value : val;
			}

			// Retrieve Default Value
			const defaultValue = SIMULATION_DEFAULTS[paramName];

			// logic: If the UI value differs from the default, add it to the URL
			if (currentValue !== defaultValue && defaultValue !== undefined) {
				params.append(paramName, currentValue);
			}
		}

		// 3. Generate the Full URL
		const fullUrl = `${baseUrl}?${params.toString()}`;

		// 4. Copy to Clipboard AND Show to User
		navigator.clipboard.writeText(fullUrl).then(() => {
			showLinkModal(fullUrl, true); // true = success copy
		}).catch(err => {
			console.error('Clipboard write failed', err);
			showLinkModal(fullUrl, false); // false = manual copy needed
		});
	}

	// Helper function to reuse the Info Alert Modal for displaying links
	function showLinkModal(url, clipboardSuccess) {
		const overlay = document.getElementById('infoAlertModalOverlay');
		const title = document.getElementById('infoAlertModalTitle');
		const body = document.getElementById('infoAlertModalBody');
		const okBtn = document.getElementById('okInfoAlertButton');
		
		// Customize Title
		title.textContent = clipboardSuccess ? "Link Copied & Generated!" : "Link Generated";

		// Customize Body with an Input Field for the URL
		body.innerHTML = `
			<p class="mb-2 text-sm text-gray-600">
				${clipboardSuccess 
					? "The configuration link has been copied to your clipboard." 
					: "Could not auto-copy. Please copy the link below:"}
			</p>
			<div class="relative">
				<input type="text" readonly value="${url}" 
					class="w-full p-2 border border-gray-300 rounded bg-gray-50 text-xs font-mono text-blue-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
					onclick="this.select();">
			</div>
			<p class="mt-2 text-xs text-gray-500">
				Includes Seed + only changed settings. Cell positions are random unless an Arena file is used.
			</p>
		`;

		const closeModal = () => {
			overlay.classList.add('hidden');
		};

		// 1. Clone the button to remove any old event listeners from previous alerts
		//    This prevents "stacking" actions or zombie listeners.
		const newOkBtn = okBtn.cloneNode(true);
		okBtn.parentNode.replaceChild(newOkBtn, okBtn);

		// 2. Add the new click listener to close the modal
		newOkBtn.addEventListener('click', closeModal, { once: true });
		
		// 3. Also allow closing by clicking the background overlay
		//    (We assume the previous overlay listener is either gone or harmless, 
		//     but adding a specific one for this instance is good practice)
		overlay.addEventListener('click', (e) => {
			if (e.target === overlay) {
				closeModal();
			}
		}, { once: true });

		// Show Modal
		overlay.classList.remove('hidden');
	}

	function generateTimestamp() {
		const now = new Date();
		const year = String(now.getFullYear()).slice(-2);
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const day = String(now.getDate()).padStart(2, '0');
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		const seconds = String(now.getSeconds()).padStart(2, '0');
		return `${year}${month}${day}${hours}${minutes}${seconds}`;
	}
	
	function initializeSeededRNG(seed) {
		if (typeof Math.seedrandom === 'undefined') {
			console.error("Math.seedrandom function not found. Cannot create a seeded PRNG.");
			rng = Math.random;
			return;
		}

		// 1. Create the original, "private" seeded function
		const privateRng = new Math.seedrandom(seed);

		// 2. Redefine the global 'rng' function as a wrapper
		rng = function() {
			if (simState.rngDrawCount === 0) {
				// On the first draw, immediately update the UI
				updateSyncAndRngButtons();
			}
			simState.rngDrawCount++;
			// 3. Call the original, private function and return its value
			let val = privateRng(); return val;
		};

		// 4. Reset the draw count and update the UI
		simState.rngDrawCount = 0;
		updateSyncAndRngButtons();
		console.warn(`--- RNG RESET with seed: "${seed}" ---`);
	}

	// generate a random 6-digit seed
	function generateNewSeed() {
		return Math.floor(100000 + Math.random() * 900000);
	}

	// get a random number based on the given seed
	function getRandomIntInRange(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(rng() * (max - min + 1)) + min;
	}

	function synchronizeRNG(targetCount) {
		// This function assumes the RNG has already been re-seeded and its draw count is 0.
		console.log(`Synchronizing RNG. Target draws: ${targetCount}. Current draws: ${simState.rngDrawCount}`);
		const numbersToBurn = targetCount - simState.rngDrawCount;
		if (numbersToBurn > 0) {
			 console.log(`Fast-forwarding by burning ${numbersToBurn} random numbers...`);
			 for (let i = 0; i < numbersToBurn; i++) {
				 rng();
			 }
			 console.log(`RNG synchronized. Final draw count: ${simState.rngDrawCount}`);
		}
	}


	function checkForRngSpike() {
		// This check can only run if we have data from the previous two steps
		if (simState.lastRngCounts.length < 2) {
			return;
		}

		const count_N_minus_2 = simState.lastRngCounts[0];
		const count_N_minus_1 = simState.lastRngCounts[1];
		const current_count_N = simState.rngDrawCount;

		const previous_delta = count_N_minus_1 - count_N_minus_2;
		const current_delta = current_count_N - count_N_minus_1;

		// Trigger if the current jump is 50% larger than the previous one,
		// and only for significant jumps (e.g., > 100) to avoid flagging small initial fluctuations.
		if (current_delta > (previous_delta * 1.5) && current_delta > 100) {
			console.warn(
				`--- UNEXPECTED RNG SPIKE DETECTED at Step: ${simState.simulationStepCount} ---
				Previous Step's Change (+${previous_delta})
				Current Step's Change  (+${current_delta})`
			);
		}
	}

	function seededShuffle(array, seededRng) {
		let currentIndex = array.length;
		let randomIndex;

		// While there remain elements to shuffle.
		while (currentIndex !== 0) {
			// Pick a remaining element.
			randomIndex = Math.floor(seededRng() * currentIndex);
			currentIndex--;

			// And swap it with the current element.
			const temp = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temp;
		}
		return array;
	}

	async function fetchFileContent(fileURL, fileTypeDesc, responseType = 'text') {
		try {
			const response = await fetch(fileURL);
			if (!response.ok) {
				let errorDetail = response.statusText || `HTTP error ${response.status}`;
				try {
					const errorBody = await response.text();
					if (errorBody) errorDetail += `: ${errorBody.substring(0, 100)}`;
				} catch (e) { /* ignore */ }
				throw new Error(errorDetail);
			}
			
			let content;
			if (responseType === 'arrayBuffer') {
				content = await response.arrayBuffer();
			} else {
				content = await response.text();
			}

			if (!content || (responseType === 'text' && content.trim() === "") || (responseType === 'arrayBuffer' && content.byteLength === 0)) {
				throw new Error(`File from ${fileURL} is empty or invalid.`);
			}
			console.log(`${fileTypeDesc} file content fetched successfully from ${fileURL}`);
			return content;
		} catch (error) {
			console.error(`Error fetching ${fileTypeDesc} file from ${fileURL}:`, error);
			simulationErrorDisplay.textContent = `Error fetching ${fileTypeDesc} file (${fileURL}): ${error.message}. Check URL, network, and CORS policy.`;
			simulationErrorDisplay.classList.remove('hidden');
			return null;
		}
	}

	function parseQrCellString(cellsStr) {
		const operations = [];
		let failedCount = 0;

		if (!cellsStr || cellsStr.trim() === '') {
			return { operations, failedCount };
		}

		// Split the string before each 'q' to separate concatenated cell definitions.
		// The filter(s => s) removes any empty strings that might result from the split.
		const potentialCellParts = cellsStr.split(/(?=q)/).filter(s => s);

		// This regex now validates a SINGLE, complete cell definition from start (^) to end ($).
		// It only allows the valid type characters [APDEB].
		const singleCellRegex = /^q(-?\d+)r(-?\d+)([APDEB])$/;

		for (const part of potentialCellParts) {
			const match = part.match(singleCellRegex);

			if (match) {
				// The part is valid, e.g., "q10r0P"
				try {
					const q = parseInt(match[1], 10);
					const r = parseInt(match[2], 10);
					const typeChar = match[3];
					let cellType = null;
					let action = 'place';

					if (typeChar === 'A') cellType = 'attacker';
					else if (typeChar === 'P') cellType = 'prey';
					else if (typeChar === 'D') cellType = 'defender';
					else if (typeChar === 'B') cellType = 'barrier';
					else if (typeChar === 'E') {
						action = 'remove';
						cellType = null;
					}

					// This check is mostly for safety; the regex should ensure q and r are numbers.
					if (!isNaN(q) && !isNaN(r)) {
						operations.push({ q, r, type: cellType, action: action });
					} else {
						failedCount++;
					}
				} catch (e) {
					console.error("Error processing valid cell part:", part, e);
					failedCount++;
				}
			} else {
				// The part is malformed, e.g., "q0r0C". It did not match the strict regex.
				console.warn(`URL 'cellsData': Malformed part ignored: "${part}"`);
				failedCount++;
			}
		}
		return { operations, failedCount };
	}

	function calculateTheoreticalMaxAI() {
		const p = simState.config.prey.qs.productionRate;
		const d = simState.config.prey.qs.degradationRate; // This is a decimal, e.g., 0.02 for 2%

		// If there is no production, the max is zero.
		if (p === 0) return 0;
		
		// If there is production but no degradation, the concentration
		// would grow infinitely. We return Infinity to represent this.
		if (d === 0) return Infinity;

		return p / d;
	}
	
	// --- Cell Class ---
	class Cell {
		constructor(q, r, type, id, isForRehydration = false) {
			this.q = q;
			this.r = r;
			this.type = type;
			this.id = id;
			this.key = `${q},${r}`;

			// This is crucial for the optimized save/load functions.
			// Universal properties
			this.kills = 0;
			this.lyses = 0;
			this.claimedReplicationRewards = 0;
			this.isDead = false;
			this.isLysing = false;
			this.isEffectivelyGone = false;
			this.lysisTimer = 0;
			this.replicationCooldown = Infinity; // Default to non-replicating
			this.movementCooldown = Infinity;  // Default to non-motile
			this.accumulatedNonLyticToxins = 0;
			this.accumulatedLyticToxins = 0;
			this.accumulatedPreyToxinNL = 0;
			this.accumulatedPreyToxinL = 0;

			// Attacker-specific properties (defaults for others)
			this.t6ssFireCooldownTimer = 0;

			// Defender-specific properties (defaults for others)
			this.sensedAttackFromKey = null;
			this.isRetaliating = false;
			this.retaliationTargetKey = null;
			this.retaliationsRemainingThisBurst = 0;
			this.currentMaxRetaliationsForBurst = 0;
			this.t6ssRandomFireCooldownTimer = 0;

			// Prey-specific properties (defaults for others)
			this.capsuleLayers = 0;
			this.capsuleCooldown = 0;
			this.isFormingCapsule = false;
			this.internalPreyToxinNL = 0;
			this.internalPreyToxinL = 0;
			this.isPreyToxinProducer = false;
			this.preyToxinLysisThreshold = null;
			this.continuousToxinProduced = 0;

			if (type === 'barrier') {
				// Barrier-specific overrides. This part is simple and has no RNG.
				this.replicationCooldown = Infinity;
				// No other overrides are needed because the defaults are correct for a barrier.
			
			} else {
				// This 'else' block handles ALL biological cells ('attacker', 'prey', 'defender').
				
				// 3. This is the fix: Only run RNG-dependent code for NEW cells.
				if (!isForRehydration) {
					// Initialize random cooldowns for movement and replication
					this.movementCooldown = this.getRandomMoveTime();
					this.replicationCooldown = this.getRandomReplicationTime();
					
					// Stagger the initial start times randomly
					this.movementCooldown = getRandomIntInRange(0, this.movementCooldown);
					this.replicationCooldown = getRandomIntInRange(0, this.replicationCooldown);

					// Set initial random T6SS cooldowns for attackers
					if (type === 'attacker') {
						this.resetT6SSFireCooldown(true);
					}
					if (type === 'defender') {
						this.resetRandomFireCooldown(true);
					}
					// Initialize random lysis threshold for prey cells
					if (type === 'prey' && this.isPreyToxinProducer && typeof simState !== 'undefined' && simState.config && simState.config.prey && simState.config.prey.releaseOnLysis) {
						if (this.preyToxinLysisThreshold === null) {
							const minThresh = simState.config.prey.lysisThresholdMin !== undefined ? simState.config.prey.lysisThresholdMin : 200;
							const maxThresh = simState.config.prey.lysisThresholdMax !== undefined ? simState.config.prey.lysisThresholdMax : 1000;
							this.preyToxinLysisThreshold = getRandomIntInRange(minThresh, maxThresh);
						}
					}
				}
			}
		}

		getRandomReplicationTime() {
			if (this.type === 'barrier') return Infinity;

			let rateConfig;
			if (this.type === 'attacker') rateConfig = simState.config.attacker.replication;
			else if (this.type === 'prey') rateConfig = simState.config.prey.replication;
			else if (this.type === 'defender') rateConfig = simState.config.defender.replication;

			if (rateConfig && rateConfig.mean < 0) {
				return Infinity; // Special value means no replication
			}

			if (!rateConfig || typeof rateConfig.mean !== 'number' || typeof rateConfig.range !== 'number') {
				console.warn(`Invalid replication config for ${this.type}. Using default 20.`);
				return 20; 
			}
			return getRandomIntInRange(
				Math.max(1, rateConfig.mean - rateConfig.range),
				rateConfig.mean + rateConfig.range
			);
		}
		
		checkAndApplyReplicationReward() {
			if (this.type !== 'attacker' && this.type !== 'defender') return;

			const rewardConfig = simState.config[this.type].replicationReward;
			// Use 0 to disable the feature, as requested.
			if (!rewardConfig || rewardConfig.lysesPerReward === 0) {
				return;
			}

			// Check if the number of rewards earned is greater than rewards claimed.
			const rewardsEarned = Math.floor(this.lyses / rewardConfig.lysesPerReward);
			if (rewardsEarned > this.claimedReplicationRewards) {
				
				const mean = rewardConfig.mean;
				const range = rewardConfig.range;
				
				// Claim the reward *before* applying it.
				this.claimedReplicationRewards++;
				
				// If mean is -1, the reward is immediate replication.
				if (mean === -1) {
					this.replicationCooldown = 0;
					return;
				}

				const rewardValue = getRandomIntInRange(
					Math.max(1, mean - range),
					mean + range
				);

				// Apply the reward based on the cell's current replication state.
				if (this.replicationCooldown === Infinity) {
					// If the cell isn't in a replication cycle, this reward starts a new one.
					this.replicationCooldown = rewardValue;
				} else {
					// If the cell is already counting down, this reward accelerates it.
					this.replicationCooldown -= rewardValue;
				}

				// Ensure the cooldown doesn't become a negative number.
				if (this.replicationCooldown < 0) {
					this.replicationCooldown = 0;
				}
			}
		}
		
		getRandomMoveTime() {
			if (this.type === 'barrier') return Infinity;

			let moveConfig;
			if (this.type === 'attacker') moveConfig = simState.config.attacker.movement;
			else if (this.type === 'prey') moveConfig = simState.config.prey.movement;
			else if (this.type === 'defender') moveConfig = simState.config.defender.movement;

			if (!moveConfig || typeof moveConfig.cooldownMin !== 'number' || typeof moveConfig.cooldownMax !== 'number') {
				console.warn(`Invalid movement config for ${this.type}. Using default Infinity.`);
				return Infinity; 
			}
			return getRandomIntInRange(
				moveConfig.cooldownMin,
				moveConfig.cooldownMax
			);
		}

		resetT6SSFireCooldown(isInitial = false) {
			if (this.type !== 'attacker') return;
			const minCD = simState.config.attacker.t6ss.fireCooldownMin;
			const maxCD = simState.config.attacker.t6ss.fireCooldownMax;
			let effectiveMax = getRandomIntInRange(minCD, maxCD);
			if (isInitial) {
				 this.t6ssFireCooldownTimer = getRandomIntInRange(0, effectiveMax); 
			} else {
				this.t6ssFireCooldownTimer = effectiveMax;
			}
		}

		resetRandomFireCooldown(isInitial = false) {
			if (this.type !== 'defender') return;
			const minCD = simState.config.defender.randomFiring.cooldownMin;
			const maxCD = simState.config.defender.randomFiring.cooldownMax;
			let effectiveMax = getRandomIntInRange(minCD, maxCD);
			 if (isInitial) {
				this.t6ssRandomFireCooldownTimer = getRandomIntInRange(0, effectiveMax); 
			} else {
				this.t6ssRandomFireCooldownTimer = effectiveMax;
			}
		}

		releasePreyToxins() {
			if (this.type === 'prey') {
				if (this.internalPreyToxinNL > 0) {
					const currentNL = simState.preyToxinNLGrid.get(this.key) || 0;
					simState.preyToxinNLGrid.set(this.key, currentNL + this.internalPreyToxinNL);
					this.internalPreyToxinNL = 0;
				}
				if (this.internalPreyToxinL > 0) {
					const currentL = simState.preyToxinLGrid.get(this.key) || 0;
					simState.preyToxinLGrid.set(this.key, currentL + this.internalPreyToxinL);
					this.internalPreyToxinL = 0;
				}
			}
		}

		decrementCooldowns() {
			if (this.type === 'barrier') return; // Barriers have no cooldowns

			if (this.movementCooldown > 0) this.movementCooldown--;

			if (this.replicationCooldown > 0) this.replicationCooldown--;

			if (this.type === 'attacker' && this.t6ssFireCooldownTimer > 0) {
				this.t6ssFireCooldownTimer--;
			}
			if (this.type === 'defender' && this.t6ssRandomFireCooldownTimer > 0) {
				this.t6ssRandomFireCooldownTimer--;
			}

			if (this.type === 'prey' && this.isFormingCapsule) {
				if (this.capsuleCooldown > 0) {
					this.capsuleCooldown--;
				}
				if (this.capsuleCooldown === 0) {
					if (this.capsuleLayers < 5) {
						this.capsuleLayers++;
					}
					// Reset flag. The main loop will set a new cooldown on the next tick if AI is still high.
					this.isFormingCapsule = false;
				}
			}

			if (this.isLysing && !this.isEffectivelyGone && this.lysisTimer > 0) {
				this.lysisTimer--;
				if (this.lysisTimer <= 0) {
					this.isEffectivelyGone = true;
					simState.lysedThisStep[this.type]++;
					if (this.type === 'prey') {
						simState.totalActiveLacZReleased += simState.config.prey.lacZPerPrey;
						this.releasePreyToxins();
					}
				}
			}
		}

		canReplicate() {
			if (this.type === 'barrier') return false;
		    
		    if (this.replicationCooldown === Infinity) return false;
			if (this.isDead || this.isLysing || this.isEffectivelyGone) return false;
			if (this.type === 'prey' && this.isPreyToxinProducer) return false; // Stop dividing if producing toxin (both lysis and continuous release modes)
			return this.replicationCooldown <= 0;
		}
		
		resetReplicationCooldown() {
			this.replicationCooldown = this.getRandomReplicationTime();
		}

		canMove() {
			if (this.type === 'barrier') return false;
			if (this.isDead || this.isLysing || this.isEffectivelyGone) return false;
			return this.movementCooldown === 0;
		}

		resetMovementCooldown() {
			this.movementCooldown = this.getRandomMoveTime();
		}

		attemptAttackerT6SSFire(currentCellMap) {
			if (this.type !== 'attacker' || this.t6ssFireCooldownTimer > 0) return null;

			let chosenDirectionInfo;
			const radius = simState.config.hexGridActualRadius;
			const cachedNeighbors = neighborCache.get(this.key);
			const occupiedNeighborInfos = [];

			if (cachedNeighbors) {
				const len = cachedNeighbors.length;
				for (let i = 0; i < len; i++) {
					const n = cachedNeighbors[i];
					if (n.isValid) {
						const cell = currentCellMap.get(n.key);
						if (cell && !cell.isEffectivelyGone) {
							occupiedNeighborInfos.push({
								q: n.q,
								r: n.r,
								cell: cell,
								direction: n.direction,
								directionIndex: n.directionIndex
							});
						}
					}
				}
			} else {
				// Fallback if cache is missed
				const neighborInfos = getNeighborInfos(this.q, this.r, currentCellMap);
				const len = neighborInfos.length;
				for (let i = 0; i < len; i++) {
					const n = neighborInfos[i];
					if (n.cell && !n.cell.isEffectivelyGone && isWithinHexBounds(n.q, n.r, radius)) {
						occupiedNeighborInfos.push(n);
					}
				}
			}

			if (rng() < simState.config.attacker.t6ss.contactSensingBias && occupiedNeighborInfos.length > 0) {
				chosenDirectionInfo = occupiedNeighborInfos[Math.floor(rng() * occupiedNeighborInfos.length)];
			} else {
				const randomIndex = Math.floor(rng() * AXIAL_DIRECTIONS.length);
				chosenDirectionInfo = {
					q: this.q + AXIAL_DIRECTIONS[randomIndex].q,
					r: this.r + AXIAL_DIRECTIONS[randomIndex].r,
					direction: AXIAL_DIRECTIONS[randomIndex], 
					directionIndex: randomIndex
				};
			}
			const isPreciseHit = rng() < simState.config.attacker.t6ss.precision;
			return {
				q: chosenDirectionInfo.q,
				r: chosenDirectionInfo.r,
				directionIndex: chosenDirectionInfo.directionIndex,
				isPreciseHit: isPreciseHit
			};
		}

		attemptDefenderRandomFire() {
			if (this.t6ssRandomFireCooldownTimer > 0) return null;
			if (rng() < simState.config.defender.randomFiring.chance) {
				this.resetRandomFireCooldown(); 
				const randomDirectionIndex = Math.floor(rng() * AXIAL_DIRECTIONS.length);
				const fireDirection = AXIAL_DIRECTIONS[randomDirectionIndex];
				const targetQ = this.q + fireDirection.q;
				const targetR = this.r + fireDirection.r;
				return { q: targetQ, r: targetR, directionIndex: randomDirectionIndex };
			}
			return null;
		}

		attemptRetaliationFire() {
			if (!this.isRetaliating || this.retaliationsRemainingThisBurst <= 0 || !this.retaliationTargetKey) {
				return null;
			}
			if (this.retaliationTargetKey === null || typeof this.retaliationTargetKey !== 'string') {
				this.isRetaliating = false; this.retaliationTargetKey = null; this.retaliationsRemainingThisBurst = 0; return null;
			}
			this.retaliationsRemainingThisBurst--;
			const parts = this.retaliationTargetKey.split(',');
			if (this.retaliationsRemainingThisBurst === 0) {
				this.isRetaliating = false; this.retaliationTargetKey = null;
			}
			return { q: parseInt(parts[0]), r: parseInt(parts[1]) };
		}

		receiveHit(attackerCell) {
			// --- Capsule Resistance Check ---
			if (!attackerCell || this.type === 'barrier' || this.isEffectivelyGone) return;
			const attackerType = attackerCell.type;
			
			if (this.type === 'prey' && this.capsuleLayers > 0 && simState.config.prey.capsule.isEnabled) {
				// Get the user-defined max protection (e.g., 80 for 80%) and convert to a probability (0.80)
				const maxProtectionChance = simState.config.prey.capsule.maxProtection / 100.0;
				// Calculate protection per layer based on the max
				const protectionPerLayer = maxProtectionChance / 5.0;
				// Calculate total chance for the current number of layers
				const harmlessChance = this.capsuleLayers * protectionPerLayer;

				if (rng() < harmlessChance) {
					return; // Attack is harmless, do nothing.
				}
			}
			
			if (this.type === 'barrier') return; // Barriers are unaffected by hits
			if (this.isEffectivelyGone) return; 
			let sensitivityConfig, resistanceConfig, effectorConfig;

			if (this.type === 'prey') {
				if (attackerType === 'attacker') {
					sensitivityConfig = simState.config.prey.sensitivityToAttacker;
					resistanceConfig = simState.config.prey.sensitivityToAttacker; 
					effectorConfig = simState.config.attacker.t6ss;
				} else if (attackerType === 'defender') {
					sensitivityConfig = simState.config.prey.sensitivityToDefender;
					resistanceConfig = simState.config.prey.sensitivityToDefender;
					effectorConfig = simState.config.defender.t6ss;
				} else return; 
			} else if (this.type === 'attacker' && attackerType === 'defender') {
				sensitivityConfig = simState.config.attacker.sensitivity;
				resistanceConfig = { nonLyticResistanceChance: 0, lyticResistanceChance: 0 };
				effectorConfig = simState.config.defender.t6ss;
			} else if (this.type === 'defender' && attackerType === 'attacker') {
				if (attackerCell) this.sensedAttackFromKey = `${attackerCell.q},${attackerCell.r}`;
				sensitivityConfig = simState.config.defender.sensitivity;
				resistanceConfig = simState.config.defender.sensitivity; 
				effectorConfig = simState.config.attacker.t6ss;
			} else if (this.type === 'defender' && attackerType === 'defender') {
				if (attackerCell) this.sensedAttackFromKey = `${attackerCell.q},${attackerCell.r}`;
				return;
			} else return;

			if (effectorConfig.nonLyticUnitsPerHit > 0 && rng() < effectorConfig.nonLyticDeliveryChance) {
				if (rng() >= (resistanceConfig.nonLyticResistanceChance || 0) && !this.isDead) {
					this.accumulatedNonLyticToxins += effectorConfig.nonLyticUnitsPerHit;
				}
			}
			if (effectorConfig.lyticUnitsPerHit > 0 && rng() < effectorConfig.lyticDeliveryChance) {
				if (rng() >= (resistanceConfig.lyticResistanceChance || 0)) {
					this.accumulatedLyticToxins += effectorConfig.lyticUnitsPerHit;
				}
			}
			this.updateStateBasedOnToxins(sensitivityConfig, attackerCell);
		}
		
		updateStateBasedOnToxins(sensitivityConfig, attackerCell) {
			if (this.type === 'barrier') return; // Barriers don't have toxin states

			const oldIsDead = this.isDead;
			const oldIsLysing = this.isLysing;

			if (!this.isDead && sensitivityConfig.nonLyticUnitsToDie > 0 &&
				this.accumulatedNonLyticToxins >= sensitivityConfig.nonLyticUnitsToDie) {
				this.isDead = true;
			}

			if (!this.isLysing && !this.isEffectivelyGone &&
				sensitivityConfig.lyticUnitsToLyse > 0 &&
				this.accumulatedLyticToxins >= sensitivityConfig.lyticUnitsToLyse) {
				this.isDead = true; 
				this.isLysing = true;
				const effectiveLyticUnits = Math.max(1, this.accumulatedLyticToxins); 
				this.lysisTimer = Math.ceil(sensitivityConfig.baseLysisDelay / effectiveLyticUnits);
				if (this.lysisTimer <= 0) { 
					this.isEffectivelyGone = true;
					if (!oldIsLysing) { 
						simState.lysedThisStep[this.type]++;
						 if (this.type === 'prey') {
							simState.totalActiveLacZReleased += simState.config.prey.lacZPerPrey;
							this.releasePreyToxins();
						}
					}
				}
			}

			// --- NEW REWARD LOGIC ---
			// If the cell's state just changed to 'dead', credit the attacker.
			if (this.isDead && !oldIsDead) {
				simState.killedThisStep[this.type]++;
				if (attackerCell && (attackerCell.type === 'attacker' || attackerCell.type === 'defender')) {
					attackerCell.kills = (attackerCell.kills || 0) + 1;
				}
			}
			// If the cell's state just changed to 'lysing', credit the attacker.
			if (this.isLysing && !oldIsLysing) {
				if (attackerCell && (attackerCell.type === 'attacker' || attackerCell.type === 'defender')) {
					attackerCell.lyses = (attackerCell.lyses || 0) + 1;
					// Check for and apply the replication reward
					attackerCell.checkAndApplyReplicationReward();
				}
			}
		}
	}

	function isWithinHexBounds(q, r, gridRadius) {
		return Math.abs(q) <= gridRadius && Math.abs(r) <= gridRadius && Math.abs(q + r) <= gridRadius;
	}

	function calculateTotalArenaSpaces(radius) {
		return 1 + 3 * radius * (radius + 1);
	}

function calculateAndSetCellCountsByPercentage(fillPercent, attPercent, defPercent) {
	const arenaRadius = parseInt(arenaGridRadiusInput.value) || simState.config.hexGridActualRadius;
	const totalSpaces = 1 + 3 * arenaRadius * (arenaRadius + 1);
	const totalCellsToPlace = Math.round(totalSpaces * (fillPercent / 100));

	const preyPercent = 100 - attPercent - defPercent;

	let attCount = Math.round(totalCellsToPlace * (attPercent / 100));
	let defCount = Math.round(totalCellsToPlace * (defPercent / 100));
	let preyCount = Math.round(totalCellsToPlace * (preyPercent / 100));

	// Adjust rounding errors to match total
	const currentTotal = attCount + preyCount + defCount;
	if (currentTotal !== totalCellsToPlace) {
		preyCount += (totalCellsToPlace - currentTotal);
	}

	updateInputElement('initialAttackersInput', Math.max(0, attCount));
	updateInputElement('initialPreyInput', Math.max(0, preyCount));
	updateInputElement('initialDefendersInput', Math.max(0, defCount));
}

	function updatePercentFullDisplay() {
		const requestedAttackers = parseInt(simState.config.attacker.initialCount) || 0;
		const requestedPrey = parseInt(simState.config.prey.initialCount) || 0;
		const requestedDefenders = parseInt(simState.config.defender.initialCount) || 0;
		const totalRequested = requestedAttackers + requestedPrey + requestedDefenders;
		if (simState.totalArenaSpaces > 0) {
			const percent = Math.min(100, (totalRequested / simState.totalArenaSpaces) * 100);
			percentFullDisplay.textContent = percent.toFixed(1) + '%';
		} else {
			percentFullDisplay.textContent = 'N/A';
		}
	}


	function updateConfigFromUI(isFullConfigRead = false) {
		
		const config = simState.config; // Get a reference
		config.attacker = config.attacker || {};
		config.attacker.replication = config.attacker.replication || {};
		config.attacker.replicationReward = config.attacker.replicationReward || {};
		config.attacker.movement = config.attacker.movement || {};
		config.attacker.qs = config.attacker.qs || {};
		config.attacker.t6ss = config.attacker.t6ss || {};
		config.attacker.sensitivity = config.attacker.sensitivity || {};
		
		config.prey = config.prey || {};
		config.prey.replication = config.prey.replication || {};
		config.prey.movement = config.prey.movement || {};
		config.prey.qs = config.prey.qs || {};
		config.prey.capsule = config.prey.capsule || {};
		config.prey.sensitivityToAttacker = config.prey.sensitivityToAttacker || {};
		config.prey.sensitivityToDefender = config.prey.sensitivityToDefender || {};

		config.defender = config.defender || {};
		config.defender.replication = config.defender.replication || {};
		config.defender.replicationReward = config.defender.replicationReward || {};
		config.defender.movement = config.defender.movement || {};
		config.defender.retaliation = config.defender.retaliation || {};
		config.defender.randomFiring = config.defender.randomFiring || {};
		config.defender.t6ss = config.defender.t6ss || {};
		config.defender.sensitivity = config.defender.sensitivity || {};

		config.cprg = config.cprg || {};
		config.simulationControl = config.simulationControl || {};		
		
		if (isFullConfigRead) { 
			 simState.config.hexGridActualRadius = parseInt(arenaGridRadiusInput.value);
			 simState.totalArenaSpaces = calculateTotalArenaSpaces(simState.config.hexGridActualRadius);
			 totalSpacesDisplay.textContent = simState.totalArenaSpaces;
		}

		simState.saveImagesEnabled = saveImagesCheckbox.checked;
		simState.saveArenaStatesEnabled = saveArenaStatesCheckbox.checked; // New
	    simState.config.historyEnabled = document.getElementById('saveFullHistoryCheckbox').checked; // NEW

		const imageExportSize = parseInt(imageExportWidthInput.value) || 1000;
		simState.imageExportResolution = { width: imageExportSize, height: imageExportSize };

		simState.config.arenaStateBuffer = { sizeLimitMB: parseInt(document.getElementById('arenaStateBufferSizeLimitInput').value) || 0 };
        simState.config.exports = { sizeThresholdForZip: parseInt(document.getElementById('imageBufferSizeLimitInput').value) || 0 };
        simState.config.history = { sizeLimitMB: parseInt(document.getElementById('historyBufferSizeLimitInput').value) || 0 };


		simState.config.attacker.initialCount = parseInt(initialAttackersInput.value);
		simState.config.attacker.replication = { mean: parseInt(attackerReplicationMeanInput.value), range: parseInt(attackerReplicationRangeInput.value) };
		simState.config.attacker.replicationReward = {
			lysesPerReward: parseInt(attackerLysesPerReplicationInput.value),
			mean: parseInt(attackerReplicationRewardMeanInput.value),
			range: parseInt(attackerReplicationRewardRangeInput.value)
		};
		simState.config.attacker.movement = {
			cooldownMin: parseInt(attackerMoveCooldownMinInput.value),
			cooldownMax: parseInt(attackerMoveCooldownMaxInput.value),
			probability: parseFloat(attackerMoveProbabilityInput.value) / 100,
			directionality: parseFloat(attackerMoveDirectionalityInput.value) / 100, // Convert from %
			preyAiAttractionThreshold: parseFloat(attackerMovePreyAiAttractionThresholdInput.value), // Read raw value
			preyAiAttraction: parseFloat(attackerMovePreyAiAttractionInput.value) / 100

		};
		simState.config.attacker.qs.productionRate = parseFloat(attackerQSProductionRateInput.value);
		simState.config.attacker.qs.degradationRate = parseFloat(attackerQSDegradationRateInput.value) / 100; // Convert from %
		simState.config.attacker.qs.diffusionRate = parseFloat(attackerQSDiffusionRateInput.value);
		simState.config.attacker.qs.midpoint = parseFloat(attackerQSMidpointInput.value);
		simState.config.attacker.qs.cooperativity = parseFloat(attackerQSCooperativityInput.value);
		simState.config.attacker.t6ss.fireCooldownMin = parseInt(t6ssFireCooldownMinInput.value);
		simState.config.attacker.t6ss.fireCooldownMax = parseInt(t6ssFireCooldownMaxInput.value);
		simState.config.attacker.t6ss.precision = parseFloat(attackerPrecisionInput.value) / 100;
		simState.config.attacker.t6ss.contactSensingBias = parseFloat(attackerContactSensingBiasInput.value) / 100;
		simState.config.attacker.t6ss.kinExclusion = parseFloat(attackerKinExclusionInput.value) / 100;
		simState.config.attacker.t6ss.kinExclusionPenalty = parseInt(attackerKinExclusionPenaltyInput.value); 
		simState.config.attacker.t6ss.nonLyticUnitsPerHit = parseInt(attNonLyticUnitsPerHitInput.value);
		simState.config.attacker.t6ss.nonLyticDeliveryChance = parseFloat(attNonLyticDeliveryChanceInput.value) / 100;
		simState.config.attacker.t6ss.lyticUnitsPerHit = parseInt(attLyticUnitsPerHitInput.value);
		simState.config.attacker.t6ss.lyticDeliveryChance = parseFloat(attLyticDeliveryChanceInput.value) / 100;
		simState.config.attacker.sensitivity.nonLyticUnitsToDie = parseInt(attNonLyticUnitsToDieInput.value);
		simState.config.attacker.sensitivity.lyticUnitsToLyse = parseInt(attLyticUnitsToLyseInput.value);
		simState.config.attacker.sensitivity.baseLysisDelay = parseInt(attBaseLysisDelayInput.value);
		simState.config.attacker.sensitivity.preyToxinNLResistanceChance = (parseFloat(attackerResistanceVsPreyToxinNLInput.value) || 0) / 100;
		simState.config.attacker.sensitivity.preyToxinLResistanceChance = (parseFloat(attackerResistanceVsPreyToxinLInput.value) || 0) / 100;
		simState.config.attacker.sensitivity.preyToxinNLAbsorptionRate = (parseFloat(attackerAbsorptRateVsPreyToxinNLInput.value) || 0) / 100;
		simState.config.attacker.sensitivity.preyToxinLAbsorptionRate = (parseFloat(attackerAbsorptRateVsPreyToxinLInput.value) || 0) / 100;
		simState.config.attacker.sensitivity.preyToxinNLThreshold = parseInt(attackerThresholdVsPreyToxinNLInput.value) || 1;
		simState.config.attacker.sensitivity.preyToxinLThreshold = parseInt(attackerThresholdVsPreyToxinLInput.value) || 1;

		simState.config.prey.initialCount = parseInt(initialPreyInput.value);
		simState.config.prey.replication = { mean: parseInt(preyReplicationMeanInput.value), range: parseInt(preyReplicationRangeInput.value) };
		simState.config.prey.movement = {
			cooldownMin: parseInt(preyMoveCooldownMinInput.value),
			cooldownMax: parseInt(preyMoveCooldownMaxInput.value),
			probability: parseFloat(preyMoveProbabilityInput.value) / 100,
			directionality: parseFloat(preyMoveDirectionalityInput.value) / 100
		};
		simState.config.prey.qs.productionRate = parseFloat(document.getElementById('preyQSProductionRateInput').value);
		simState.config.prey.qs.degradationRate = parseFloat(document.getElementById('preyQSDegradationRateInput').value) / 100;
		simState.config.prey.qs.diffusionRate = parseFloat(document.getElementById('preyQSDiffusionRateInput').value);
		simState.config.prey.toxinNL = {
			productionRate: parseFloat(preyToxinNLProductionRateInput.value) || 0,
			degradationRate: (parseFloat(preyToxinNLDegradationRateInput.value) || 0) / 100,
			diffusionRate: parseFloat(preyToxinNLDiffusionRateInput.value) || 0
		};
		simState.config.prey.toxinL = {
			productionRate: parseFloat(preyToxinLProductionRateInput.value) || 0,
			degradationRate: (parseFloat(preyToxinLDegradationRateInput.value) || 0) / 100,
			diffusionRate: parseFloat(preyToxinLDiffusionRateInput.value) || 0
		};
		// Backward compatibility fallback object
		simState.config.prey.toxin = {
			productionRate: simState.config.prey.toxinNL.productionRate,
			degradationRate: simState.config.prey.toxinNL.degradationRate,
			diffusionRate: simState.config.prey.toxinNL.diffusionRate,
			nlToxicity: 1.0,
			lToxicity: 1.0
		};
		const triggerMode = preyToxinTriggerModeSelect ? preyToxinTriggerModeSelect.value : 'standard';
		simState.config.prey.triggerMode = triggerMode;
		simState.config.prey.toxinQS = {
			isRegulated: (triggerMode === 'qs'),
			midpoint: parseFloat(preyToxinQSDerepressionMidpointInput.value),
			cooperativity: parseFloat(preyToxinQSCooperativityInput.value)
		};
		simState.config.prey.toxinAttackerTriggered = (triggerMode === 'attacker');
		simState.config.prey.releaseOnLysis = preyToxinReleaseOnLysisCheckbox.checked;
		simState.config.prey.lysisThresholdMin = parseInt(preyToxinLysisThresholdMinInput.value) || 200;
		simState.config.prey.lysisThresholdMax = parseInt(preyToxinLysisThresholdMaxInput.value) || 1000;
		simState.config.prey.startProbability = parseFloat(preyToxinStartProbabilityInput.value) / 100;
		simState.config.prey.toxinInitiationThreshold = parseInt(preyToxinInitiationThresholdInput.value) || 2;
		simState.config.prey.capsule = {
			isEnabled: preyCapsuleSystemEnabledCheckbox.checked,
			maxProtection: parseInt(preyCapsuleMaxProtectionInput.value),
			midpoint: parseFloat(preyCapsuleDerepressionMidpointInput.value),
            cooperativity: parseFloat(preyCapsuleCooperativityInput.value),
			cooldownMin: parseInt(preyCapsuleCooldownMinInput.value),
			cooldownMax: parseInt(preyCapsuleCooldownMaxInput.value)
		};
		simState.config.prey.sensitivityToAttacker.nonLyticUnitsToDie = parseInt(preyNonLyticUnitsToDieAttInput.value);
		simState.config.prey.sensitivityToAttacker.lyticUnitsToLyse = parseInt(preyLyticUnitsToLyseAttInput.value);
		simState.config.prey.sensitivityToAttacker.baseLysisDelay = parseInt(preyBaseLysisDelayAttInput.value);
		simState.config.prey.sensitivityToAttacker.nonLyticResistanceChance = parseFloat(preyNonLyticResistanceAttInput.value) / 100;
		simState.config.prey.sensitivityToAttacker.lyticResistanceChance = parseFloat(preyLyticResistanceAttInput.value) / 100;
		simState.config.prey.sensitivityToDefender.nonLyticUnitsToDie = parseInt(preyNonLyticUnitsToDieDefInput.value);
		simState.config.prey.sensitivityToDefender.lyticUnitsToLyse = parseInt(preyLyticUnitsToLyseDefInput.value);
		simState.config.prey.sensitivityToDefender.baseLysisDelay = parseInt(preyBaseLysisDelayDefInput.value);
		simState.config.prey.sensitivityToDefender.nonLyticResistanceChance = parseFloat(preyNonLyticResistanceDefInput.value) / 100;
		simState.config.prey.sensitivityToDefender.lyticResistanceChance = parseFloat(preyLyticResistanceDefInput.value) / 100;
		simState.config.prey.lacZPerPrey = parseInt(lacZPerPreyInput.value);

		simState.config.defender.initialCount = parseInt(initialDefendersInput.value);
		simState.config.defender.replication = { mean: parseInt(defenderReplicationMeanInput.value), range: parseInt(defenderReplicationRangeInput.value) };
		simState.config.defender.replicationReward = {
			lysesPerReward: parseInt(defenderLysesPerReplicationInput.value),
			mean: parseInt(defenderReplicationRewardMeanInput.value),
			range: parseInt(defenderReplicationRewardRangeInput.value)
		};

		simState.config.defender.movement = {
			cooldownMin: parseInt(defenderMoveCooldownMinInput.value),
			cooldownMax: parseInt(defenderMoveCooldownMaxInput.value),
			probability: parseFloat(defenderMoveProbabilityInput.value) / 100,
			directionality: parseFloat(defenderMoveDirectionalityInput.value) / 100
		};
		simState.config.defender.retaliation.senseChance = parseFloat(defenderSenseChanceInput.value) / 100;
		simState.config.defender.retaliation.maxRetaliations = parseInt(defenderMaxRetaliationsInput.value);
		simState.config.defender.randomFiring.cooldownMin = parseInt(defenderRandomFireCooldownMinInput.value);
		simState.config.defender.randomFiring.cooldownMax = parseInt(defenderRandomFireCooldownMaxInput.value);
		simState.config.defender.randomFiring.chance = parseFloat(defenderRandomFireChanceInput.value) / 100;
		simState.config.defender.t6ss.nonLyticUnitsPerHit = parseInt(defNonLyticUnitsPerHitInput.value);
		simState.config.defender.t6ss.nonLyticDeliveryChance = parseFloat(defNonLyticDeliveryChanceInput.value) / 100;
		simState.config.defender.t6ss.lyticUnitsPerHit = parseInt(defLyticUnitsPerHitInput.value);
		simState.config.defender.t6ss.lyticDeliveryChance = parseFloat(defLyticDeliveryChanceInput.value) / 100;
		simState.config.defender.sensitivity.nonLyticUnitsToDie = parseInt(defNonLyticUnitsToDieInput.value);
		simState.config.defender.sensitivity.lyticUnitsToLyse = parseInt(defLyticUnitsToLyseInput.value);
		simState.config.defender.sensitivity.baseLysisDelay = parseInt(defBaseLysisDelayInput.value);
		simState.config.defender.sensitivity.nonLyticResistanceChance = parseFloat(defNonLyticResistanceInput.value) / 100;
		simState.config.defender.sensitivity.lyticResistanceChance = parseFloat(defLyticResistanceInput.value) / 100;
		simState.config.defender.sensitivity.preyToxinNLResistanceChance = (parseFloat(defenderResistanceVsPreyToxinNLInput.value) || 0) / 100;
		simState.config.defender.sensitivity.preyToxinLResistanceChance = (parseFloat(defenderResistanceVsPreyToxinLInput.value) || 0) / 100;
		simState.config.defender.sensitivity.preyToxinNLAbsorptionRate = (parseFloat(defenderAbsorptRateVsPreyToxinNLInput.value) || 0) / 100;
		simState.config.defender.sensitivity.preyToxinLAbsorptionRate = (parseFloat(defenderAbsorptRateVsPreyToxinLInput.value) || 0) / 100;
		simState.config.defender.sensitivity.preyToxinNLThreshold = parseInt(defenderThresholdVsPreyToxinNLInput.value) || 1;
		simState.config.defender.sensitivity.preyToxinLThreshold = parseInt(defenderThresholdVsPreyToxinLInput.value) || 1;

		simState.config.cprg.initialSubstrate = parseInt(initialCPRGSubstrateInput.value) || 1; 
		if (simState.simulationStepCount === 0) {
			simState.remainingCPRGSubstrate = simState.config.cprg.initialSubstrate;
		}
		simState.config.cprg.k_cat = parseFloat(lacZKcatInput.value) || 0;
		simState.config.cprg.Km = parseFloat(lacZKmInput.value) || 1; 
		simState.config.simulationControl.simulationSpeedMs = parseInt(simulationSpeedInput.value);
		simState.config.simulationControl.totalSimulationMinutes = parseInt(totalSimulationMinutesInput.value);
	    simState.config.simulationControl.renderRate = parseInt(document.getElementById('renderRateInput').value) || 1;
		
		const historyRecordRateInput = document.getElementById('historyRecordRateInput');
		simState.config.historyRecordRate = historyRecordRateInput ? (parseInt(historyRecordRateInput.value, 10) || 1) : 1;

		updatePercentFullDisplay(); 

		// If simulation has not started, sync existing cells' producer state with the updated config
		if (simState.simulationStepCount === 0 && simState.cells) {
			simState.cells.forEach(cell => {
				if (cell.type === 'prey') {
					cell.isPreyToxinProducer = false;
					cell.internalPreyToxinNL = 0;
					cell.internalPreyToxinL = 0;
					cell.continuousToxinProduced = 0;
					cell.preyToxinLysisThreshold = null;
				}
			});
		}
	}

	function setupCanvasAndHexSize(targetCanvasWidth, targetCanvasHeight, logicalGridRadius) {
		const minHexRadius = 2;
		let paddingFactor = 1.05; 

		let radiusBasedOnWidth = targetCanvasWidth / (Math.sqrt(3) * (2 * logicalGridRadius + 1) * paddingFactor);
		let radiusBasedOnHeight = targetCanvasHeight / (1.5 * (2 * logicalGridRadius + 1) * paddingFactor);
		const visualHexRadius = Math.max(minHexRadius, Math.floor(Math.min(radiusBasedOnWidth, radiusBasedOnHeight)));

		const actualCanvasWidth = Math.sqrt(3) * visualHexRadius * (2 * logicalGridRadius + 1) + visualHexRadius * 0.5; 
		const actualCanvasHeight = 1.5 * visualHexRadius * (2 * logicalGridRadius + 1) + visualHexRadius * 0.5;

		const offsetX = actualCanvasWidth / 2;
		const offsetY = actualCanvasHeight / 2;

		return {
			visualHexRadius: visualHexRadius,
			calculatedOffsetX: offsetX,
			calculatedOffsetY: offsetY,
			actualCanvasWidth: actualCanvasWidth, 
			actualCanvasHeight: actualCanvasHeight
		};
	}


	function pixelToAxial(pixelX, pixelY, visualHexRadius, offsetX, offsetY) {
		if (visualHexRadius === 0) return { q: 0, r: 0 };

		const canvasX = pixelX - offsetX;
		const canvasY = pixelY - offsetY;

		const q_frac = (Math.sqrt(3)/3 * canvasX - 1/3 * canvasY) / visualHexRadius;
		const r_frac = (2/3 * canvasY) / visualHexRadius;
		const s_frac = -q_frac - r_frac; 

		let q = Math.round(q_frac);
		let r = Math.round(r_frac);
		let s = Math.round(s_frac);

		const q_diff = Math.abs(q - q_frac);
		const r_diff = Math.abs(r - r_frac);
		const s_diff = Math.abs(s - s_frac);

		if (q_diff > r_diff && q_diff > s_diff) {
			q = -r - s;
		} else if (r_diff > s_diff) {
			r = -q - s;
		} 
		return { q, r };
	}

	async function resetSimulationState() {
		// 1. Stop any running simulation
		if (simState.isRunning || simState.isStepping) {
			simState.isRunning = false;
			simState.isStepping = false;
			clearTimeout(simState.timeoutId);
		}
		if (simState.isHistoryPlaying) {
			stopHistory();
		}

		// 2. Re-initialize the RNG with the seed currently in the input field
		const currentSeed = simulationSeedInput.value;
	    console.log(`Calling initializeSeededRNG. Seed value from UI is: "${currentSeed}"`);
		initializeSeededRNG(currentSeed);

		// Clear IndexedDB stores
		const db = await getDB();
		await db.clearAll();

		// 3. Clear all simulation data
		const currentRadius = simState.config ? simState.config.hexGridActualRadius : 100;
		simState.cells = new CellMap(currentRadius);
		simState.nextCellId = 0;
		simState.simulationStepCount = 0;
		simState.activeFiringsThisStep.clear();
		simState.firingsThisStep = 0;
		simState.attackerAiGrid = new FloatGrid(currentRadius);
		simState.preyAiGrid = new FloatGrid(currentRadius);
		simState.preyToxinNLGrid = new FloatGrid(currentRadius);
		simState.preyToxinLGrid = new FloatGrid(currentRadius);
		simState.killedThisStep = { attacker: 0, prey: 0, defender: 0 };
		simState.lysedThisStep = { attacker: 0, prey: 0, defender: 0 };
		simState.cumulativeFirings = 0;
		simState.cumulativeKills = { attacker: 0, prey: 0, defender: 0 };
		simState.cumulativeLyses = { attacker: 0, prey: 0, defender: 0 };
		simState.totalCPRGConverted = 0;
		simState.remainingCPRGSubstrate = simState.config.cprg.initialSubstrate;
		simState.totalActiveLacZReleased = 0;
		simState.historicalData = [];
		simState.lastRngCounts = [];
		simState.capturedImagesDataURLs = [];
		simState.capturedArenaStatesTSV = [];
		simState.capturedArenaStatesTSVTotalSize = 0;
		simState.directoryHandle = null;
		simState.finalStateRecorded = false;
		simState.history = [];
		simState.optimizedHistoryFrames = new Map();
        simState.capturedHistoryTotalSize = 0;
		simState.isScrubbing = false;
		simState.isInitialized = false;
	    simState.runTimestamp = null;
	    simState.realTimeStartTime = null;
	    simState.realTimeElapsedMs = 0;
        simState.lastUiUpdateTime = 0;
		simState.lastHoveredHexKey = null;
		exportEmptyGridCanvas = null;
		exportEmptyGridCanvasKey = "";

		// 4. Update the UI
		canvas.style.backgroundColor = DEFAULT_CANVAS_BG_COLOR;
		drawGrid();
		updateStats();
		updateButtonStatesAndUI();
		updateTimeTravelSlider();
	}

	async function initializeBlankSlate() {
		const newSeed = generateNewSeed();
		simulationSeedInput.value = newSeed;
		await resetSimulationState();
	}

	function populateCellsRandomly() {
	    console.log(`populateCellsRandomly called at step ${simState.simulationStepCount}`);

		let numAttackersToPlace = simState.config.attacker.initialCount || 0;
		let numPreyToPlace = simState.config.prey.initialCount || 0;
		let numDefendersToPlace = simState.config.defender.initialCount || 0;

		const totalRequested = numAttackersToPlace + numPreyToPlace + numDefendersToPlace;
		const availableSpaces = simState.totalArenaSpaces;

		if (totalRequested > availableSpaces && totalRequested > 0) {
			const attackerRatio = numAttackersToPlace / totalRequested;
			const preyRatio = numPreyToPlace / totalRequested;
			
			numAttackersToPlace = Math.round(availableSpaces * attackerRatio);
			numPreyToPlace = Math.round(availableSpaces * preyRatio);
			numDefendersToPlace = availableSpaces - numAttackersToPlace - numPreyToPlace;
			if (numDefendersToPlace < 0) numDefendersToPlace = 0; 
		} else if (totalRequested === 0) {
			 numAttackersToPlace = 0;
			 numPreyToPlace = 0;
			 numDefendersToPlace = 0;
		}


		const currentGridRadius = simState.config.hexGridActualRadius;
		const typesAndCounts = [
			{ type: 'attacker', count: numAttackersToPlace },
			{ type: 'prey', count: numPreyToPlace },
			{ type: 'defender', count: numDefendersToPlace }
		];

		seededShuffle(typesAndCounts, rng);

		for (const item of typesAndCounts) {
			let placed = 0;
			for (let i = 0; i < item.count; i++) {
				let attempts = 0;
				const maxAttempts = Math.max(100, simState.totalArenaSpaces * 2); 
				while (attempts < maxAttempts) {
					const q = getRandomIntInRange(-currentGridRadius, currentGridRadius);
					const r = getRandomIntInRange(-currentGridRadius, currentGridRadius);
					const key = `${q},${r}`;
					if (isWithinHexBounds(q, r, currentGridRadius) && !simState.cells.has(key)) {
						const cell = new Cell(q, r, item.type, `${item.type}-${simState.nextCellId++}`);
						simState.cells.set(key, cell);
						placed++;
						break;
					}
					attempts++;
				}
			}
		}
    initializeSeededRNG(simulationSeedInput.value);
    reinitializeAllCellStates();

	}

	function getNeighborInfos(q, r, currentCellMap) {
		// If it's a CellMap, use the ultra-fast direct coordinate lookup
		if (typeof currentCellMap.getByCoords === 'function') {
			const result = new Array(6);
			for (let i = 0; i < 6; i++) {
				const dir = AXIAL_DIRECTIONS[i];
				const nq = q + dir.q;
				const nr = r + dir.r;
				result[i] = {
					q: nq, r: nr,
					cell: currentCellMap.getByCoords(nq, nr),
					direction: dir, directionIndex: i
				};
			}
			return result;
		} 
		
		// Fallback: If it's a native Map (e.g. currentCellsSnapshotForActions), 
		// reuse the pre-allocated strings from neighborCache to avoid memory churn.
		const cacheKey = `${q},${r}`;
		const cachedNeighbors = neighborCache.get(cacheKey);
		if (cachedNeighbors) {
			const result = new Array(6);
			for (let i = 0; i < 6; i++) {
				const n = cachedNeighbors[i];
				result[i] = {
					q: n.q, r: n.r,
					cell: currentCellMap.get(n.key),
					direction: n.direction, directionIndex: n.directionIndex
				};
			}
			return result;
		}
		
		// Ultimate fallback if cache misses
		const result = new Array(6);
		for (let i = 0; i < 6; i++) {
			const dir = AXIAL_DIRECTIONS[i];
			const nq = q + dir.q;
			const nr = r + dir.r;
			result[i] = {
				q: nq, r: nr,
				cell: currentCellMap.get(`${nq},${nr}`),
				direction: dir, directionIndex: i
			};
		}
		return result;
	}


	function getEmptyValidNeighbors(q, r, currentCellMap) {
		const emptyValidNeighbors = [];
		const currentGridRadius = simState.config.hexGridActualRadius;
		
		// currentCellMap passed here is always newCellsWorkingCopy which is a CellMap
		for (let i = 0; i < 6; i++) {
			const dir = AXIAL_DIRECTIONS[i];
			const nq = q + dir.q;
			const nr = r + dir.r;
			if (isWithinHexBounds(nq, nr, currentGridRadius)) {
				const cell = typeof currentCellMap.getByCoords === 'function' ? 
							 currentCellMap.getByCoords(nq, nr) : 
							 currentCellMap.get(`${nq},${nr}`);
							 
				if (!cell || cell.isEffectivelyGone) {
					emptyValidNeighbors.push({ q: nq, r: nr });
				}
			}
		}
		return emptyValidNeighbors;
	}

	function getDirectionIndex(deltaQ, deltaR) {
		for (let i = 0; i < AXIAL_DIRECTIONS.length; i++) {
			if (AXIAL_DIRECTIONS[i].q === deltaQ && AXIAL_DIRECTIONS[i].r === deltaR) return i;
		}
		return -1; 
	}

	function axialToPixel(q, r, visualHexRadius, offsetX, offsetY) {
		const x = offsetX + visualHexRadius * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
		const y = offsetY + visualHexRadius * (3 / 2 * r);
		return { x, y };
	}

	function drawHexagonOutline(targetCtx, x, y, visualHexRadius, strokeColor = EMPTY_COLOR_STROKE) {
		if (visualHexRadius < 1) return;
		targetCtx.beginPath();
		for (let i = 0; i < 6; i++) {
			const angle = Math.PI / 180 * (60 * i - 30); 
			const px = x + visualHexRadius * Math.cos(angle);
			const py = y + visualHexRadius * Math.sin(angle);
			if (i === 0) targetCtx.moveTo(px, py);
			else targetCtx.lineTo(px, py);
		}
		targetCtx.closePath();
		targetCtx.strokeStyle = strokeColor;
		targetCtx.lineWidth = Math.max(0.5, visualHexRadius * 0.05); 
		targetCtx.stroke();
	}

	function drawHexagon(targetCtx, x, y, cell, visualHexRadius, fillColor, firingsMap, strokeColor = EMPTY_COLOR_STROKE) {
		if (visualHexRadius < 1) return;

		const cellKey = `${cell.q},${cell.r}`;
		if (cell.isEffectivelyGone && !simState.activeFiringsThisStep.has(cell.id)) return;

		const hexPath = new Path2D();
		const vertices = [];
		for (let i = 0; i < 6; i++) {
			const angle = Math.PI / 180 * (60 * i - 30);
			const px = x + visualHexRadius * Math.cos(angle);
			const py = y + visualHexRadius * Math.sin(angle);
			vertices.push({x: px, y: py});
			if (i === 0) hexPath.moveTo(px, py);
			else hexPath.lineTo(px, py);
		}
		hexPath.closePath();

		if (!cell.isEffectivelyGone) {
			// 1. Fill the main hexagon with its base color (e.g., blue for prey)
			targetCtx.fillStyle = fillColor;
			targetCtx.fill(hexPath);

            // 2. Draw the inner capsule OUTLINE if applicable
            if (cell.type === 'prey' && cell.capsuleLayers > 0) {
			    const originalLineWidth = Math.max(0.5, visualHexRadius * 0.05);
                const capsuleLineWidth = originalLineWidth * (1 + cell.capsuleLayers * 0.5);
                const capsuleRadius = visualHexRadius - (originalLineWidth * 1.5) - (capsuleLineWidth / 2);

                // Interpolate between two colors
                const startColor = { r: 225, g: 190, b: 231 }; // shades of purple
                const endColor = { r: 142, g: 36, b: 170 };
				
                const progress = (cell.capsuleLayers - 1) / 4;
                const r = Math.round(startColor.r + (endColor.r - startColor.r) * progress);
                const g = Math.round(startColor.g + (endColor.g - startColor.g) * progress);
                const b = Math.round(startColor.b + (endColor.b - startColor.b) * progress);

                const capsulePath = new Path2D();
                for (let i = 0; i < 6; i++) {
                    const angle = Math.PI / 180 * (60 * i - 30);
                    const px = x + capsuleRadius * Math.cos(angle);
                    const py = y + capsuleRadius * Math.sin(angle);
                    if (i === 0) capsulePath.moveTo(px, py);
                    else capsulePath.lineTo(px, py);
                }
                capsulePath.closePath();

                targetCtx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
                targetCtx.lineWidth = capsuleLineWidth;
                targetCtx.stroke(capsulePath);
            }

			// 3. Draw the dot for dead/lysing cells on top of everything
			if (cell.isDead || cell.isLysing) {
				targetCtx.beginPath();
				let dotColor = 'grey';
				if (cell.type === 'attacker') dotColor = ATTACKER_COLOR;
				else if (cell.type === 'prey') dotColor = PREY_COLOR;
				else if (cell.type === 'defender') dotColor = DEFENDER_COLOR;
				targetCtx.arc(x, y, visualHexRadius / 2.5, 0, 2 * Math.PI, false);
				targetCtx.fillStyle = dotColor;
				if (cell.type !== 'barrier') {
					targetCtx.fill();
				}
			} else if (cell.type === 'prey') {
				if (simState.config.prey.releaseOnLysis) {
					const totalInternalToxin = (cell.internalPreyToxinNL || 0) + (cell.internalPreyToxinL || 0);
					if (totalInternalToxin > 0) {
						const thresh = cell.preyToxinLysisThreshold || 1000;
						const progress = Math.min(1.0, totalInternalToxin / thresh);
						const r = Math.round(187 + (21 - 187) * progress);
						const g = Math.round(247 + (128 - 247) * progress);
						const b = Math.round(208 + (61 - 208) * progress);

						targetCtx.beginPath();
						targetCtx.arc(x, y, visualHexRadius / 2.5, 0, 2 * Math.PI, false);
						targetCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
						targetCtx.fill();
					}
				} else if (cell.isPreyToxinProducer) {
					targetCtx.beginPath();
					targetCtx.arc(x, y, visualHexRadius / 2.5, 0, 2 * Math.PI, false);
					targetCtx.fillStyle = '#22c55e'; // Mid-green
					targetCtx.fill();
				}
			}
		}

		// 4. Draw firing sectors on top
		const firingEvent = firingsMap.get(cell.id);

		if (firingEvent && typeof firingEvent === 'object' && firingEvent !== null && typeof firingEvent.directionIndex === 'number') {
			const directionIndex = firingEvent.directionIndex;
			const isPreciseShot = firingEvent.isPrecise;

			if (directionIndex !== -1) {
				const firingFaceVertexStartIndices = [0, 5, 4, 3, 2, 1];
				const v1_idx = firingFaceVertexStartIndices[directionIndex];
				const v2_idx = (v1_idx + 1) % 6;

				const v1 = vertices[v1_idx];
				const v2 = vertices[v2_idx];

				targetCtx.beginPath();
				targetCtx.moveTo(x, y);
				targetCtx.lineTo(v1.x, v1.y);
				targetCtx.lineTo(v2.x, v2.y);
				targetCtx.closePath();
				targetCtx.fillStyle = isPreciseShot ? FIRING_SECTOR_COLOR : MISS_FIRING_SECTOR_COLOR;
				targetCtx.fill();
			}
		}

		// 5. Finally, draw the main outer border for all cells
		if (!cell.isEffectivelyGone) {
			targetCtx.lineWidth = Math.max(0.5, visualHexRadius * 0.05);
			targetCtx.strokeStyle = strokeColor;
			targetCtx.stroke(hexPath);
		}
	}


function drawFilledHexagon(targetCtx, x, y, visualHexRadius, fillColor) {
    if (visualHexRadius < 1) return;
    targetCtx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 180 * (60 * i - 30); 
        const px = x + visualHexRadius * Math.cos(angle);
        const py = y + visualHexRadius * Math.sin(angle);
        if (i === 0) targetCtx.moveTo(px, py);
        else targetCtx.lineTo(px, py);
    }
    targetCtx.closePath();
    targetCtx.fillStyle = fillColor;
    targetCtx.fill();
}

function drawArenaOnContext(targetCtx, canvasWidth, canvasHeight, currentCells, currentFirings, preyAiGrid, preyToxinNLGrid, preyToxinLGrid, logicalGridRadius, visualHexRadius, offsetX, offsetY, cprgBgColor) {
    const isMainCanvas = (
        targetCtx === ctx &&
        logicalGridRadius === simState.config.hexGridActualRadius &&
        visualHexRadius === simState.config.hexRadius &&
        offsetX === simState.offsetX &&
        offsetY === simState.offsetY
    );

    targetCtx.fillStyle = cprgBgColor;
    targetCtx.fillRect(0, 0, canvasWidth, canvasHeight);

    if (isMainCanvas && mainEmptyGridCanvas) {
        targetCtx.drawImage(mainEmptyGridCanvas, 0, 0);
    } else {
        // Draw empty grid outlines for offscreen/export canvas (using cache if possible)
        const exportKey = `${logicalGridRadius}_${visualHexRadius}_${offsetX}_${offsetY}_${canvasWidth}_${canvasHeight}`;
        if (exportEmptyGridCanvas && exportEmptyGridCanvasKey === exportKey) {
            targetCtx.drawImage(exportEmptyGridCanvas, 0, 0);
        } else {
            exportEmptyGridCanvas = document.createElement('canvas');
            exportEmptyGridCanvas.width = canvasWidth;
            exportEmptyGridCanvas.height = canvasHeight;
            const exportEmptyCtx = exportEmptyGridCanvas.getContext('2d');
            
            for (let q = -logicalGridRadius; q <= logicalGridRadius; q++) {
                const rMin = Math.max(-logicalGridRadius, -q - logicalGridRadius);
                const rMax = Math.min(logicalGridRadius, -q + logicalGridRadius);
                for (let r = rMin; r <= rMax; r++) {
                    const pt = axialToPixel(q, r, visualHexRadius, offsetX, offsetY);
                    drawHexagonOutline(exportEmptyCtx, pt.x, pt.y, visualHexRadius);
                }
            }
            exportEmptyGridCanvasKey = exportKey;
            targetCtx.drawImage(exportEmptyGridCanvas, 0, 0);
        }
    }

    const maxAI = calculateTheoreticalMaxAI();
    const attackerAttractionThreshold = simState.config.attacker.movement.preyAiAttractionThreshold;
    const hasAIConfiguration = maxAI > 0 || attackerAttractionThreshold > 0;

    if (hasAIConfiguration) {
        preyAiGrid.forEach((aiConcentration, key) => {
            if (aiConcentration > 0) {
                const cellAtKey = currentCells.get(key);
                if (!cellAtKey || cellAtKey.isEffectivelyGone) {
                    const [q_str, r_str] = key.split(',');
                    const q = parseInt(q_str, 10);
                    const r = parseInt(r_str, 10);
                    if (isWithinHexBounds(q, r, logicalGridRadius)) {
                        const coords = isMainCanvas ? pixelCoordinatesCache.get(key) : null;
                        const { x, y } = coords || axialToPixel(q, r, visualHexRadius, offsetX, offsetY);
                        let alpha = 0.0;
                        if (maxAI > 0 && aiConcentration > maxAI / 20) {
                            alpha = 0.2;
                        } else if (attackerAttractionThreshold > 0 && aiConcentration > attackerAttractionThreshold) {
                            alpha = 0.1;
                        }

                        if (alpha > 0) {
                            const fillColor = `rgba(37, 99, 235, ${alpha})`;
                            drawFilledHexagon(targetCtx, x, y, visualHexRadius, fillColor);
                        }
                    }
                }
            }
        });
    }

    // Draw Prey Toxin overlays (combined from NL and L grids)
    if (preyToxinNLGrid || preyToxinLGrid) {
        const uniqueToxinKeys = new Set();
        if (preyToxinNLGrid) preyToxinNLGrid.forEach((val, key) => { if (val >= 1) uniqueToxinKeys.add(key); });
        if (preyToxinLGrid) preyToxinLGrid.forEach((val, key) => { if (val >= 1) uniqueToxinKeys.add(key); });

        const pNL = simState.config.prey.toxinNL.productionRate || 0;
        const dNL = simState.config.prey.toxinNL.degradationRate; // decimal
        const maxNL = (pNL > 0 && dNL > 0) ? (pNL / dNL) : 0;

        const pL = simState.config.prey.toxinL.productionRate || 0;
        const dL = simState.config.prey.toxinL.degradationRate; // decimal
        const maxL = (pL > 0 && dL > 0) ? (pL / dL) : 0;

        uniqueToxinKeys.forEach(key => {
            const cellAtKey = currentCells.get(key);
            if (!cellAtKey || cellAtKey.isEffectivelyGone) {
                const [q_str, r_str] = key.split(',');
                const q = parseInt(q_str, 10);
                const r = parseInt(r_str, 10);
                if (isWithinHexBounds(q, r, logicalGridRadius)) {
                    const nlVal = preyToxinNLGrid ? (preyToxinNLGrid.get(key) || 0) : 0;
                    const lVal = preyToxinLGrid ? (preyToxinLGrid.get(key) || 0) : 0;
                    const maxVal = Math.max(nlVal, lVal);

                    let alpha = 0.0;
                    if (maxVal >= 1) {
                        alpha = 0.18;

                        const threshNL = (maxNL === Infinity || maxNL <= 0) ? 10 : (maxNL / 20);
                        const threshL = (maxL === Infinity || maxL <= 0) ? 10 : (maxL / 20);

                        if (nlVal >= threshNL || lVal >= threshL) {
                            alpha = 0.40;
                        }
                    }

                    if (alpha > 0) {
                        const coords = isMainCanvas ? pixelCoordinatesCache.get(key) : null;
                        const { x, y } = coords || axialToPixel(q, r, visualHexRadius, offsetX, offsetY);
                        const fillColor = `rgba(34, 197, 94, ${alpha})`;
                        drawFilledHexagon(targetCtx, x, y, visualHexRadius, fillColor);
                    }
                }
            }
        });
    }

    // This part for drawing the cells on top remains the same
    currentCells.forEach((cell) => {
        if (isWithinHexBounds(cell.q, cell.r, logicalGridRadius)) {
            const coords = isMainCanvas ? pixelCoordinatesCache.get(cell.key) : null;
            const { x, y } = coords || axialToPixel(cell.q, cell.r, visualHexRadius, offsetX, offsetY);
            let color = EMPTY_COLOR_STROKE;
            if (cell.isEffectivelyGone) return;

            if (cell.isLysing) color = LYSING_CELL_COLOR;
            else if (cell.isDead) color = DEAD_CELL_COLOR;
            else {
                if (cell.type === 'attacker') color = ATTACKER_COLOR;
                else if (cell.type === 'prey') color = PREY_COLOR;
                else if (cell.type === 'defender') color = DEFENDER_COLOR;
                else if (cell.type === 'barrier') color = BARRIER_COLOR;
            }
            if (color !== EMPTY_COLOR_STROKE) {
                drawHexagon(targetCtx, x, y, cell, visualHexRadius, color, currentFirings);
            }
        }
    });
}


	function drawGrid() {
		const cprgBgColor = canvas.style.backgroundColor || DEFAULT_CANVAS_BG_COLOR;
		drawArenaOnContext(ctx, canvas.width, canvas.height, simState.cells, simState.activeFiringsThisStep, simState.preyAiGrid, simState.preyToxinNLGrid, simState.preyToxinLGrid, simState.config.hexGridActualRadius, simState.config.hexRadius, simState.offsetX, simState.offsetY, cprgBgColor);
	}


	function updateStats() {
		let liveAttackerCount = 0, livePreyCount = 0, liveDefenderCount = 0;
		let deadLysingAttackerCount = 0, deadLysingPreyCount = 0, deadLysingDefenderCount = 0;

		// Barriers are not counted in these dynamic stats
		const currentGridRadius = simState.config.hexGridActualRadius;
		simState.cells.forEach(cell => {
			if (cell.type === 'barrier') return; // Skip barriers for these counts
			if (!isWithinHexBounds(cell.q, cell.r, currentGridRadius) || cell.isEffectivelyGone) return; 

			if (cell.isDead || cell.isLysing) {
				if (cell.type === 'attacker') deadLysingAttackerCount++;
				else if (cell.type === 'prey') deadLysingPreyCount++;
				else if (cell.type === 'defender') deadLysingDefenderCount++;
			} else {
				if (cell.type === 'attacker') liveAttackerCount++;
				else if (cell.type === 'prey') livePreyCount++; // Corrected from liveAttackerCount
				else if (cell.type === 'defender') liveDefenderCount++;
			}
		});

		timeStepsDisplay.textContent = simState.simulationStepCount;
		attackerCountDisplay.textContent = liveAttackerCount;
		livePreyCountDisplay.textContent = livePreyCount;
		defenderCountDisplay.textContent = liveDefenderCount;
		deadLysingAttackersDisplay.textContent = deadLysingAttackerCount;
		deadLysingPreyDisplay.textContent = deadLysingPreyCount;
		deadLysingDefendersDisplay.textContent = deadLysingDefenderCount;
		totalCellCountDisplay.textContent = liveAttackerCount + livePreyCount + liveDefenderCount + deadLysingAttackerCount + deadLysingPreyCount + deadLysingDefenderCount;

		firingsThisStepDisplay.textContent = simState.firingsThisStep;
		attKilledThisStepDisplay.textContent = simState.killedThisStep.attacker;
		preyKilledThisStepDisplay.textContent = simState.killedThisStep.prey;
		defKilledThisStepDisplay.textContent = simState.killedThisStep.defender;
		attLysedThisStepDisplay.textContent = simState.lysedThisStep.attacker;
		preyLysedThisStepDisplay.textContent = simState.lysedThisStep.prey;
		defLysedThisStepDisplay.textContent = simState.lysedThisStep.defender;

		if (simState.simulationStepCount === 0 && !simState.isRunning && !simState.isStepping) {
			cumulativeFiringsDisplay.textContent = 0;
			cumulativeAttKilledDisplay.textContent = 0;
			cumulativePreyKilledDisplay.textContent = 0;
			cumulativeDefKilledDisplay.textContent = 0;
			cumulativeAttLysedDisplay.textContent = 0;
			cumulativePreyLysedDisplay.textContent = 0;
			cumulativeDefLysedDisplay.textContent = 0;
			totalCPRGConvertedDisplay.textContent = 0;
			canvas.style.backgroundColor = DEFAULT_CANVAS_BG_COLOR;
		} else {
			cumulativeFiringsDisplay.textContent = simState.cumulativeFirings;
			cumulativeAttKilledDisplay.textContent = simState.cumulativeKills.attacker;
			cumulativePreyKilledDisplay.textContent = simState.cumulativeKills.prey;
			cumulativeDefKilledDisplay.textContent = simState.cumulativeKills.defender;
			cumulativeAttLysedDisplay.textContent = simState.cumulativeLyses.attacker;
			cumulativePreyLysedDisplay.textContent = simState.cumulativeLyses.prey;
			cumulativeDefLysedDisplay.textContent = simState.cumulativeLyses.defender;
			totalCPRGConvertedDisplay.textContent = simState.totalCPRGConverted.toLocaleString(undefined, {maximumFractionDigits: 0});

			if (simState.config.cprg.initialSubstrate > 0) {
				const cprgRatio = Math.min(1, simState.totalCPRGConverted / simState.config.cprg.initialSubstrate);
				const baseR = 255, baseG = 255, baseB = 255; // #ffffff
				const targetR = 255, targetG = 0, targetB = 255; // Magenta
				const r_val = Math.round(baseR + (targetR - baseR) * cprgRatio);
				const g_val = Math.round(baseG + (targetG - baseG) * cprgRatio);
				const b_val = Math.round(baseB + (targetB - baseB) * cprgRatio);
				canvas.style.backgroundColor = `rgb(${r_val}, ${g_val}, ${b_val})`;
			} else {
				 canvas.style.backgroundColor = DEFAULT_CANVAS_BG_COLOR;
			}
		}
	}

    // NEW function to re-initialize cell properties
    function reinitializeAllCellStates() {
        if (simState.cells.size === 0) return;

        console.log("Re-initializing random states for all placed cells...");
        simState.cells.forEach(cell => {
            if (cell.type === 'barrier') return;

            // Re-calculate initial cooldowns, just like in the constructor
            cell.movementCooldown = cell.getRandomMoveTime();
            cell.replicationCooldown = cell.getRandomReplicationTime();
            cell.movementCooldown = getRandomIntInRange(0, cell.movementCooldown);
            cell.replicationCooldown = getRandomIntInRange(0, cell.replicationCooldown);

            if (cell.type === 'attacker') {
                cell.resetT6SSFireCooldown(true); // isInitial = true for random start time
            }
            if (cell.type === 'defender') {
                cell.resetRandomFireCooldown(true); // isInitial = true
            }
            if (cell.type === 'prey') {
                cell.isPreyToxinProducer = false;
                cell.internalPreyToxinNL = 0;
                cell.internalPreyToxinL = 0;
                cell.continuousToxinProduced = 0;
                cell.accumulatedNonLyticToxins = 0;
                cell.accumulatedLyticToxins = 0;
                cell.preyToxinLysisThreshold = null;
            }
        });

        simState.areCellsInSync = true;
        updateSyncAndRngButtons();
        // No redraw is needed here as the visual appearance of the cells doesn't change
    }

	// --- UI Update Functions ---

    function updateSyncAndRngButtons() {
        // Update RNG Reset Button (←)
        if (resetRngButton) {
            const isFresh = simState.rngDrawCount === 0;
            resetRngButton.disabled = isFresh;
            resetRngButton.title = isFresh ? "RNG is fresh." : "RNG is used. Click to reset the sequence to the beginning for the current seed.";
        }

        // Update Cell Sync Button (🔃)
        if (resyncCellsButton) {
            const isInSync = simState.areCellsInSync;
            resyncCellsButton.disabled = isInSync;
        }
    }
    

	function updateButtonStatesAndUI() {
		const isRun = simState.isRunning;
		const isRendering = simState.isRenderingFromHistory;
		const isImporting = simState.isImportingSession;
		const isHistPlay = simState.isHistoryPlaying;
		const controlsDisabled = isRun || isRendering || isImporting || isHistPlay;

		// --- Setup Arena Panel ---
		// The panel is always visible, but its contents are disabled while running.
		document.querySelectorAll('#selectAttackerButton, #selectPreyButton, #selectDefenderButton, #selectBarrierButton, #selectRemoveButton').forEach(btn => btn.disabled = controlsDisabled);
		if (manualRandomPlacementButton) manualRandomPlacementButton.disabled = controlsDisabled;
		if (clearManualPlacementButton) clearManualPlacementButton.disabled = controlsDisabled;
		if (importManualArenaButton) importManualArenaButton.disabled = controlsDisabled;
		if (exportManualArenaButton) exportManualArenaButton.disabled = controlsDisabled;

		// --- NEW: Visual indicator for active placement tool ---
		const placementButtons = {
			attacker: { el: selectAttackerButton, ring: 'ring-red-500' },
			prey:     { el: selectPreyButton,     ring: 'ring-blue-500' },
			defender: { el: selectDefenderButton, ring: 'ring-yellow-600' },
			barrier:  { el: selectBarrierButton,  ring: 'ring-yellow-800' },
			remove:   { el: selectRemoveButton,   ring: 'ring-gray-500' }
		};

		// Loop through all placement buttons to set their active/inactive style
		for (const type in placementButtons) {
			const buttonInfo = placementButtons[type];
			if (buttonInfo.el) {
				// First, remove all possible active/inactive styles to reset the button
				buttonInfo.el.classList.remove('ring-2', 'ring-offset-2', 'opacity-50', ...Object.values(placementButtons).map(b => b.ring));
				
				// If this button corresponds to the currently selected tool...
				if (simState.selectedManualCellType === type) {
					// ...add the colored outline and ensure full opacity.
					buttonInfo.el.classList.add('ring-2', 'ring-offset-2', buttonInfo.ring);
				} else if (!controlsDisabled) { 
					// Otherwise, if controls are not disabled, make it semi-transparent.
					buttonInfo.el.classList.add('opacity-50');
				}
			}
		}

		// --- Main Simulation Controls ---
		startButton.disabled = isRun || isHistPlay;
		pauseButton.disabled = !isRun;
		stepButton.disabled = isRun || isHistPlay;
		// The stop button should be disabled only if the simulation is paused at the very beginning.
		stopButton.disabled = (!isRun && simState.simulationStepCount === 0) || isHistPlay;
		if (resetSimulationButton) resetSimulationButton.disabled = isRun || simState.isStepping || isHistPlay;

		const loadSessionBtn = document.getElementById('loadSessionButton');
		if (loadSessionBtn) {
			loadSessionBtn.disabled = controlsDisabled;
		}

		const resumeButton = document.getElementById('resumeFromStateButton');
		if (resumeButton) {
			// The resume button should only be clickable if we are in "scrubbing" mode.
			// After branching history by placing a cell, you are no longer scrubbing,
			// so the button should be disabled, and "Start" becomes the main action.
			resumeButton.disabled = !simState.isScrubbing || isHistPlay;
		}

		const exportStepButton = document.getElementById('exportCurrentStepStateButton');
		if (exportStepButton) {
			// We can export if we are in manual setup, if the sim is initialized, or if there is history
			const hasStateToExport = simState.manualSetupActive || simState.isInitialized || simState.optimizedHistoryFrames.size > 0;
			
			// Disable if there's no state, or if a step is actively processing
			exportStepButton.disabled = !hasStateToExport || simState.isStepping; 
		}

		// --- General & Cell-Specific Settings ---
		// Disable all parameter inputs while the simulation is running.
		arenaGridRadiusInput.disabled = controlsDisabled;
		totalSimulationMinutesInput.disabled = controlsDisabled;
		simulationSpeedInput.disabled = controlsDisabled;
		const renderRateInput = document.getElementById('renderRateInput');
		if (renderRateInput) {
			renderRateInput.disabled = controlsDisabled;
		}
		initialCPRGSubstrateInput.disabled = controlsDisabled;
		lacZKcatInput.disabled = controlsDisabled;
		lacZKmInput.disabled = controlsDisabled;
		saveImagesCheckbox.disabled = controlsDisabled;
		saveArenaStatesCheckbox.disabled = controlsDisabled;
		document.getElementById('saveFullHistoryCheckbox').disabled = controlsDisabled;
		imageExportWidthInput.disabled = controlsDisabled;
		if (renderFromStepInput && renderToStepInput) {
			renderFromStepInput.disabled = controlsDisabled || simState.optimizedHistoryFrames.size === 0;
			renderToStepInput.disabled = controlsDisabled || simState.optimizedHistoryFrames.size === 0;
			if (renderRateStepInput) renderRateStepInput.disabled = controlsDisabled || simState.optimizedHistoryFrames.size === 0;
		}
		if (cancelRenderButton) {
			cancelRenderButton.classList.toggle('hidden', !simState.isRenderingFromHistory);
		}
		if (cancelImportSessionButton) {
			cancelImportSessionButton.classList.toggle('hidden', !simState.isImportingSession);
		}
		updateRenderRangeInputs();

		if (renderFromHistoryButton) {
			renderFromHistoryButton.disabled = controlsDisabled || simState.optimizedHistoryFrames.size === 0;
		}
		document.querySelectorAll('#attackerParamsSection input, #attackerParamsSection select, #preyParamsSection input, #preyParamsSection select, #defenderParamsSection input, #defenderParamsSection select, #cellTypeSelectionButtons button').forEach(el => {
			el.disabled = controlsDisabled;
		});

		// Hide/Show defender-specific report lines based on cell presence
		const hasDefendersInArena = Array.from(simState.cells.values()).some(cell => cell.type === 'defender');
		if (reportDefendersRemainingContainer) reportDefendersRemainingContainer.classList.toggle('hidden', !hasDefendersInArena);
		if (reportDeadLysingDefendersContainer) reportDeadLysingDefendersContainer.classList.toggle('hidden', !hasDefendersInArena);
		if (reportCumulativeDefKilledContainer) reportCumulativeDefKilledContainer.classList.toggle('hidden', !hasDefendersInArena);
		if (reportCumulativeDefLysedContainer) reportCumulativeDefLysedContainer.classList.toggle('hidden', !hasDefendersInArena);
		
        updateSyncAndRngButtons();

	}

	function showConfirmationModal(message, title = 'Confirmation', confirmText = 'Confirm') {
		return new Promise((resolve, reject) => {
			const overlay = document.getElementById('confirmationModalOverlay');
			const modalTitle = document.getElementById('confirmationModalTitle');
			const modalBody = document.getElementById('confirmationModalBody');
			const confirmBtn = document.getElementById('confirmActionButton');
			const cancelBtn = document.getElementById('cancelActionButton');

			modalTitle.textContent = title;
			modalBody.textContent = message;
			confirmBtn.textContent = confirmText;

			const closeAndReject = () => {
				overlay.classList.add('hidden');
				reject(new Error('User cancelled action.'));
			};

			const closeAndResolve = () => {
				overlay.classList.add('hidden');
				resolve();
			};

			confirmBtn.addEventListener('click', closeAndResolve, { once: true });
			cancelBtn.addEventListener('click', closeAndReject, { once: true });
			// Also allow closing by clicking the overlay
			overlay.addEventListener('click', (e) => {
				if (e.target === overlay) {
					closeAndReject();
				}
			}, { once: true });


			overlay.classList.remove('hidden');
	        confirmBtn.focus();
		});
	}

	function showInfoAlert(message, title = 'Information') {
		 return new Promise(resolve => {
			const overlay = document.getElementById('infoAlertModalOverlay');
			const modalTitle = document.getElementById('infoAlertModalTitle');
			const modalBody = document.getElementById('infoAlertModalBody');
			const okBtn = document.getElementById('okInfoAlertButton');

			modalTitle.textContent = title;
			modalBody.textContent = message;

			const closeAndResolve = () => {
				overlay.classList.add('hidden');
				resolve();
			};

			okBtn.addEventListener('click', closeAndResolve, { once: true });
			overlay.addEventListener('click', (e) => {
				if (e.target === overlay) {
					closeAndResolve();
				}
			}, { once: true });


			overlay.classList.remove('hidden');
	        okBtn.focus();
		});
	}


function updateTimeTravelSlider() {
    const slider = document.getElementById('timeTravelSlider');
    const display = document.getElementById('timeTravelDisplay');
    const playHistoryButton = document.getElementById('playHistoryButton');
    const stopHistoryButton = document.getElementById('stopHistoryButton');
    if (!slider || !display) return;

    const hasHistory = simState.config.historyEnabled && simState.optimizedHistoryFrames.size > 0;
    const isPlaying = simState.isHistoryPlaying;

    if (hasHistory) {
        slider.disabled = isPlaying;
        
        if (playHistoryButton) playHistoryButton.disabled = isPlaying;
        if (stopHistoryButton) stopHistoryButton.disabled = !isPlaying;

        // Get the min and max step numbers from the Map keys
        const allKeys = [...simState.optimizedHistoryFrames.keys()];
        const minStep = allKeys.length > 0 ? allKeys.reduce((a, b) => a < b ? a : b) : 0;
        const maxStep = allKeys.length > 0 ? allKeys.reduce((a, b) => a > b ? a : b) : 0;
        slider.min = minStep;
        slider.max = maxStep;
        
        if (!simState.isScrubbing && !isPlaying) {
            slider.value = maxStep;
            display.textContent = `Current Step: ${simState.simulationStepCount}`;
        }

        historyStepBackButton.disabled = isPlaying || (parseInt(slider.value, 10) <= parseInt(slider.min, 10));
        historyStepForwardButton.disabled = isPlaying || (parseInt(slider.value, 10) >= parseInt(slider.max, 10));

    } else {
        slider.disabled = true;
        historyStepBackButton.disabled = true;
        historyStepForwardButton.disabled = true;
        if (playHistoryButton) playHistoryButton.disabled = true;
        if (stopHistoryButton) stopHistoryButton.disabled = true;
        slider.value = 0;
        slider.min = 0;
        slider.max = 0;
        display.textContent = 'History Disabled';
    }
}

async function handleTimeTravelScrub(event) {
    if (!simState.config.historyEnabled) return;

    const slider = event.target;
    const resumeButton = document.getElementById('resumeFromStateButton');
    const display = document.getElementById('timeTravelDisplay');
    let stepIndex = parseInt(slider.value);

    // Get the frame from RAM or IndexedDB
    let optimizedState = await getHistoryFrame(stepIndex);
    if (!optimizedState) {
        // Find closest available step key
        const allKeys = [...simState.optimizedHistoryFrames.keys()].sort((a, b) => a - b);
        if (allKeys.length > 0) {
            let closestKey = allKeys[0];
            let minDiff = Math.abs(closestKey - stepIndex);
            for (const key of allKeys) {
                const diff = Math.abs(key - stepIndex);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestKey = key;
                }
            }
            stepIndex = closestKey;
            slider.value = stepIndex;
            optimizedState = await getHistoryFrame(stepIndex);
        }
    }
    
    if (optimizedState) {
        const rehydratedState = rehydrateOptimizedStep(optimizedState);
        updateUiFromState(rehydratedState);
        display.textContent = `Viewing Step: ${rehydratedState.simulationStepCount}`;
        
        if (simState.lastHoveredHexKey) {
            try {
                const [q_str, r_str] = simState.lastHoveredHexKey.split(',');
                const q = parseInt(q_str, 10);
                const r = parseInt(r_str, 10);
                // Pass the raw optimizedState directly to the inspector update function
                updateHoverInfoPanel(q, r, optimizedState);
            } catch (e) {
                console.error("Error auto-updating hover panel during scrub:", e);
                simState.lastHoveredHexKey = null; // Reset on error
            }
        }
    }
   
    const allKeys = [...simState.optimizedHistoryFrames.keys()];
    const maxStep = allKeys.length > 0 ? allKeys.reduce((a, b) => a > b ? a : b) : 0;
    const isAtEnd = (stepIndex >= maxStep);

    simState.isScrubbing = !isAtEnd;
    resumeButton.disabled = simState.isRunning || isAtEnd;
    historyStepBackButton.disabled = (parseInt(slider.value, 10) <= parseInt(slider.min, 10));
    const historyStepForwardButton = document.getElementById('historyStepForwardButton');
    if (historyStepForwardButton) {
        historyStepForwardButton.disabled = (parseInt(slider.value, 10) >= parseInt(slider.max, 10));
    }
}


let historyPlayTimeoutId = null;

function playHistory() {
    updateConfigFromUI(false);
    if (simState.isHistoryPlaying || !simState.config.historyEnabled || simState.optimizedHistoryFrames.size === 0) return;

    simState.isHistoryPlaying = true;
    updateButtonStatesAndUI();
    updateTimeTravelSlider();

    const slider = document.getElementById('timeTravelSlider');
    if (slider) {
        const currentValue = parseInt(slider.value, 10);
        const allKeys = [...simState.optimizedHistoryFrames.keys()];
        const maxStep = allKeys.length > 0 ? allKeys.reduce((a, b) => a > b ? a : b) : 0;
        if (currentValue >= maxStep) {
            slider.value = allKeys.length > 0 ? allKeys.reduce((a, b) => a < b ? a : b) : 0;
            slider.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    advanceHistoryStep();
}

function stopHistory() {
    if (!simState.isHistoryPlaying) return;

    simState.isHistoryPlaying = false;
    if (historyPlayTimeoutId) {
        clearTimeout(historyPlayTimeoutId);
        historyPlayTimeoutId = null;
    }

    updateButtonStatesAndUI();
    updateTimeTravelSlider();
}

function advanceHistoryStep() {
    if (!simState.isHistoryPlaying) return;

    const slider = document.getElementById('timeTravelSlider');
    if (!slider) {
        stopHistory();
        return;
    }

    const currentValue = parseInt(slider.value, 10);
    const allKeys = [...simState.optimizedHistoryFrames.keys()].sort((a, b) => a - b);
    if (allKeys.length === 0) {
        stopHistory();
        return;
    }
    
    const maxKey = allKeys[allKeys.length - 1];
    
    if (currentValue < maxKey) {
        // The render frequency (N steps) is from simulation settings
        const renderRate = simState.config.simulationControl.renderRate || 1;
        const targetValue = currentValue + renderRate;

        // Find the next step key that is >= targetValue, clamp to maxKey if none found
        let nextKey = allKeys.find(k => k >= targetValue);
        if (nextKey === undefined) {
            nextKey = maxKey;
        }

        slider.value = nextKey;
        slider.dispatchEvent(new Event('input', { bubbles: true }));
        
        if (nextKey >= maxKey) {
            stopHistory();
        } else {
            // Schedule the next step based on the step delay setting (Simulation_Step_Delay_ms)
            const delay = simState.config.simulationControl.simulationSpeedMs || 50;
            historyPlayTimeoutId = setTimeout(advanceHistoryStep, delay);
        }
    } else {
        stopHistory();
    }
}


function updateUiFromState(stateObject) {
    // Update main stats panel from the historical state
    document.getElementById('timeStepsDisplay').textContent = stateObject.simulationStepCount;
    // ... (the rest of the textContent updates for cumulative and per-step stats are correct) ...
    document.getElementById('cumulativeFiringsDisplay').textContent = stateObject.cumulativeFirings.toLocaleString();
    document.getElementById('cumulativeAttKilledDisplay').textContent = stateObject.cumulativeKills.attacker.toLocaleString();
    document.getElementById('cumulativePreyKilledDisplay').textContent = stateObject.cumulativeKills.prey.toLocaleString();
    document.getElementById('cumulativeDefKilledDisplay').textContent = stateObject.cumulativeKills.defender.toLocaleString();
    document.getElementById('cumulativeAttLysedDisplay').textContent = stateObject.cumulativeLyses.attacker.toLocaleString();
    document.getElementById('cumulativePreyLysedDisplay').textContent = stateObject.cumulativeLyses.prey.toLocaleString();
    document.getElementById('cumulativeDefLysedDisplay').textContent = stateObject.cumulativeLyses.defender.toLocaleString();
    document.getElementById('totalCPRGConvertedDisplay').textContent = stateObject.totalCPRGConverted.toLocaleString(undefined, { maximumFractionDigits: 0 });

    if (stateObject.firingsThisStep !== undefined) {
        document.getElementById('firingsThisStepDisplay').textContent = stateObject.firingsThisStep.toLocaleString();
        document.getElementById('attKilledThisStepDisplay').textContent = stateObject.killedThisStep.attacker.toLocaleString();
        document.getElementById('preyKilledThisStepDisplay').textContent = stateObject.killedThisStep.prey.toLocaleString();
        document.getElementById('defKilledThisStepDisplay').textContent = stateObject.killedThisStep.defender.toLocaleString();
        document.getElementById('attLysedThisStepDisplay').textContent = stateObject.lysedThisStep.attacker.toLocaleString();
        document.getElementById('preyLysedThisStepDisplay').textContent = stateObject.lysedThisStep.prey.toLocaleString();
        document.getElementById('defLysedThisStepDisplay').textContent = stateObject.lysedThisStep.defender.toLocaleString();
    }

    // --- SIMPLIFICATION ---
    // The historical data is now a clean Map of Cell objects, no rehydration needed.
    const historicalCells = stateObject.cells;
    const historicalFirings = stateObject.activeFiringsThisStep;
    const historicalPreyAiGrid = stateObject.preyAiGrid;
    const historicalPreyToxinNLGrid = stateObject.preyToxinNLGrid || stateObject.preyToxinGrid || new Map();
    const historicalPreyToxinLGrid = stateObject.preyToxinLGrid || new Map();


    let liveAttackerCount = 0, livePreyCount = 0, liveDefenderCount = 0;
    let deadLysingAttackerCount = 0, deadLysingPreyCount = 0, deadLysingDefenderCount = 0;

    historicalCells.forEach(c => {
        if (c.isEffectivelyGone || c.type === 'barrier') return;
        if (c.isDead || c.isLysing) {
            if (c.type === 'attacker') deadLysingAttackerCount++;
            else if (c.type === 'prey') deadLysingPreyCount++;
            else if (c.type === 'defender') deadLysingDefenderCount++;
        } else {
            if (c.type === 'attacker') liveAttackerCount++;
            else if (c.type === 'prey') livePreyCount++;
            else if (c.type === 'defender') liveDefenderCount++;
        }
    });
    
    document.getElementById('attackerCountDisplay').textContent = liveAttackerCount;
    document.getElementById('livePreyCountDisplay').textContent = livePreyCount;
    document.getElementById('defenderCountDisplay').textContent = liveDefenderCount;
    document.getElementById('deadLysingAttackersDisplay').textContent = deadLysingAttackerCount;
    document.getElementById('deadLysingPreyDisplay').textContent = deadLysingPreyCount;
    document.getElementById('deadLysingDefendersDisplay').textContent = deadLysingDefenderCount;
    document.getElementById('totalCellCountDisplay').textContent = liveAttackerCount + livePreyCount + liveDefenderCount + deadLysingAttackerCount + deadLysingPreyCount + deadLysingDefenderCount;

    const cprgRatio = simState.config.cprg.initialSubstrate > 0 ? Math.min(1, stateObject.totalCPRGConverted / simState.config.cprg.initialSubstrate) : 0;
    const r_val = Math.round(255 + (255 - 255) * cprgRatio);
    const g_val = Math.round(255 + (0 - 255) * cprgRatio);
    const b_val = Math.round(255 + (255 - 255) * cprgRatio);
    const bgColor = `rgb(${r_val}, ${g_val}, ${b_val})`;
    
    drawArenaOnContext(ctx, canvas.width, canvas.height, historicalCells, historicalFirings, historicalPreyAiGrid, historicalPreyToxinNLGrid, historicalPreyToxinLGrid, simState.config.hexGridActualRadius, simState.config.hexRadius, simState.offsetX, simState.offsetY, bgColor);
}

function restoreSimStateFromHistoryObject(stateToRestore) {
    simState.simulationStepCount = stateToRestore.simulationStepCount;
    simState.nextCellId = stateToRestore.nextCellId;
	simState.cells = new Map(stateToRestore.cells); // It's already a map of Cell instances
    simState.activeFiringsThisStep = new Map(stateToRestore.activeFiringsThisStep);
    simState.attackerAiGrid = new Map(stateToRestore.attackerAiGrid);
    simState.preyAiGrid = new Map(stateToRestore.preyAiGrid);
    simState.preyToxinNLGrid = new Map(stateToRestore.preyToxinNLGrid || stateToRestore.preyToxinGrid || []);
    simState.preyToxinLGrid = new Map(stateToRestore.preyToxinLGrid || []);
    simState.cumulativeFirings = stateToRestore.cumulativeFirings;
    simState.cumulativeKills = { ...stateToRestore.cumulativeKills };
    simState.cumulativeLyses = { ...stateToRestore.cumulativeLyses };
    simState.totalCPRGConverted = stateToRestore.totalCPRGConverted;
    simState.remainingCPRGSubstrate = stateToRestore.remainingCPRGSubstrate;
    simState.totalActiveLacZReleased = stateToRestore.totalActiveLacZReleased;
}

async function restoreStateForResume() {
    if (!simState.config.historyEnabled || !simState.isScrubbing) return;

    const slider = document.getElementById('timeTravelSlider');
    const stepIndex = parseInt(slider.value);
    
    // Fetch the full state from RAM or IndexedDB
    const stateToRestore = await getHistoryFrame(stepIndex);

    if (!stateToRestore) {
        console.error("Could not find state to restore at index", stepIndex);
        return;
    }
    console.log(`Branching simulation from step ${stateToRestore.simulationStepCount}`);

    const rehydratedState = rehydrateOptimizedStep(stateToRestore);

    // 1. Restore the simulation's object states (cells, stats, etc.)
    restoreSimStateFromHistoryObject(rehydratedState);

    // 2. Reset the RNG sequence to its beginning for the current seed.
    //    DO NOT fast-forward. This is what creates the new, divergent timeline.
    initializeSeededRNG(simulationSeedInput.value);
    
    // 3. Truncate the future history of the old timeline
    await truncateFutureHistory(stepIndex);

    // 4. Update UI and start the new simulation branch
    simState.isScrubbing = false;
    document.getElementById('resumeFromStateButton').disabled = true;
    updateStats();
    startButton.click();
}


	function switchCellParamsTab(selectedType) {
		['attacker', 'prey', 'defender'].forEach(type => {
			document.getElementById(`${type}ParamsSection`).classList.add('hidden');
			document.getElementById(`select${type.charAt(0).toUpperCase() + type.slice(1)}ParamsButton`).classList.remove('active');
		});
		document.getElementById(`${selectedType}ParamsSection`).classList.remove('hidden');
		document.getElementById(`select${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}ParamsButton`).classList.add('active');
		updateButtonStatesAndUI(); 
	}

	selectAttackerParamsButton.addEventListener('click', () => switchCellParamsTab('attacker'));
	selectPreyParamsButton.addEventListener('click', () => switchCellParamsTab('prey'));
	selectDefenderParamsButton.addEventListener('click', () => switchCellParamsTab('defender'));


	selectAttackerButton.addEventListener('click', () => { if (simState.manualSetupActive) { simState.selectedManualCellType = 'attacker'; updateButtonStatesAndUI(); }});
	selectPreyButton.addEventListener('click', () => { if (simState.manualSetupActive) { simState.selectedManualCellType = 'prey'; updateButtonStatesAndUI(); }});
	selectDefenderButton.addEventListener('click', () => { if (simState.manualSetupActive) { simState.selectedManualCellType = 'defender'; updateButtonStatesAndUI(); }});
	selectBarrierButton.addEventListener('click', () => { if (simState.manualSetupActive) { simState.selectedManualCellType = 'barrier'; updateButtonStatesAndUI(); }});
	selectRemoveButton.addEventListener('click', () => { if (simState.manualSetupActive) { simState.selectedManualCellType = 'remove'; updateButtonStatesAndUI(); }});

	manualRandomPlacementButton.addEventListener('click', async () => {
		if (simState.isRunning) return;

		if (simState.isScrubbing) {
			const slider = document.getElementById('timeTravelSlider');
			const stepIndex = parseInt(slider.value, 10);
			
			// Truncate future history
			await truncateFutureHistory(stepIndex);

			// Exit scrubbing mode
			simState.isScrubbing = false;
			updateTimeTravelSlider();
		}

		updateConfigFromUI(false); 
		simState.cells.clear(); simState.nextCellId = 0; 
		ensureDataStructuresSize();
		populateCellsRandomly(); 
		simState.isInitialized = false; 
		drawGrid(); updateStats(); updateButtonStatesAndUI();
	});

	clearManualPlacementButton.addEventListener('click', async () => {
		if (simState.isRunning) return;

		try {
			await showConfirmationModal("Are you sure you want to clear all placed cells from the arena?", "Clear Arena?", "Clear All");

			if (simState.isScrubbing) {
				const slider = document.getElementById('timeTravelSlider');
				const stepIndex = parseInt(slider.value, 10);
				
				// Truncate future history
				await truncateFutureHistory(stepIndex);

				// Exit scrubbing mode
				simState.isScrubbing = false;
				updateTimeTravelSlider();
			}
 
			
			// This code only runs if the user confirms.
			simState.cells.clear(); 
			simState.nextCellId = 0;
			drawGrid(); 
			updateStats(); 
			updateButtonStatesAndUI();

		} catch (e) {
			// User clicked "Cancel", do nothing.
			console.log("Clear arena cancelled by user.");
		}
	});

	function performManualActionAtCoordinates(q, r, selectedTool) {
		const key = `${q},${r}`;
		let actionWasPerformed = false; // To track if redraw is needed

		if (isWithinHexBounds(q, r, simState.config.hexGridActualRadius)) {
			if (selectedTool === 'remove') {
				if (simState.cells.has(key)) { // Only try to delete if a cell exists
					simState.cells.delete(key);
					actionWasPerformed = true;
				}
			} else { // This handles 'attacker', 'prey', 'defender', 'barrier' placement
				// Overwrite any existing cell at the location with the new type
				// If you prefer to only place on empty cells, you'd add: if (!simState.cells.has(key)) { ... }
				simState.cells.delete(key); // Ensure new cell type replaces whatever was there
				const cell = new Cell(q, r, selectedTool, `${selectedTool}-${simState.nextCellId++}`);
				simState.cells.set(key, cell);
				actionWasPerformed = true;
			}

			if (actionWasPerformed) {
				drawGrid();
				updateStats();
				updateButtonStatesAndUI(); // Crucial for enabling/disabling buttons like "Clear All" or "Finalize"
				return key; // Return the key if action was performed and in bounds
			}
		}
		
	    if (actionWasPerformed) {
			drawGrid();
			updateStats();
			updateButtonStatesAndUI(); // This now updates all buttons
			return key;
		}

		return null; // No action performed or out of bounds
	}

	// MOUSE DOWN: Start the drawing/removing action
	canvas.addEventListener('mousedown', async (event) => {
		if (simState.isRunning) return; // Only allow editing if the simulation is NOT running

		if (simState.isScrubbing) {
			const slider = document.getElementById('timeTravelSlider');
			const stepIndex = parseInt(slider.value, 10);
			const stateToEdit = await getHistoryFrame(stepIndex);

			if (stateToEdit) {
				// Restore the live state to this historical point
				const rehydratedState = rehydrateOptimizedStep(stateToEdit);
				restoreSimStateFromHistoryObject(rehydratedState);

				// Erase all future history
				await truncateFutureHistory(stepIndex);

				// Exit scrubbing mode, as we are now editing a new timeline
				simState.isScrubbing = false;

				// Update the UI to reflect the truncated history
				updateTimeTravelSlider();
				updateStats();
	            updateButtonStatesAndUI();
			}
		}

		simState.isMouseDragActive = true; // Set the flag indicating the mouse button is down for an action
		const rect = canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		const { q, r } = pixelToAxial(x, y, simState.config.hexRadius, simState.offsetX, simState.offsetY);
		
		// Perform the action (place or remove) at the initial click position
		const processedKey = performManualActionAtCoordinates(q, r, simState.selectedManualCellType);
		if (processedKey) {
			simState.lastProcessedHexKeyDuringDrag = processedKey;
		} else if (isWithinHexBounds(q, r, simState.config.hexGridActualRadius)){
			// If in bounds but no action (e.g. removing empty cell), still note the hex to prevent re-processing on mere wiggle
			simState.lastProcessedHexKeyDuringDrag = `${q},${r}`;
		}
		
		event.preventDefault(); // Important to prevent default browser actions like text selection or image dragging
	});

	// MOUSE MOVE: Continue drawing/removing if the mouse button is held down
	canvas.addEventListener('mousemove', (event) => {
		if (!simState.isMouseDragActive || simState.isRunning) {
			return; // Only act if mouse is down AND simulation is NOT running
		}

		const rect = canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		const { q, r } = pixelToAxial(x, y, simState.config.hexRadius, simState.offsetX, simState.offsetY);
		const currentHexKey = `${q},${r}`;

		// Only perform an action if the mouse has moved to a new hex grid cell
		// and is within the defined arena bounds.
		if (isWithinHexBounds(q, r, simState.config.hexGridActualRadius)) {
			if (currentHexKey !== simState.lastProcessedHexKeyDuringDrag) {
				performManualActionAtCoordinates(q, r, simState.selectedManualCellType);
				// Always update the last processed key to the current hex the mouse is over,
				// to prevent re-processing this hex in the same drag stroke if no actual
				// change occurred (e.g., trying to remove an already empty cell).
				simState.lastProcessedHexKeyDuringDrag = currentHexKey;
			}
		} else {
			// Optional: If mouse is dragged out of bounds, you could clear lastProcessedHexKeyDuringDrag
			// or set it to a value that ensures an action on re-entry if desired.
			// For now, it simply won't process out-of-bounds hexes.
			simState.lastProcessedHexKeyDuringDrag = null; // Reset if out of bounds to allow action on re-entry
		}
	});

	// MOUSE UP: Stop the drawing/removing action
	// Listen on the window to catch mouseup even if it happens outside the canvas
	window.addEventListener('mouseup', () => {
		if (simState.isMouseDragActive) {
			simState.isMouseDragActive = false;
			simState.lastProcessedHexKeyDuringDrag = null; // Clear for the next separate action
		}
	});

	// MOUSE LEAVE CANVAS: Also stop drawing/removing if the mouse leaves the canvas boundary
	canvas.addEventListener('mouseleave', () => {
		if (simState.isMouseDragActive) {
			simState.isMouseDragActive = false;
			simState.lastProcessedHexKeyDuringDrag = null; // Clear
		}
	});

startButton.addEventListener('click', () => {
    if (simState.isRunning) return;

    if (!simState.runTimestamp) {
        simState.runTimestamp = generateTimestamp();
    }

    updateConfigFromUI(false);
    simState.isInitialized = true;
    simState.isScrubbing = false;
    simState.isRunning = true;
    simState.isStepping = false;
    simState.realTimeStartTime = performance.now();

    reportModalOverlay.classList.add('hidden');
    graphModalOverlay.classList.add('hidden');
    if (presetsModalOverlay) presetsModalOverlay.classList.add('hidden');

    updateButtonStatesAndUI();
    runSimulationStep();
});

	pauseButton.addEventListener('click', async () => {
		if (!simState.isInitialized || !simState.isRunning) return;
		simState.isRunning = false; simState.isStepping = false;
        if (simState.realTimeStartTime) {
            simState.realTimeElapsedMs += performance.now() - simState.realTimeStartTime;
            simState.realTimeStartTime = null;
        }
		simState.isScrubbing = true;
		clearTimeout(simState.timeoutId); 
		updateButtonStatesAndUI();
		
		// Offload remaining RAM buffers to database on pause
		if (simState.config.historyEnabled) {
			await offloadHistoryToDB();
		}
		if (simState.saveImagesEnabled) {
			await offloadImagesToDB();
		}
		if (simState.saveArenaStatesEnabled) {
			await offloadArenaStatesToDB();
		}
	});


	stepButton.addEventListener('click', () => {
		// Guard clause: Do nothing if simulation is already running or a step is processing.
		if (simState.isRunning || simState.isStepping) return;

		// Set the state for a single step
		simState.isStepping = true;
		simState.isRunning = false; 

		// Update the UI immediately to disable buttons during the step
		updateButtonStatesAndUI();

		// Run one single simulation cycle
		runSimulationStep();
	});

stopButton.addEventListener('click', () => {
    if (!simState.isRunning && !simState.isStepping && simState.simulationStepCount === 0) return;

    simState.isRunning = false;
    simState.isStepping = false;
    clearTimeout(simState.timeoutId);

    showEndOfSimulationReport("Simulation Stopped by User");
    updateButtonStatesAndUI();
});

	arenaGridRadiusInput.addEventListener('input', async () => {
		// Only allow resizing when the simulation is paused.
		if (simState.isRunning) return;

		// This new logic redraws the arena without clearing cells.
		// 1. Read the new radius value from the UI.
		updateConfigFromUI(true);
		ensureDataStructuresSize();

		// 2. Recalculate the canvas and hexagon dimensions based on the new radius and rebuild caches.
		updateMainCanvasSizing();

		// 3. Update the statistics display for the new size.
		simState.totalArenaSpaces = calculateTotalArenaSpaces(simState.config.hexGridActualRadius);
		if (totalSpacesDisplay) totalSpacesDisplay.textContent = simState.totalArenaSpaces;
		updatePercentFullDisplay();

		if (simState.isScrubbing) {
			// If we are viewing history, we must redraw that specific historical state.
			// The updateUiFromState function already knows how to do this correctly.
			const slider = document.getElementById('timeTravelSlider');
			const stepIndex = parseInt(slider.value, 10);
			const historicalState = await getHistoryFrame(stepIndex);
			if (historicalState) {
				const rehydrated = rehydrateOptimizedStep(historicalState);
				updateUiFromState(rehydrated);
			}
		} else {
			// Otherwise, just redraw the current live state as normal.
			drawGrid();
		}
	});

	initialAttackersInput.addEventListener('input', () => { if (!simState.isRunning && !simState.manualSetupActive) updateConfigFromUI(false); });
	initialPreyInput.addEventListener('input', () => { if (!simState.isRunning && !simState.manualSetupActive) updateConfigFromUI(false); });
	initialDefendersInput.addEventListener('input', () => { if (!simState.isRunning && !simState.manualSetupActive) updateConfigFromUI(false); });

	document.querySelectorAll('#preyParamsSection input, #preyParamsSection select').forEach(element => {
		element.addEventListener('change', () => {
			if (!simState.isRunning && !simState.manualSetupActive) {
				updateConfigFromUI(false);
				drawGrid();
			}
		});
		element.addEventListener('input', () => {
			if (!simState.isRunning && !simState.manualSetupActive) {
				updateConfigFromUI(false);
				drawGrid();
			}
		});
	});

	function updateInputElement(elementId, value, dispatchChangeEvent = false) {
		const element = document.getElementById(elementId);
		if (element) {
			if (element.type === 'checkbox') {
				element.checked = (String(value).toLowerCase() === 'true');
			} else {
				element.value = value;
			}
			element.dispatchEvent(new Event('input', { bubbles: true })); 
			if (dispatchChangeEvent) element.dispatchEvent(new Event('change', { bubbles: true }));
		} else console.warn(`Element ${elementId} not found for preset update or settings import.`);
	}

	const ratioMap = AppConfig.ui.RATIO_MAP;
	const ratioValues = AppConfig.ui.RATIO_VALUES;
	const brAttMovementMap = AppConfig.ui.BR_ATT_MOVEMENT_MAP;
	const brDefSelectivityMap = AppConfig.ui.BR_DEF_SELECTIVITY_MAP;

	function updateSliderDisplay(sliderElement, displayElement, mapArray, valueOverride = null) {
		const value = valueOverride !== null ? parseInt(valueOverride) : parseInt(sliderElement.value);
		 if (mapArray && displayElement) displayElement.textContent = mapArray[value];
		 else if (displayElement) displayElement.textContent = `${sliderElement.value}%`; 
	}

	function updateBattleRoyaleSliders() {
		let attPercent = parseInt(brAttackerPercentSlider.value);
		let defPercent = parseInt(brDefenderPercentSlider.value);

		// Adjust Attacker slider based on Defender value
		const maxAtt = 100 - defPercent;
		brAttackerPercentSlider.max = maxAtt;
		brAttackerPercentMaxDisplay.textContent = `${maxAtt}%`;
		if (attPercent > maxAtt) {
			attPercent = maxAtt;
			brAttackerPercentSlider.value = maxAtt;
			simState.activePresetConfig.brAttackerPercent = maxAtt;
		}
		
		// Adjust Defender slider based on Attacker value
		const maxDef = 100 - attPercent;
		brDefenderPercentSlider.max = maxDef;
		brDefenderPercentMaxDisplay.textContent = `${maxDef}%`;
		if (defPercent > maxDef) {
			defPercent = maxDef;
			brDefenderPercentSlider.value = maxDef;
			simState.activePresetConfig.brDefenderPercent = maxDef;
		}

		const preyPercent = 100 - attPercent - defPercent;

		// Update displays
		brAttackerPercentDisplay.textContent = `${attPercent}%`;
		brDefenderPercentDisplay.textContent = `${defPercent}%`;
		brMixDisplay.textContent = `${attPercent}% Att, ${defPercent}% Def, ${preyPercent}% Prey`;
	}

	function setActivePresetGroup(groupElementId) {
		document.querySelectorAll('.preset-group').forEach(group => group.classList.remove('active-group'));
		const activeGroup = document.getElementById(groupElementId);
		if (activeGroup) activeGroup.classList.add('active-group');
	}

	function setActiveSubtypeButton(buttonElement) {
		const group = buttonElement.closest('.preset-group');
		if (group) group.querySelectorAll('.preset-select-button').forEach(btn => btn.classList.remove('active-preset-subtype'));
		buttonElement.classList.add('active-preset-subtype');
	}

	presetsModalBody.addEventListener('click', (event) => {
		const button = event.target.closest('.preset-select-button');
		if (!button) return;
		const presetGroup = button.dataset.presetGroup;
		simState.activePresetConfig.group = presetGroup; 
		setActivePresetGroup(`presetGroup${presetGroup.charAt(0).toUpperCase() + presetGroup.slice(1)}`);
		if (button.dataset.action === 'selectSensitivityType') {
			simState.activePresetConfig.sensitivityType = button.dataset.type;
			setActiveSubtypeButton(button);
		} else if (button.dataset.action === 'selectTitForTatLevel') {
			simState.activePresetConfig.titfortatLevel = button.dataset.level;
			setActiveSubtypeButton(button);
		} else if (button.dataset.action === 'selectPredationType') {
			simState.activePresetConfig.predationEffectorType = button.dataset.type;
			setActiveSubtypeButton(button);
		} else if (button.dataset.action === 'selectMovementPredation') {
			simState.activePresetConfig.movementPredation = button.dataset.type;
			setActiveSubtypeButton(button);
		} else if (button.dataset.action === 'selectPreyToxinLysis') {
			simState.activePresetConfig.preyToxinLysis = button.dataset.type;
			setActiveSubtypeButton(button);
		} else if (button.dataset.action === 'selectPreyToxinTriggerMode') {
			simState.activePresetConfig.preyToxinTriggerMode = button.dataset.type;
			setActiveSubtypeButton(button);
		}
	});

	// This new listener makes the entire preset group box clickable for selection
	presetsModalBody.addEventListener('click', (event) => {
		// Find the clicked preset group, if any
		const groupDiv = event.target.closest('.preset-group');
		
		if (groupDiv) {
			// Get the group name from the new data-group attribute
			const groupName = groupDiv.dataset.group;
			
			if (groupName) {
				// Set this as the active group
				simState.activePresetConfig.group = groupName;
				
				// Update the visual highlight
				// The setActivePresetGroup function takes the full ID, e.g., "presetGroupDensity"
				setActivePresetGroup(groupDiv.id);
			}
		}
	});

	document.querySelectorAll('.preset-config-slider').forEach(slider => {
		slider.addEventListener('input', () => {
			const group = slider.dataset.group;
			simState.activePresetConfig.group = group; 
			setActivePresetGroup(`presetGroup${group.charAt(0).toUpperCase() + group.slice(1)}`);
			if (group === 'density') {
				if (slider.id === 'densityFillSlider') { simState.activePresetConfig.densityFillPercent = parseInt(slider.value); updateSliderDisplay(slider, densityFillDisplay, null); }
				else if (slider.id === 'densityAttPreyRatioSlider') { simState.activePresetConfig.densityAttPreyRatioIndex = parseInt(slider.value); updateSliderDisplay(slider, densityRatioDisplay, ratioMap); }
			} else if (group === 'sensitivity') {
				if (slider.id === 'sensitivityFillSlider') { simState.activePresetConfig.sensitivityFillPercent = parseInt(slider.value); updateSliderDisplay(slider, sensitivityFillDisplay, null); }
				else if (slider.id === 'sensitivityAttPreyRatioSlider') { simState.activePresetConfig.sensitivityAttPreyRatioIndex = parseInt(slider.value); updateSliderDisplay(slider, sensitivityRatioDisplay, ratioMap); }
			} else if (group === 'contactkin') { 
				if (slider.id === 'contactKinContactSensingSlider') { simState.activePresetConfig.contactKinContactSensingBias = parseInt(slider.value); updateSliderDisplay(slider, contactKinContactSensingDisplay, null); }
				else if (slider.id === 'contactKinKinExclusionSlider') { simState.activePresetConfig.contactKinKinExclusion = parseInt(slider.value); updateSliderDisplay(slider, contactKinKinExclusionDisplay, null); }
				else if (slider.id === 'contactKinFillSlider') { simState.activePresetConfig.contactKinFillPercent = parseInt(slider.value); updateSliderDisplay(slider, contactKinFillDisplay, null); }
				else if (slider.id === 'contactKinAttPreyRatioSlider') { simState.activePresetConfig.contactKinAttPreyRatioIndex = parseInt(slider.value); updateSliderDisplay(slider, contactKinRatioDisplay, ratioMap); }
			} else if (group === 'titfortat') {
				if (slider.id === 'titfortatFillSlider') { simState.activePresetConfig.titfortatFillPercent = parseInt(slider.value); updateSliderDisplay(slider, titfortatFillDisplay, null); }
			} else if (group === 'capsule') {
				if (slider.id === 'capsuleProtectionSlider') { simState.activePresetConfig.capsuleProtectionPercent = parseInt(slider.value); updateSliderDisplay(slider, capsuleProtectionDisplay, null); }
				else if (slider.id === 'capsuleTimeSlider') { simState.activePresetConfig.capsuleLayerTime = parseInt(slider.value); capsuleTimeDisplay.textContent = `${slider.value} min`; }
				else if (slider.id === 'capsuleFillSlider') { simState.activePresetConfig.capsuleFillPercent = parseInt(slider.value); updateSliderDisplay(slider, capsuleFillDisplay, null); }
				else if (slider.id === 'capsuleAttPreyRatioSlider') { simState.activePresetConfig.capsuleAttPreyRatioIndex = parseInt(slider.value); updateSliderDisplay(slider, capsuleRatioDisplay, ratioMap); }
			} else if (group === 'predation') {
				if (slider.id === 'predationLysesPerRepSlider') { simState.activePresetConfig.predationLysesPerRep = parseInt(slider.value); predationLysesPerRepDisplay.textContent = slider.value; }
				else if (slider.id === 'predationFillSlider') { simState.activePresetConfig.predationFillPercent = parseInt(slider.value); updateSliderDisplay(slider, predationFillDisplay, null); }
				else if (slider.id === 'predationAttPreyRatioSlider') { simState.activePresetConfig.predationAttPreyRatioIndex = parseInt(slider.value); updateSliderDisplay(slider, predationRatioDisplay, ratioMap); }
			} else if (group === 'movement') {
				const value = parseInt(slider.value);
				if (slider.id === 'movementPreyAiProdSlider') {
					simState.activePresetConfig.movementPreyAiProd = value;
					movementPreyAiProdDisplay.textContent = value;
				} else if (slider.id === 'movementAttMoveProbSlider') {
					simState.activePresetConfig.movementAttMoveProb = value;
					movementAttMoveProbDisplay.textContent = `${value}%`;
				} else if (slider.id === 'movementAttMoveDirSlider') {
					simState.activePresetConfig.movementAttMoveDir = value;
					movementAttMoveDirDisplay.textContent = `${value}%`;
				} else if (slider.id === 'movementArenaRadiusSlider') {
					simState.activePresetConfig.movementArenaRadius = value;
					movementArenaRadiusDisplay.textContent = value;
				} else if (slider.id === 'movementFillSlider') { 
					simState.activePresetConfig.movementFillPercent = value; 
					updateSliderDisplay(slider, movementFillDisplay, null); 
				} else if (slider.id === 'movementAttPreyRatioSlider') { 
					simState.activePresetConfig.movementAttPreyRatioIndex = value; 
					updateSliderDisplay(slider, movementRatioDisplay, ratioMap); 
				}
			}
			
			else if (group === 'qs') {
				const value = parseFloat(slider.value); // Use parseFloat for step="0.5"
				
				// Attacker sliders
				if (slider.id === 'attackerQSProdSlider') {
					simState.activePresetConfig.attackerQSProd = value;
					attackerQSProdDisplay.textContent = value;
				} else if (slider.id === 'attackerQSKSlider') {
					simState.activePresetConfig.attackerQSK = value;
					attackerQSKDisplay.textContent = value;
				} else if (slider.id === 'attackerQSNSlider') {
					simState.activePresetConfig.attackerQSN = value;
					attackerQSNDisplay.textContent = value;
				} 
				// Prey sliders
				else if (slider.id === 'preyQSProdSlider') {
					simState.activePresetConfig.preyQSProd = value;
					preyQSProdDisplay.textContent = value;
				} else if (slider.id === 'preyQSKSlider') {
					simState.activePresetConfig.preyQSK = value;
					preyQSKDisplay.textContent = value;
				} else if (slider.id === 'preyQSNSlider') {
					simState.activePresetConfig.preyQSN = value;
					preyQSNDisplay.textContent = value;
				}
				// Shared sliders
				else if (slider.id === 'attackerQSArenaFillSlider') {
					simState.activePresetConfig.attackerQSFillPercent = value;
					updateSliderDisplay(slider, attackerQSArenaFillDisplay, null);
				} else if (slider.id === 'attackerQSAttPreyRatioSlider') {
					simState.activePresetConfig.attackerQSAttPreyRatioIndex = value;
					updateSliderDisplay(slider, attackerQSRatioDisplay, ratioMap);
				}
			}
			
			else if (group === 'preytoxin') {
				const value = parseFloat(slider.value);
				if (slider.id === 'preyToxinArenaRadiusSlider') {
					simState.activePresetConfig.preyToxinArenaRadius = parseInt(value);
					preyToxinArenaRadiusDisplay.textContent = value;
				} else if (slider.id === 'preyToxinFillSlider') {
					simState.activePresetConfig.preyToxinFillPercent = parseInt(value);
					updateSliderDisplay(slider, preyToxinFillDisplay, null);
				} else if (slider.id === 'preyToxinAttPreyRatioSlider') {
					simState.activePresetConfig.preyToxinAttPreyRatioIndex = parseInt(value);
					updateSliderDisplay(slider, preyToxinRatioDisplay, ratioMap);
				} else if (slider.id === 'preyToxinStartProbabilitySlider') {
					simState.activePresetConfig.preyToxinStartProb = value;
					preyToxinStartProbabilityDisplay.textContent = `${value}%`;
				} else if (slider.id === 'preyToxinNLProdSlider') {
					simState.activePresetConfig.preyToxinNLProd = parseInt(value);
					preyToxinNLProdDisplay.textContent = value;
				} else if (slider.id === 'preyToxinLProdSlider') {
					simState.activePresetConfig.preyToxinLProd = parseInt(value);
					preyToxinLProdDisplay.textContent = value;
				}
			}
			
			else if (group === 'battleroyale') {
				const value = slider.value;
				const checked = slider.checked;

				if (slider.id === 'brArenaRadiusSlider') {
					simState.activePresetConfig.brArenaRadius = parseInt(value);
					brArenaRadiusDisplay.textContent = value;
				} else if (slider.id === 'brFillSlider') {
					simState.activePresetConfig.brFillPercent = parseInt(value);
					brFillDisplay.textContent = `${value}%`;
				} else if (slider.id === 'brAttackerPercentSlider') {
					simState.activePresetConfig.brAttackerPercent = parseInt(value);
					updateBattleRoyaleSliders();
				} else if (slider.id === 'brDefenderPercentSlider') {
					simState.activePresetConfig.brDefenderPercent = parseInt(value);
					updateBattleRoyaleSliders();
				}
				// Strategy Sliders
				else if (slider.id === 'brAttMovementSlider') {
					const valInt = parseInt(value);
					simState.activePresetConfig.brAttMovement = valInt;
					brAttMovementDisplay.textContent = brAttMovementMap[valInt];
				} else if (slider.id === 'brDefSelectivitySlider') {
					const valInt = parseInt(value);
					simState.activePresetConfig.brDefSelectivity = valInt;
					brDefSelectivityDisplay.textContent = brDefSelectivityMap[valInt];
				} else if (slider.id === 'brPreyToxinStartProbabilitySlider') {
					const valFloat = BR_TOXIN_START_PROB_VALUES[parseInt(value)];
					simState.activePresetConfig.brPreyToxinStartProb = valFloat;
					brPreyToxinStartProbabilityDisplay.textContent = `${valFloat}%`;
				}
				// Checkboxes
				else if (slider.id === 'brAttQsCheckbox') { simState.activePresetConfig.brAttQs = checked; }
				else if (slider.id === 'brAttKinCheckbox') { simState.activePresetConfig.brAttKin = checked; }
				else if (slider.id === 'brAttContactCheckbox') { simState.activePresetConfig.brAttContact = checked; }
				else if (slider.id === 'brAttPredationCheckbox') { simState.activePresetConfig.brAttPredation = checked; }
				else if (slider.id === 'brPreyMovementCheckbox') { simState.activePresetConfig.brPreyMovement = checked; }
				else if (slider.id === 'brPreyAiCheckbox') { simState.activePresetConfig.brPreyAi = checked; }
				else if (slider.id === 'brPreyCapsuleCheckbox') { simState.activePresetConfig.brPreyCapsule = checked; }
				else if (slider.id === 'brPreyToxinCheckbox') { simState.activePresetConfig.brPreyToxin = checked; }
				else if (slider.id === 'brDefMovementCheckbox') { simState.activePresetConfig.brDefMovement = checked; }
				else if (slider.id === 'brDefPredationCheckbox') { simState.activePresetConfig.brDefPredation = checked; }
			}
		});
	});

	openPresetsModalButton.addEventListener('click', () => {
		updateSliderDisplay(densityFillSlider, densityFillDisplay, null, simState.activePresetConfig.densityFillPercent);
		updateSliderDisplay(densityAttPreyRatioSlider, densityRatioDisplay, ratioMap, simState.activePresetConfig.densityAttPreyRatioIndex);
		updateSliderDisplay(sensitivityFillSlider, sensitivityFillDisplay, null, simState.activePresetConfig.sensitivityFillPercent);
		updateSliderDisplay(sensitivityAttPreyRatioSlider, sensitivityRatioDisplay, ratioMap, simState.activePresetConfig.sensitivityAttPreyRatioIndex);
		document.querySelectorAll('#presetGroupSensitivity .preset-select-button').forEach(btn => btn.classList.toggle('active-preset-subtype', btn.dataset.type === simState.activePresetConfig.sensitivityType));
		updateSliderDisplay(contactKinContactSensingSlider, contactKinContactSensingDisplay, null, simState.activePresetConfig.contactKinContactSensingBias);
		updateSliderDisplay(contactKinKinExclusionSlider, contactKinKinExclusionDisplay, null, simState.activePresetConfig.contactKinKinExclusion);
		updateSliderDisplay(contactKinFillSlider, contactKinFillDisplay, null, simState.activePresetConfig.contactKinFillPercent);
		updateSliderDisplay(contactKinAttPreyRatioSlider, contactKinRatioDisplay, ratioMap, simState.activePresetConfig.contactKinAttPreyRatioIndex);

		updateSliderDisplay(titfortatFillSlider, titfortatFillDisplay, null, simState.activePresetConfig.titfortatFillPercent);
		document.querySelectorAll('#presetGroupTitfortat .preset-select-button').forEach(btn => btn.classList.toggle('active-preset-subtype', btn.dataset.level === simState.activePresetConfig.titfortatLevel));
		
		// Preset 5: Capsule
		updateSliderDisplay(capsuleProtectionSlider, capsuleProtectionDisplay, null, simState.activePresetConfig.capsuleProtectionPercent);
		capsuleTimeSlider.value = simState.activePresetConfig.capsuleLayerTime;
		capsuleTimeDisplay.textContent = `${simState.activePresetConfig.capsuleLayerTime} min`;
		updateSliderDisplay(capsuleFillSlider, capsuleFillDisplay, null, simState.activePresetConfig.capsuleFillPercent);
		updateSliderDisplay(capsuleAttPreyRatioSlider, capsuleRatioDisplay, ratioMap, simState.activePresetConfig.capsuleAttPreyRatioIndex);
		// Preset 6: Predation
		document.querySelectorAll('#presetGroupPredation .preset-select-button').forEach(btn => btn.classList.toggle('active-preset-subtype', btn.dataset.type === simState.activePresetConfig.predationEffectorType));
		predationLysesPerRepSlider.value = simState.activePresetConfig.predationLysesPerRep;
		predationLysesPerRepDisplay.textContent = simState.activePresetConfig.predationLysesPerRep;
		updateSliderDisplay(predationFillSlider, predationFillDisplay, null, simState.activePresetConfig.predationFillPercent);
		updateSliderDisplay(predationAttPreyRatioSlider, predationRatioDisplay, ratioMap, simState.activePresetConfig.predationAttPreyRatioIndex);
		// Preset 7: Movement
		document.querySelectorAll('#presetGroupMovement .preset-select-button').forEach(btn => btn.classList.toggle('active-preset-subtype', btn.dataset.type === simState.activePresetConfig.movementPredation));
		movementPreyAiProdSlider.value = simState.activePresetConfig.movementPreyAiProd;
		movementPreyAiProdDisplay.textContent = simState.activePresetConfig.movementPreyAiProd;
		movementAttMoveProbSlider.value = simState.activePresetConfig.movementAttMoveProb;
		movementAttMoveProbDisplay.textContent = `${simState.activePresetConfig.movementAttMoveProb}%`;
		movementAttMoveDirSlider.value = simState.activePresetConfig.movementAttMoveDir;
		movementAttMoveDirDisplay.textContent = `${simState.activePresetConfig.movementAttMoveDir}%`;
		movementArenaRadiusSlider.value = simState.activePresetConfig.movementArenaRadius;
		movementArenaRadiusDisplay.textContent = simState.activePresetConfig.movementArenaRadius;
		updateSliderDisplay(movementFillSlider, movementFillDisplay, null, simState.activePresetConfig.movementFillPercent);
		updateSliderDisplay(movementAttPreyRatioSlider, movementRatioDisplay, ratioMap, simState.activePresetConfig.movementAttPreyRatioIndex);
		// Preset 8: Quorum Sensing
		attackerQSProdSlider.value = simState.activePresetConfig.attackerQSProd;
		attackerQSProdDisplay.textContent = simState.activePresetConfig.attackerQSProd;
		attackerQSKSlider.value = simState.activePresetConfig.attackerQSK;
		attackerQSKDisplay.textContent = simState.activePresetConfig.attackerQSK;
		attackerQSNSlider.value = simState.activePresetConfig.attackerQSN;
		attackerQSNDisplay.textContent = simState.activePresetConfig.attackerQSN;
		
		preyQSProdSlider.value = simState.activePresetConfig.preyQSProd;
		preyQSProdDisplay.textContent = simState.activePresetConfig.preyQSProd;
		preyQSKSlider.value = simState.activePresetConfig.preyQSK;
		preyQSKDisplay.textContent = simState.activePresetConfig.preyQSK;
		preyQSNSlider.value = simState.activePresetConfig.preyQSN;
		preyQSNDisplay.textContent = simState.activePresetConfig.preyQSN;

		updateSliderDisplay(attackerQSArenaFillSlider, attackerQSArenaFillDisplay, null, simState.activePresetConfig.attackerQSFillPercent);
		updateSliderDisplay(attackerQSAttPreyRatioSlider, attackerQSRatioDisplay, ratioMap, simState.activePresetConfig.attackerQSAttPreyRatioIndex);
		
		// Preset 9: Prey Toxin Production
		preyToxinArenaRadiusSlider.value = simState.activePresetConfig.preyToxinArenaRadius;
		preyToxinArenaRadiusDisplay.textContent = simState.activePresetConfig.preyToxinArenaRadius;
		updateSliderDisplay(preyToxinFillSlider, preyToxinFillDisplay, null, simState.activePresetConfig.preyToxinFillPercent);
		updateSliderDisplay(preyToxinAttPreyRatioSlider, preyToxinRatioDisplay, ratioMap, simState.activePresetConfig.preyToxinAttPreyRatioIndex);
		
		preyToxinStartProbabilitySlider.value = simState.activePresetConfig.preyToxinStartProb;
		preyToxinStartProbabilityDisplay.textContent = `${simState.activePresetConfig.preyToxinStartProb}%`;
		preyToxinNLProdSlider.value = simState.activePresetConfig.preyToxinNLProd;
		preyToxinNLProdDisplay.textContent = simState.activePresetConfig.preyToxinNLProd;
		preyToxinLProdSlider.value = simState.activePresetConfig.preyToxinLProd;
		preyToxinLProdDisplay.textContent = simState.activePresetConfig.preyToxinLProd;

		document.querySelectorAll('#presetGroupPreytoxin [data-action="selectPreyToxinLysis"]').forEach(btn => {
			btn.classList.toggle('active-preset-subtype', btn.dataset.type === simState.activePresetConfig.preyToxinLysis);
		});
		document.querySelectorAll('#presetGroupPreytoxin [data-action="selectPreyToxinTriggerMode"]').forEach(btn => {
			btn.classList.toggle('active-preset-subtype', btn.dataset.type === simState.activePresetConfig.preyToxinTriggerMode);
		});

		// Preset 10: Battle Royale
		brArenaRadiusSlider.value = simState.activePresetConfig.brArenaRadius;
		brArenaRadiusDisplay.textContent = simState.activePresetConfig.brArenaRadius;
		brFillSlider.value = simState.activePresetConfig.brFillPercent;
		brFillDisplay.textContent = `${simState.activePresetConfig.brFillPercent}%`;
		brAttackerPercentSlider.value = simState.activePresetConfig.brAttackerPercent;
		brDefenderPercentSlider.value = simState.activePresetConfig.brDefenderPercent;
		updateBattleRoyaleSliders(); // This sets all slider values, maxes, and text displays
		
		// Strategy Sliders
		const attMoveVal = simState.activePresetConfig.brAttMovement;
		brAttMovementSlider.value = attMoveVal;
		brAttMovementDisplay.textContent = brAttMovementMap[attMoveVal];
		
		const defSelVal = simState.activePresetConfig.brDefSelectivity;
		brDefSelectivitySlider.value = defSelVal;
		brDefSelectivityDisplay.textContent = brDefSelectivityMap[defSelVal];

		// Checkboxes
		brAttQsCheckbox.checked = simState.activePresetConfig.brAttQs;
		brAttKinCheckbox.checked = simState.activePresetConfig.brAttKin;
		brAttContactCheckbox.checked = simState.activePresetConfig.brAttContact;
		brAttPredationCheckbox.checked = simState.activePresetConfig.brAttPredation;
		brPreyMovementCheckbox.checked = simState.activePresetConfig.brPreyMovement;
		brPreyAiCheckbox.checked = simState.activePresetConfig.brPreyAi;
		brPreyCapsuleCheckbox.checked = simState.activePresetConfig.brPreyCapsule;
		brPreyToxinCheckbox.checked = simState.activePresetConfig.brPreyToxin;
		
		const brToxinStartProbVal = simState.activePresetConfig.brPreyToxinStartProb !== undefined ? simState.activePresetConfig.brPreyToxinStartProb : 0.01;
		const brToxinStartProbIndex = BR_TOXIN_START_PROB_VALUES.indexOf(brToxinStartProbVal);
		brPreyToxinStartProbabilitySlider.value = brToxinStartProbIndex !== -1 ? brToxinStartProbIndex : 2;
		brPreyToxinStartProbabilityDisplay.textContent = `${brToxinStartProbVal}%`;

		brDefMovementCheckbox.checked = simState.activePresetConfig.brDefMovement;
		brDefPredationCheckbox.checked = simState.activePresetConfig.brDefPredation;
		
		document.querySelectorAll('#presetGroupBattleroyale .preset-select-button').forEach(btn => {
			const action = btn.dataset.action;
			const type = btn.dataset.type;
			let isActive = false;
			if (action === 'brAttMovement') isActive = simState.activePresetConfig.brAttMovement === type;
			else if (action === 'brAttQs') isActive = simState.activePresetConfig.brAttQs === type;
			else if (action === 'brAttKin') isActive = simState.activePresetConfig.brAttKin === type;
			else if (action === 'brAttContact') isActive = simState.activePresetConfig.brAttContact === type;
			else if (action === 'brAttPredation') isActive = simState.activePresetConfig.brAttPredation === type;
			else if (action === 'brPreyMovement') isActive = simState.activePresetConfig.brPreyMovement === type;
			else if (action === 'brPreyAi') isActive = simState.activePresetConfig.brPreyAi === type;
			else if (action === 'brPreyCapsule') isActive = simState.activePresetConfig.brPreyCapsule === type;
			else if (action === 'brPreyToxin') isActive = simState.activePresetConfig.brPreyToxin === type;
			else if (action === 'brDefMovement') isActive = simState.activePresetConfig.brDefMovement === type;
			else if (action === 'brDefSelectivity') isActive = simState.activePresetConfig.brDefSelectivity === type;
			else if (action === 'brDefPredation') isActive = simState.activePresetConfig.brDefPredation === type;
			btn.classList.toggle('active-preset-subtype', isActive);
		});
		
		setActivePresetGroup(`presetGroup${simState.activePresetConfig.group.charAt(0).toUpperCase() + simState.activePresetConfig.group.slice(1)}`);
		presetsModalOverlay.classList.remove('hidden');
	});

	closePresetsModalButton.addEventListener('click', () => presetsModalOverlay.classList.add('hidden'));
	presetsModalOverlay.addEventListener('click', (event) => { if (event.target === presetsModalOverlay) presetsModalOverlay.classList.add('hidden'); });


	applyActivePresetButton.addEventListener('click', async () => {
		const group = simState.activePresetConfig.group;
		const config = simState.activePresetConfig; // User's UI choices

		// 1. Get the baseline overrides from config and apply them
		const baselineOverrides = PRESET_OVERRIDES[group] || {};
		applySettingsObject(baselineOverrides);

		// 2. Get the specific logic handler for this preset from config
		const presetLogicHandler = AppConfig.presetLogic[group]?.handler;

		let dynamicSettings = {};
		if (presetLogicHandler) {
			// 3. Call the handler. It will perform all complex logic
			// (like calculateAndSetCellCounts) and return an
			// object of the dynamic settings to apply.
			dynamicSettings = presetLogicHandler(config);
		}

		// 4. Apply the dynamic settings returned by the handler
		if (dynamicSettings) {
			applySettingsObject(dynamicSettings);
		}

		// 5. Finalize the application
		await finalizePresetApplication();
	});


	function calculateAndSetCellCounts(fillPercent, attToPreyRatioValue, includeDefenders = false, defenderRatioPart = 1) {
		const arenaRadius = parseInt(arenaGridRadiusInput.value) || simState.config.hexGridActualRadius; 
		const totalSpaces = 1 + 3 * arenaRadius * (arenaRadius + 1);
		const totalCellsToPlace = Math.round(totalSpaces * (fillPercent / 100));
		let attCount, preyCount, defCount = 0;

		if (includeDefenders) {
			const totalParts = attToPreyRatioValue + 1 + defenderRatioPart; 
			if (totalParts === 0) { attCount = 0; preyCount = 0; defCount = 0; }
			else {
				preyCount = Math.round(totalCellsToPlace * (1 / totalParts));
				attCount = Math.round(totalCellsToPlace * (attToPreyRatioValue / totalParts));
				defCount = Math.round(totalCellsToPlace * (defenderRatioPart / totalParts));
			}
			const currentTotal = attCount + preyCount + defCount;
			if (currentTotal !== totalCellsToPlace && totalCellsToPlace > 0) {
				 preyCount += (totalCellsToPlace - currentTotal);
				 if(preyCount < 0) { 
					 if(attCount + defCount < totalCellsToPlace && attCount > Math.abs(preyCount)) attCount += preyCount;
					 else if (defCount > Math.abs(preyCount)) defCount += preyCount;
					 preyCount = 0;
				}
			}
		} else { 
			if (attToPreyRatioValue + 1 === 0) { preyCount = 0; attCount = 0;} 
			else {
				preyCount = Math.round(totalCellsToPlace / (attToPreyRatioValue + 1));
				attCount = totalCellsToPlace - preyCount;
			}
		}
		updateInputElement('initialAttackersInput', Math.max(0, attCount));
		updateInputElement('initialPreyInput', Math.max(0, preyCount));
		updateInputElement('initialDefendersInput', Math.max(0, defCount));
	}

	async function finalizePresetApplication() {
		updateConfigFromUI(true); 
		await resetSimulationState(); 

		const hasAttackers = simState.config.attacker.initialCount > 0;
		const hasPrey = simState.config.prey.initialCount > 0;
		const hasDefenders = simState.config.defender.initialCount > 0;
		if (hasAttackers || hasPrey || hasDefenders) {
			ensureDataStructuresSize();
			populateCellsRandomly(); 
			simState.isInitialized = true;
		} else {
			simState.isInitialized = false; 
		}
		drawGrid(); updateStats(); updateButtonStatesAndUI();
		presetsModalOverlay.classList.add('hidden');
	}


	// New: Function to capture current arena state as TSV string
	function captureCurrentArenaStateTSV(currentCellsMap) {
		let tsvContent = "q\tr\ttype\n";
		currentCellsMap.forEach(cell => {
			if (!cell.isEffectivelyGone) { // Only include active cells
				tsvContent += `${cell.q}\t${cell.r}\t${cell.type}\n`;
			}
		});
		return tsvContent;
	}

function captureFullState() {
    // We will now create the optimized object FIRST, and then measure IT.
    
    // 1. Create the final, optimized object that will be stored.
    const optimizedStep = {
        simulationStepCount: simState.simulationStepCount,
        rngDrawCountAtStep: simState.rngDrawCount,
        nextCellId: simState.nextCellId,
        cumulativeFirings: simState.cumulativeFirings,
        cumulativeKills: { ...simState.cumulativeKills },
        cumulativeLyses: { ...simState.cumulativeLyses },
        totalCPRGConverted: simState.totalCPRGConverted,
        remainingCPRGSubstrate: simState.remainingCPRGSubstrate,
        totalActiveLacZReleased: simState.totalActiveLacZReleased,
        firingsThisStep: simState.firingsThisStep,
        killedThisStep: { ...simState.killedThisStep },
        lysedThisStep: { ...simState.lysedThisStep },
        activeFiringsThisStep: Array.from(simState.activeFiringsThisStep.entries()),
        attackerAiGrid: Array.from(simState.attackerAiGrid.entries()),
        preyAiGrid: Array.from(simState.preyAiGrid.entries()),
        preyToxinNLGrid: Array.from(simState.preyToxinNLGrid.entries()),
        preyToxinLGrid: Array.from(simState.preyToxinLGrid.entries()),
        cells: Array.from(simState.cells.values()).map(cellObject => {
            const valueArray = [];
            for (const schemaKey of CELL_SCHEMA) {
                if (schemaKey === 'type') {
                    valueArray.push(TYPE_TO_INT[cellObject.type]);
                } else if (schemaKey === 'id_num') {
                    const idParts = cellObject.id.split('-');
                    valueArray.push(idParts.length > 1 ? parseInt(idParts[idParts.length - 1], 10) : 0);
                } else {
                    valueArray.push(cellObject[schemaKey]);
                }
            }
            return valueArray;
        }),
        isOffloaded: false
    };

    // 2. NOW, measure the size of the ACTUAL object we are about to store.
    const stepSizeInBytes = JSON.stringify(optimizedStep).length;
    simState.capturedHistoryTotalSize += stepSizeInBytes;

    // 3. Store the optimized object in RAM Map.
	simState.optimizedHistoryFrames.set(simState.simulationStepCount, optimizedStep);
}


function rehydrateOptimizedStep(inputObject) {
    // This function is now robust and handles both full JSON imports and internal history frames.
    const sourceForState = inputObject.state || inputObject;
    const sourceForMetadata = inputObject.metadata || inputObject;

    if (!sourceForState.cells) {
        throw new Error("Cannot rehydrate state: 'cells' array not found in the provided object source.");
    }

    const rehydratedCells = new Map();
    const cellSchema = inputObject.cell_schema || CELL_SCHEMA; // Use schema from file if it exists

    for (const cellData of sourceForState.cells) {
        let plainCell = {};

        // Check if cellData is an optimized array (from .bft6 history) or a full object (from .json)
        if (Array.isArray(cellData)) {
            // It's an optimized array, build the object from the schema
            cellSchema.forEach((key, index) => {
                plainCell[key] = cellData[index];
            });
        } else {
            // It's already a full object from JSON
            plainCell = cellData;
        }

        if (plainCell.type === undefined) {
            console.warn("Skipping cell with undefined type during rehydration:", plainCell);
            continue;
        }

        // Convert integer type back to string if needed
        const cellTypeStr = typeof plainCell.type === 'number' ? INT_TO_TYPE[plainCell.type] : plainCell.type;
        const cellIdNum = plainCell.id_num !== undefined ? plainCell.id_num : (plainCell.id || 'err').split('-').pop();

        const cellInstance = new Cell(plainCell.q, plainCell.r, cellTypeStr, `${cellTypeStr}-${cellIdNum}`, true);
        Object.assign(cellInstance, plainCell);
        cellInstance.type = cellTypeStr; // Ensure type is the string version

        rehydratedCells.set(`${cellInstance.q},${cellInstance.r}`, cellInstance);
		
    }

    // Return a consistent object structure that other functions can rely on
	return {
		simulationStepCount: sourceForMetadata.simulationStepCount,
		rngDrawCountAtStep: sourceForMetadata.rngDrawCountAtStep,
		nextCellId: sourceForState.nextCellId,
		cumulativeFirings: sourceForState.cumulativeFirings,
		cumulativeKills: sourceForState.cumulativeKills,
		cumulativeLyses: sourceForState.cumulativeLyses,
		totalCPRGConverted: sourceForState.totalCPRGConverted,
		remainingCPRGSubstrate: sourceForState.remainingCPRGSubstrate,
		totalActiveLacZReleased: sourceForState.totalActiveLacZReleased,
        firingsThisStep: sourceForState.firingsThisStep || 0,
        killedThisStep: sourceForState.killedThisStep ? { ...sourceForState.killedThisStep } : { attacker: 0, prey: 0, defender: 0 },
        lysedThisStep: sourceForState.lysedThisStep ? { ...sourceForState.lysedThisStep } : { attacker: 0, prey: 0, defender: 0 },
		cells: rehydratedCells,

		// --- This simplified logic now correctly handles all maps from all sources ---
		attackerAiGrid: new Map(sourceForState.attackerAiGrid || []),
		preyAiGrid: new Map(sourceForState.preyAiGrid || []),
		preyToxinNLGrid: new Map(sourceForState.preyToxinNLGrid || sourceForState.preyToxinGrid || []),
		preyToxinLGrid: new Map(sourceForState.preyToxinLGrid || []),
		activeFiringsThisStep: new Map(sourceForState.activeFiringsThisStep || [])
	};
}

let _sharedNextAiGrid = null;

function updateAiGrid(currentAiGrid, qsConfig, allCellsMap, gridRadius, isToxin = false) {
    if (qsConfig.diffusionRate <= 0 && qsConfig.degradationRate <= 0) {
        return currentAiGrid; // Skip calculations if there's nothing to do
    }

    if (!_sharedNextAiGrid || _sharedNextAiGrid.radius !== gridRadius) {
        _sharedNextAiGrid = new FloatGrid(gridRadius);
    }
    
    // We are going to write the results into _sharedNextAiGrid
    const currArr = currentAiGrid.grid;
    const nextArr = _sharedNextAiGrid.grid;
    // Fast path: use direct array if available
    const cellsArr = typeof allCellsMap.getByCoords === 'function' ? allCellsMap.grid : undefined; 
    const length = currArr.length;

    const diffRate = qsConfig.diffusionRate;
    const degRate = qsConfig.degradationRate;

    // Fast clear of the next array buffer
    nextArr.fill(0);

    for (let i = 0; i < length; i++) {
        let C_key_old = currArr[i];
        
        // Match original script.js exactly
        const cell = cellsArr ? cellsArr[i] : undefined;

        if (cell !== undefined && cell !== null && cell.type === 'barrier') {
            continue; 
        }

        if (C_key_old < 1e-6 && cell === undefined) {
            let hasNeighborSource = false;
            for (let dir = 0; dir < 6; dir++) {
                const nIndex = neighborCacheIdx[i * 6 + dir];
                if (nIndex !== -1 && currArr[nIndex] > 1e-6) {
                    hasNeighborSource = true;
                    break;
                }
            }
            if (!hasNeighborSource) continue;
        }

        let netChangeForKey = 0;
        for (let dir = 0; dir < 6; dir++) {
            const nIndex = neighborCacheIdx[i * 6 + dir];
            let C_neighbor_old = 0;
            let isNeighborBlocked = false;

            if (nIndex === -1) {
                isNeighborBlocked = true;
            } else {
                const neighborCell = cellsArr ? cellsArr[nIndex] : undefined;
                if (neighborCell !== undefined && neighborCell !== null && neighborCell.type === 'barrier') {
                    isNeighborBlocked = true;
                } else {
                    C_neighbor_old = currArr[nIndex];
                }
            }

            if (!isNeighborBlocked) {
                netChangeForKey += diffRate * (C_neighbor_old - C_key_old);
            }
        }

        let newConcentration = C_key_old + netChangeForKey;
        newConcentration *= (1 - degRate);

        let finalConcentration = 0;
        if (isToxin) {
            if (newConcentration >= 0.01) {
                finalConcentration = Math.round(newConcentration * 1e5) / 1e5;
            }
        } else {
            finalConcentration = Math.round(newConcentration * 1e5) / 1e5;
        }

        if (finalConcentration > 0) {
            nextArr[i] = finalConcentration;
        }
    }

    // --- DOUBLE BUFFERING ---
    // Instead of creating a new FloatGrid, we just copy the values directly
    // This allows us to avoid object creation while retaining exact reference behavior
    currentAiGrid.grid.set(_sharedNextAiGrid.grid);
    return currentAiGrid;
}

function rehydrateCells(plainCellMap) {
    const rehydratedMap = new Map();
    for (const [key, plainCell] of plainCellMap.entries()) {
        // Create a new Cell instance with the fundamental properties
        const cellInstance = new Cell(plainCell.q, plainCell.r, plainCell.type, plainCell.id);
        // Copy all other saved properties (like cooldowns, isDead, toxins, etc.) onto the new instance
        Object.assign(cellInstance, plainCell);
        rehydratedMap.set(key, cellInstance);
    }
    return rehydratedMap;
}
	
async function runSimulationStep() {
	try {
        const now = performance.now();
        const shouldUpdateUI = (!simState.lastUiUpdateTime || now - simState.lastUiUpdateTime >= 100);

        // Run the spike detection logic first, using the state from the end of the last step.
        checkForRngSpike();
        // Now, update the tracker for the next iteration.
        simState.lastRngCounts.push(simState.rngDrawCount);
        if (simState.lastRngCounts.length > 2) {
            simState.lastRngCounts.shift(); // Keep only the last two counts
        }

        if (simState.saveArenaStatesEnabled && simState.config.history.interval > 0 && 
			(simState.simulationStepCount % simState.config.history.interval === 0 || simState.simulationStepCount === simState.config.duration)) {
			// This will likely need to be async or push to a queue to avoid blocking
			recordArenaStateForExport();
		}

		// Compact the CellMap queue to prevent iteration slowdown from tombstones
		if (simState.cells.compact) {
			simState.cells.compact();
		}


		const isRecordStep = (simState.simulationStepCount % (simState.config.historyRecordRate || 1) === 0);
		const stepAlreadyRecorded = simState.historicalData.length > 0 &&
			simState.historicalData[simState.historicalData.length - 1].time === simState.simulationStepCount;

		if (simState.config.historyEnabled) {
			if (!stepAlreadyRecorded && isRecordStep) {
				captureFullState();
			}
            if (shouldUpdateUI) {
			    updateTimeTravelSlider();
            }
		}
		if (!simState.isInitialized || (!simState.isRunning && !simState.isStepping)) {
			if(simState.isStepping) { simState.isStepping = false; updateButtonStatesAndUI(); }
			return;
		}

		// --- Check Stop Condition ---
		// simState.simulationStepCount is the current time point (e.g., 0 for initial, 1 after 1st minute, etc.)
		if (simState.config.simulationControl.totalSimulationMinutes > 0 &&
			simState.simulationStepCount >= simState.config.simulationControl.totalSimulationMinutes) {
			simState.isRunning = false;
			simState.isStepping = false;
			clearTimeout(simState.timeoutId);
			// Note: The state in simState.cells is the state AT totalSimulationMinutes.
			// This state hasn't been recorded by the loop yet if we stop here.
			// So, we will record it once more if it's the *exact* end time.
			if (!simState.finalStateRecorded) { // Add a flag to record only once
				if (simState.config.historyEnabled) {
					captureFullState();
					updateTimeTravelSlider();
				}
				// Record final state
				let currentLiveAttackerCount = 0, currentLivePreyCount = 0, currentLiveDefenderCount = 0;
				let currentDeadLysingAttackerCount = 0, currentDeadLysingPreyCount = 0, currentDeadLysingDefenderCount = 0;
				const currentGridRadiusFinal = simState.config.hexGridActualRadius;
				// Barriers are not included in these counts for the report
				simState.cells.forEach(c => {
					if (!isWithinHexBounds(c.q, c.r, currentGridRadiusFinal) || c.isEffectivelyGone) return;
					if (c.isDead || c.isLysing) {
						if (c.type === 'attacker') currentDeadLysingAttackerCount++;
						else if (c.type === 'prey') currentDeadLysingPreyCount++;
						else if (c.type === 'defender') currentDeadLysingDefenderCount++;
					} else {
						if (c.type === 'attacker') currentLiveAttackerCount++;
						else if (c.type === 'prey') currentLivePreyCount++;
						else if (c.type === 'defender') currentLiveDefenderCount++;
					}
				});
				simState.historicalData.push({
					time: simState.simulationStepCount, // This is totalSimulationMinutes
					liveAttackers: currentLiveAttackerCount, livePrey: currentLivePreyCount, liveDefenders: currentLiveDefenderCount,
					deadLysingAttackers: currentDeadLysingAttackerCount, deadLysingPrey: currentDeadLysingPreyCount, deadLysingDefenders: currentDeadLysingDefenderCount,
					firings: simState.cumulativeFirings,
					killedAttackers: simState.cumulativeKills.attacker, killedPrey: simState.cumulativeKills.prey, killedDefenders: simState.cumulativeKills.defender,
					lysedAttackers: simState.cumulativeLyses.attacker, lysedPrey: simState.cumulativeLyses.prey, lysedDefenders: simState.cumulativeLyses.defender,
					cprgConverted: simState.totalCPRGConverted
				});
				if (simState.saveImagesEnabled) { captureArenaImage(); }
				if (simState.saveArenaStatesEnabled) {
					const tsvString = captureCurrentArenaStateTSV(simState.cells);
					simState.capturedArenaStatesTSV.push({ step: simState.simulationStepCount, tsvData: tsvString, isOffloaded: false });
				    simState.capturedArenaStatesTSVTotalSize += tsvString.length;
				}

				drawGrid(); // Draw this final recorded state
				updateStats(); // Update stats for this final recorded state
				
				
				simState.finalStateRecorded = true;
			}
			showEndOfSimulationReport("Time Limit Reached");
			updateButtonStatesAndUI();
			return;
		}
		// Reset flag if simulation is still running before time limit
		if (simState.simulationStepCount < simState.config.simulationControl.totalSimulationMinutes) {
			simState.finalStateRecorded = false;
		}

		const currentGridRadius = simState.config.hexGridActualRadius; // Use current config for bounds checking

		// --- Record and Visualize Current State (for current simState.simulationStepCount) ---
		if (!stepAlreadyRecorded && isRecordStep) {
			let currentLiveAttackerCount = 0, currentLivePreyCount = 0, currentLiveDefenderCount = 0;
			let currentDeadLysingAttackerCount = 0, currentDeadLysingPreyCount = 0, currentDeadLysingDefenderCount = 0;
			// Barriers are not included in historical data counts
			simState.cells.forEach(c => {
				if (!isWithinHexBounds(c.q, c.r, currentGridRadius) || c.isEffectivelyGone) return;
				if (c.isDead || c.isLysing) {
					if (c.type === 'attacker') currentDeadLysingAttackerCount++;
					else if (c.type === 'prey') currentDeadLysingPreyCount++;
					else if (c.type === 'defender') currentDeadLysingDefenderCount++;
				} else {
					if (c.type === 'attacker') currentLiveAttackerCount++;
					else if (c.type === 'prey') currentLivePreyCount++;
					else if (c.type === 'defender') currentLiveDefenderCount++;
				}
			});

			// For time 0, cumulative stats are already 0. For subsequent steps, they reflect previous step's actions.
			simState.historicalData.push({
				time: simState.simulationStepCount,
				liveAttackers: currentLiveAttackerCount, livePrey: currentLivePreyCount, liveDefenders: currentLiveDefenderCount,
				deadLysingAttackers: currentDeadLysingAttackerCount, deadLysingPrey: currentDeadLysingPreyCount, deadLysingDefenders: currentDeadLysingDefenderCount,
				firings: simState.cumulativeFirings, // Cumulative up to *before* this step's calculations
				killedAttackers: simState.cumulativeKills.attacker, killedPrey: simState.cumulativeKills.prey, killedDefenders: simState.cumulativeKills.defender,
				lysedAttackers: simState.cumulativeLyses.attacker, lysedPrey: simState.cumulativeLyses.prey, lysedDefenders: simState.cumulativeLyses.defender,
				cprgConverted: simState.totalCPRGConverted // CPRG state *before* this step's lysis
			});

			if (simState.saveImagesEnabled) {
				captureArenaImage(); // Uses current simState.simulationStepCount for naming
			}
			if (simState.saveArenaStatesEnabled) {
				const tsvString = captureCurrentArenaStateTSV(simState.cells);
				simState.capturedArenaStatesTSV.push({ step: simState.simulationStepCount, tsvData: tsvString, isOffloaded: false });
				simState.capturedArenaStatesTSVTotalSize += tsvString.length;
			}
		}

        const renderRate = simState.config.simulationControl.renderRate;
        const isThisFrameRendered = (simState.simulationStepCount % renderRate === 0);

        if (isThisFrameRendered) {
            drawGrid(); // Only draw if it's a render step
        }

        if (shouldUpdateUI || isThisFrameRendered) {
		    updateStats(); // Displays stats for the current simState.simulationStepCount
            
            if (shouldUpdateUI) {
                simState.lastUiUpdateTime = now;
            }

		    // Update inspector panel if mouse is hovering over a hex
		    if (simState.lastHoveredHexKey) {
			    try {
				    const [q_str, r_str] = simState.lastHoveredHexKey.split(',');
				    const q = parseInt(q_str, 10);
				    const r = parseInt(r_str, 10);
				    // The inspector needs the raw data source for the step that was JUST processed
				    const stateSource = simState.optimizedHistoryFrames.get(simState.simulationStepCount - 1) || simState;
				    updateHoverInfoPanel(q, r, stateSource);
			    } catch (e) {
				    console.error("Error auto-updating hover panel:", e);
				    simState.lastHoveredHexKey = null; // Reset on error
			    }
		    }
        }
		
		// --- Clear Per-Step Trackers (before calculations for the current step) ---
		simState.activeFiringsThisStep.clear();
		simState.firingsThisStep = 0;
		simState.killedThisStep = { attacker: 0, prey: 0, defender: 0 };
		simState.lysedThisStep = { attacker: 0, prey: 0, defender: 0 };


		// --- Perform Calculations for State Transition (from current simState.simulationStepCount to next) ---
		let newCellsWorkingCopy = simState.cells;
		// Remove effectively gone cells and decrement cooldowns on the remaining ones (Lysis can happen here, lacZ released)
		for (const [key, cell] of newCellsWorkingCopy) {
			if (cell.isEffectivelyGone) {
				newCellsWorkingCopy.delete(key);
			} else {
				cell.decrementCooldowns();
				
				// Prey Toxin Damage accumulation
				if (cell.type !== 'prey' && cell.type !== 'barrier' && !cell.isLysing) {
					const localPreyNL = simState.preyToxinNLGrid.get(key) || 0;
					const localPreyL = simState.preyToxinLGrid.get(key) || 0;
					if (localPreyNL > 0 || localPreyL > 0) {
						let nlResistance = 0;
						let lResistance = 0;
						let sensitivityConfig = null;
						if (cell.type === 'attacker') {
							nlResistance = simState.config.attacker.sensitivity.preyToxinNLResistanceChance || 0;
							lResistance = simState.config.attacker.sensitivity.preyToxinLResistanceChance || 0;
							sensitivityConfig = simState.config.attacker.sensitivity;
						} else if (cell.type === 'defender') {
							nlResistance = simState.config.defender.sensitivity.preyToxinNLResistanceChance || 0;
							lResistance = simState.config.defender.sensitivity.preyToxinLResistanceChance || 0;
							sensitivityConfig = simState.config.defender.sensitivity;
						}
						
						if (sensitivityConfig) {
							if (localPreyNL > 0 && rng() >= nlResistance && !cell.isDead) {
								const absorptionRate = sensitivityConfig.preyToxinNLAbsorptionRate !== undefined ? sensitivityConfig.preyToxinNLAbsorptionRate : 0.1;
								const absorbedNL = Math.floor(localPreyNL * absorptionRate);
								if (absorbedNL >= 1) {
									cell.accumulatedPreyToxinNL += absorbedNL;
									const newNLVal = localPreyNL - absorbedNL;
									simState.preyToxinNLGrid.set(key, newNLVal < 0.01 ? 0 : Math.round(newNLVal * 1e5) / 1e5);
									if (cell.accumulatedPreyToxinNL >= (sensitivityConfig.preyToxinNLThreshold || 1)) {
										if (!cell.isDead) {
											cell.isDead = true;
											simState.killedThisStep[cell.type]++;
										}
									}
								}
							}
							if (localPreyL > 0 && rng() >= lResistance) {
								if (!cell.isLysing && !cell.isEffectivelyGone) {
									const absorptionRate = sensitivityConfig.preyToxinLAbsorptionRate !== undefined ? sensitivityConfig.preyToxinLAbsorptionRate : 0.1;
									const absorbedL = Math.floor(localPreyL * absorptionRate);
									if (absorbedL >= 1) {
										cell.accumulatedPreyToxinL += absorbedL;
										const newLVal = localPreyL - absorbedL;
										simState.preyToxinLGrid.set(key, newLVal < 0.01 ? 0 : Math.round(newLVal * 1e5) / 1e5);
										if (cell.accumulatedPreyToxinL >= (sensitivityConfig.preyToxinLThreshold || 1)) {
											const oldIsDead = cell.isDead;
											cell.isDead = true;
											if (!oldIsDead) {
												simState.killedThisStep[cell.type]++;
											}
											cell.isLysing = true;
											const effectiveL = Math.max(1, cell.accumulatedPreyToxinL);
											cell.lysisTimer = Math.ceil(sensitivityConfig.baseLysisDelay / effectiveL);
											if (cell.lysisTimer <= 0) {
												cell.isEffectivelyGone = true;
												simState.lysedThisStep[cell.type]++;
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}

		const cellsToProcess = Array.from(newCellsWorkingCopy.values());
		cellsToProcess.sort((a, b) => {
			if (a.id < b.id) return -1;
			if (a.id > b.id) return 1;
			return 0;
		});

		// Snapshot for actions, using the working copy that has had cooldowns decremented and gone cells removed
		const currentCellsSnapshotForActions = new Map(newCellsWorkingCopy);

		// Attacker Firing Logic
		for (const attacker of cellsToProcess) {
			// ... (existing attacker firing logic, ensure it uses newCellsWorkingCopy for target lookups if needed, or currentCellsSnapshotForActions)
			// ... (it correctly uses currentCellsSnapshotForActions for target cell lookup, and newCellsWorkingCopy for direct modification if any. Barriers are not modified by receiveHit)

			if (attacker.type !== 'attacker' || attacker.isDead || attacker.isLysing || !isWithinHexBounds(attacker.q, attacker.r, currentGridRadius)) continue;

			// --- MODIFIED QUORUM SENSING CHECK ---
			const attackerKey = attacker.key;
			const qsConfig = simState.config.attacker.qs;
			const aiConcentration = simState.attackerAiGrid.get(attackerKey) || 0;

			let p_active_calculated; // Use a different variable name

			const K = qsConfig.midpoint;
			const n = qsConfig.cooperativity;

			if (K < 0) { // Special condition: K < 0 means always active
				p_active_calculated = 1.0;
			} else if (K === 0) {
				// If K is 0, active if any AI is present, otherwise inactive (avoids 0/0 NaN)
				p_active_calculated = (aiConcentration > 0) ? 1.0 : 0.0;
			} else {
				// Standard Hill function for K > 0
				const K_pow_n = Math.pow(K, n);
				const AI_pow_n = Math.pow(aiConcentration, n);
				if ((K_pow_n + AI_pow_n) === 0) { // Should only happen if K=0, AI=0, but K=0 is handled above. Safety.
					p_active_calculated = 0.0; 
				} else {
					p_active_calculated = AI_pow_n / (K_pow_n + AI_pow_n);
				}
			}

			// General safety check for NaN, though specific cases should be handled above.
			if (Number.isNaN(p_active_calculated)) {
				console.warn(`QS p_active became NaN. AI: ${aiConcentration}, K: ${K}, n: ${n}. Defaulting to 0 (inactive).`);
				p_active_calculated = 0.0;
			}

			// Check for QS activation and then for T6SS cooldown
			if (rng() < p_active_calculated) {
				// --- EXISTING FIRING LOGIC (now nested inside QS check) ---
				// Check if the individual T6SS is off cooldown
				
				if (attacker.t6ssFireCooldownTimer === 0) {
					// This new block uses a single, unified decision tree for all firing logic.

					let finalTarget = null;
					let shotCancelledByPenalty = false;
					
					// --- Step 1: Get all neighbors ---
					const neighborInfos = getNeighborInfos(attacker.q, attacker.r, currentCellsSnapshotForActions);

					// --- Step 2: Create an initial pool of potential targets by applying kin exclusion ---
					let potentialTargets = neighborInfos;
					const kinExclusionPenalty = simState.config.attacker.t6ss.kinExclusionPenalty;
					const performKinExclusion = rng() < simState.config.attacker.t6ss.kinExclusion;

					if (performKinExclusion) {
						if (kinExclusionPenalty === -1) {
							// "Smart Targeting": The pool of potential targets is pre-filtered to exclude kin.
							potentialTargets = neighborInfos.filter(n => !n.cell || n.cell.type !== 'attacker');
						}
						// If penalty is >= 0, we don't pre-filter. We check for kin after selecting a target.
					}

					// --- Step 3: From the potential pool, choose a target based on Contact Sensing Bias ---
					const useContactStrategy = rng() < simState.config.attacker.t6ss.contactSensingBias;
					
					if (useContactStrategy) {
						// Strategy is to target a contact. Filter the current pool for contacts.
						const contactableTargets = potentialTargets.filter(n => n.cell && !n.cell.isEffectivelyGone);
						if (contactableTargets.length > 0) {
							finalTarget = contactableTargets[Math.floor(rng() * contactableTargets.length)];
						}
						// If no contacts are in the pool, finalTarget remains null and the shot is aborted.
					} else {
						// Strategy is to fire randomly from the pool of potential targets.
						if (potentialTargets.length > 0) {
							finalTarget = potentialTargets[Math.floor(rng() * potentialTargets.length)];
						}
					}

					// --- Step 4: Apply post-selection kin exclusion for the "Cancel & Penalize" mode ---
					if (finalTarget && performKinExclusion && kinExclusionPenalty >= 0) {
						if (finalTarget.cell && finalTarget.cell.type === 'attacker') {
							shotCancelledByPenalty = true;
							if (kinExclusionPenalty > 0) {
								attacker.t6ssFireCooldownTimer = kinExclusionPenalty;
							}
						}
					}

					// --- Step 5: Execute the final firing action ---
					if (finalTarget && !shotCancelledByPenalty) {
						attacker.resetT6SSFireCooldown();
						simState.firingsThisStep++;
						const isPreciseHit = rng() < simState.config.attacker.t6ss.precision;
						
						simState.activeFiringsThisStep.set(attacker.id, {
							directionIndex: finalTarget.directionIndex,
							isPrecise: isPreciseHit
						});

						if (isPreciseHit) {
							const targetCell = finalTarget.cell;
							if (targetCell && !targetCell.isEffectivelyGone) {
								const targetCellInWorkingCopy = newCellsWorkingCopy.get(targetCell.key);
								if (targetCellInWorkingCopy && (targetCellInWorkingCopy.type === 'prey' || targetCellInWorkingCopy.type === 'defender' || targetCellInWorkingCopy.type === 'barrier')) {
									targetCellInWorkingCopy.receiveHit(attacker);
								}
							}
						}
					} else if (shotCancelledByPenalty) {
						// If cancelled by penalty, reset standard cooldown only if penalty is 0.
						if (kinExclusionPenalty === 0) {
							attacker.resetT6SSFireCooldown();
						}
					} else {
						// If no target was ever selected (e.g., 100% bias with no contacts), reset cooldown to allow another try.
						attacker.resetT6SSFireCooldown();
					}
				}				// If chosenDirectionInfo is null (e.g. smart targeting surrounded by kin), do nothing. The cell keeps its 0 cooldown and can try again next step.
			} // End of QS check
		};

		// Defender Sensing & Retaliation Setup (same as before, operates on newCellsWorkingCopy)
		for (const defender of cellsToProcess) {
			// ... (existing defender sensing logic) ...
			if (defender.type !== 'defender' || defender.isDead || defender.isLysing) continue;
			if (defender.sensedAttackFromKey && !defender.isRetaliating) {
				if (rng() < simState.config.defender.retaliation.senseChance) {
					defender.isRetaliating = true; defender.retaliationTargetKey = defender.sensedAttackFromKey;
					defender.currentMaxRetaliationsForBurst = getRandomIntInRange(1, simState.config.defender.retaliation.maxRetaliations);
					defender.retaliationsRemainingThisBurst = defender.currentMaxRetaliationsForBurst;
				}
				defender.sensedAttackFromKey = null;
			}
		};

		// Defender Firing (Retaliation and Random) (same as before, uses currentCellsSnapshotForActions for target lookup, newCellsWorkingCopy for modification)
		for (const defender of cellsToProcess) {
			// ... (existing defender firing logic) ...
			if (defender.type !== 'defender' || defender.isDead || defender.isLysing || !isWithinHexBounds(defender.q, defender.r, currentGridRadius)) continue;
			if (defender.isRetaliating && defender.retaliationsRemainingThisBurst > 0) {
				const targetCoords = defender.attemptRetaliationFire();
				if (targetCoords) {
					simState.firingsThisStep++;
					// Calculate directionIndex from the defender's current position to the target
					const deltaQ_retaliation = targetCoords.q - defender.q; // defender.q, .r are from currentCellsSnapshotForActions
					const deltaR_retaliation = targetCoords.r - defender.r;
					const retaliationDirectionIndex = getDirectionIndex(deltaQ_retaliation, deltaR_retaliation);
					if (retaliationDirectionIndex !== -1) {
						simState.activeFiringsThisStep.set(defender.id, { // Use defender's unique ID
							directionIndex: retaliationDirectionIndex,
							isPrecise: true // Retaliation is precise towards the target hex
						});
					}
					const targetCellKey = `${targetCoords.q},${targetCoords.r}`;
					const targetedCellFromSnapshot = currentCellsSnapshotForActions.get(targetCellKey); // Check target from snapshot
					if (targetedCellFromSnapshot && !targetedCellFromSnapshot.isEffectivelyGone && isWithinHexBounds(targetCoords.q, targetCoords.r, currentGridRadius)) {
						// Barriers will have targetedCell.type === 'barrier', receiveHit will do nothing.
						const targetCellInWorkingCopy = newCellsWorkingCopy.get(targetCellKey); // Get the actual cell to modify
						if (targetCellInWorkingCopy && (targetCellInWorkingCopy.type === 'attacker' || targetCellInWorkingCopy.type === 'prey' || targetCellInWorkingCopy.type === 'barrier')) {
							targetCellInWorkingCopy.receiveHit(defender);
						} else if (targetCellInWorkingCopy && targetCellInWorkingCopy.type === 'defender' && targetCellInWorkingCopy.id !== defender.id) {
							targetCellInWorkingCopy.receiveHit(defender);
						}
					}
				}
			}
			if (!defender.isRetaliating || defender.retaliationsRemainingThisBurst === 0) {
			   const randomFireTarget = defender.attemptDefenderRandomFire();
				if (randomFireTarget) {
					simState.firingsThisStep++;
					// Use defender's unique ID as the key
					simState.activeFiringsThisStep.set(defender.id, { 
						directionIndex: randomFireTarget.directionIndex, 
						isPrecise: true 
					});
					const targetKey = `${randomFireTarget.q},${randomFireTarget.r}`;
					const potentialTargetCellFromSnapshot = currentCellsSnapshotForActions.get(targetKey); // Check target from snapshot
					if (potentialTargetCellFromSnapshot && isWithinHexBounds(randomFireTarget.q, randomFireTarget.r, currentGridRadius) && !potentialTargetCellFromSnapshot.isEffectivelyGone) {
						// Barriers will have potentialTargetCell.type === 'barrier', receiveHit will do nothing.
						const targetCellInWorkingCopy = newCellsWorkingCopy.get(targetKey); // Get the actual cell to modify
						if (targetCellInWorkingCopy && (targetCellInWorkingCopy.type === 'prey' || targetCellInWorkingCopy.type === 'attacker' || targetCellInWorkingCopy.type === 'barrier')) {
							targetCellInWorkingCopy.receiveHit(defender);
						} else if (targetCellInWorkingCopy && targetCellInWorkingCopy.type === 'defender' && targetCellInWorkingCopy.id !== defender.id) {
							targetCellInWorkingCopy.receiveHit(defender);
						}
					}
				}
			}
		};

		// Replication Logic (same as before, operates on newCellsWorkingCopy)
		const pendingReplications = [];
		for (const cell of cellsToProcess) {
			if (cell.type === 'barrier' || !isWithinHexBounds(cell.q, cell.r, currentGridRadius) || cell.isEffectivelyGone) continue;
			
			if (cell.canReplicate()) {
				const key = cell.key;
				const cachedNeighbors = neighborCache.get(key);
				const emptyNeighbors = [];

				if (cachedNeighbors) {
					const len = cachedNeighbors.length;
					for (let i = 0; i < len; i++) {
						const n = cachedNeighbors[i];
						const neighborCell = newCellsWorkingCopy.get(n.key);
						if (n.isValid && (!neighborCell || neighborCell.isEffectivelyGone)) {
							emptyNeighbors.push({ q: n.q, r: n.r });
						}
					}
				} else {
					// Fallback if cache is missed
					const neighborInfos = getNeighborInfos(cell.q, cell.r, newCellsWorkingCopy);
					const len = neighborInfos.length;
					for (let i = 0; i < len; i++) {
						const n = neighborInfos[i];
						if (isWithinHexBounds(n.q, n.r, currentGridRadius) && (!n.cell || n.cell.isEffectivelyGone)) {
							emptyNeighbors.push({ q: n.q, r: n.r });
						}
					}
				}

				if (emptyNeighbors.length > 0) {
					const spot = emptyNeighbors[Math.floor(rng() * emptyNeighbors.length)];
					pendingReplications.push({ parentOriginalKey: key, parentType: cell.type, spot: spot });
				} else {
					cell.resetReplicationCooldown();
				}
			}
		}

		seededShuffle(pendingReplications, rng);

		for (const rep of pendingReplications) {
			const spotKey = `${rep.spot.q},${rep.spot.r}`;
			if (isWithinHexBounds(rep.spot.q, rep.spot.r, currentGridRadius) && !newCellsWorkingCopy.has(spotKey)) { // Check against working copy
				const daughter = new Cell(rep.spot.q, rep.spot.r, rep.parentType, `${rep.parentType}-${simState.nextCellId++}`);
				const parentCell = newCellsWorkingCopy.get(rep.parentOriginalKey);
				if (parentCell) {
					parentCell.resetReplicationCooldown();
					if (parentCell.type === 'prey') {
						if (simState.config.prey.toxinAttackerTriggered) {
							// If activated by attacker NL toxins, the daughter starts as a non-producer since it inherits 0 attacker toxins
							daughter.isPreyToxinProducer = false;
						} else {
							daughter.isPreyToxinProducer = parentCell.isPreyToxinProducer;
						}
						if (daughter.isPreyToxinProducer && simState.config.prey.releaseOnLysis) {
							if (daughter.preyToxinLysisThreshold === null) {
								const minThresh = simState.config.prey.lysisThresholdMin || 200;
								const maxThresh = simState.config.prey.lysisThresholdMax || 1000;
								daughter.preyToxinLysisThreshold = getRandomIntInRange(minThresh, maxThresh);
							}
						}
						// Halve the toxins: parent and daughter inherit half each, rounded down to integer
						const halfNL = Math.floor((parentCell.internalPreyToxinNL || 0) / 2);
						const halfL = Math.floor((parentCell.internalPreyToxinL || 0) / 2);
						parentCell.internalPreyToxinNL = halfNL;
						parentCell.internalPreyToxinL = halfL;
						daughter.internalPreyToxinNL = halfNL;
						daughter.internalPreyToxinL = halfL;
					}
				}
				newCellsWorkingCopy.set(spotKey, daughter); // Add to working copy
			} else {
				const parentCell = newCellsWorkingCopy.get(rep.parentOriginalKey);
				if (parentCell && parentCell.replicationCooldown === 0) parentCell.resetReplicationCooldown();
			}
		}

		// Movement Logic
		const pendingMovements = [];

		for (const cell of cellsToProcess) {
			if (cell.type === 'barrier' || !isWithinHexBounds(cell.q, cell.r, currentGridRadius) || cell.isEffectivelyGone) continue;

			if (cell.canMove()) {
				const key = cell.key;
				const cellToModifyInWorkingCopy = newCellsWorkingCopy.get(key);
				if (!cellToModifyInWorkingCopy) continue;

				let moveConfig;
				if (cell.type === 'attacker') moveConfig = simState.config.attacker.movement;
				else if (cell.type === 'prey') moveConfig = simState.config.prey.movement;
				else if (cell.type === 'defender') moveConfig = simState.config.defender.movement;

				// Check probability of attempting a move
				if (rng() < moveConfig.probability) {
					let targetSpot = null;
					const cachedNeighbors = neighborCache.get(key);
					const allNeighbors = [];
					const emptyNeighbors = [];

					if (cachedNeighbors) {
						const len = cachedNeighbors.length;
						for (let i = 0; i < len; i++) {
							const n = cachedNeighbors[i];
							const neighborCell = newCellsWorkingCopy.get(n.key);
							const nInfo = {
								q: n.q,
								r: n.r,
								cell: neighborCell,
								direction: n.direction,
								directionIndex: n.directionIndex
							};
							allNeighbors.push(nInfo);
							if (n.isValid && (!neighborCell || neighborCell.isEffectivelyGone)) {
								emptyNeighbors.push({ q: n.q, r: n.r });
							}
						}
					} else {
						// Fallback if cache is missed
						const neighborInfos = getNeighborInfos(cell.q, cell.r, newCellsWorkingCopy);
						const len = neighborInfos.length;
						for (let i = 0; i < len; i++) {
							const n = neighborInfos[i];
							allNeighbors.push(n);
							if (isWithinHexBounds(n.q, n.r, currentGridRadius) && (!n.cell || n.cell.isEffectivelyGone)) {
								emptyNeighbors.push({ q: n.q, r: n.r });
							}
						}
					}

					// Decide target based on directionality
					if (rng() < moveConfig.directionality) {
						// Prefer empty spot
						if (emptyNeighbors.length > 0) {
							if (cell.type === 'attacker' && moveConfig.preyAiAttraction > 0 && rng() < moveConfig.preyAiAttraction) {
								let bestSpotsAboveThreshold = [];
								let maxPreyAIAboveThreshold = -1;
								const attractionThreshold = moveConfig.preyAiAttractionThreshold;

								for (const emptyNeighbor of emptyNeighbors) {
									const neighborKey = `${emptyNeighbor.q},${emptyNeighbor.r}`;
									const preyAI = simState.preyAiGrid.get(neighborKey) || 0;

									if (preyAI >= attractionThreshold) {
										if (preyAI > maxPreyAIAboveThreshold) {
											maxPreyAIAboveThreshold = preyAI;
											bestSpotsAboveThreshold = [emptyNeighbor];
										} else if (preyAI === maxPreyAIAboveThreshold) {
											bestSpotsAboveThreshold.push(emptyNeighbor);
										}
									}
								}
								targetSpot = bestSpotsAboveThreshold.length > 0 ? 
									bestSpotsAboveThreshold[Math.floor(rng() * bestSpotsAboveThreshold.length)] :
									emptyNeighbors[Math.floor(rng() * emptyNeighbors.length)];
							} else {
								targetSpot = emptyNeighbors[Math.floor(rng() * emptyNeighbors.length)];
							}
						}
					} else {
						const randomNeighborInfo = allNeighbors[Math.floor(rng() * allNeighbors.length)];
						if (!randomNeighborInfo.cell || randomNeighborInfo.cell.isEffectivelyGone) {
							targetSpot = { q: randomNeighborInfo.q, r: randomNeighborInfo.r };
						}
					}

					if (targetSpot && isWithinHexBounds(targetSpot.q, targetSpot.r, currentGridRadius)) {
						pendingMovements.push({
							fromKey: key,
							toQ: targetSpot.q,
							toR: targetSpot.r,
							cell: cellToModifyInWorkingCopy
						});
					}
					cellToModifyInWorkingCopy.resetMovementCooldown();
				} else {
					cellToModifyInWorkingCopy.resetMovementCooldown();
				}
			}
		}

		// Process pending movements, shuffling to handle conflicts randomly
		seededShuffle(pendingMovements, rng);
		const occupiedThisStep = new Set();
		for (const move of pendingMovements) {
			const toKey = `${move.toQ},${move.toR}`;
			// Check if the target spot is free in the working copy AND hasn't been taken by another move in this same step
			if (!newCellsWorkingCopy.has(toKey) && !occupiedThisStep.has(toKey)) {
				// Perform the move
				newCellsWorkingCopy.delete(move.fromKey); // Remove from old position
				move.cell.q = move.toQ;
				move.cell.r = move.toR;
				move.cell.key = toKey;
				newCellsWorkingCopy.set(toKey, move.cell); // Place in new position
				occupiedThisStep.add(toKey); // Mark spot as taken for this step's movements
			}
		}

		newCellsWorkingCopy.forEach((cell, key) => {
			// 1. Check if the capsule system is enabled at all
			if (!simState.config.prey.capsule.isEnabled) return;

			if (cell.type === 'prey' && !cell.isDead && !cell.isLysing && cell.capsuleLayers < 5 && !cell.isFormingCapsule) {
				const capsuleConfig = simState.config.prey.capsule;
				const preyAiConcentration = simState.preyAiGrid.get(key) || 0;
				let p_synthesis = 0.0;

				const K = capsuleConfig.midpoint;
				const n = capsuleConfig.cooperativity;

				// 2. Logic now identical to T6SS activation
				if (K < 0) {
					p_synthesis = 1.0; // ALWAYS ON
				} else if (K === 0) {
					p_synthesis = (preyAiConcentration > 0) ? 1.0 : 0.0; // ON if AI > 0
				} else {
					// Standard Hill function
					const K_pow_n = Math.pow(K, n);
					const AI_pow_n = Math.pow(preyAiConcentration, n);
					if ((K_pow_n + AI_pow_n) > 0) {
						p_synthesis = AI_pow_n / (K_pow_n + AI_pow_n);
					}
				}
				
				if (Number.isNaN(p_synthesis)) p_synthesis = 0.0;
				
				if (rng() < p_synthesis) {
					cell.isFormingCapsule = true;
					cell.capsuleCooldown = getRandomIntInRange(
						capsuleConfig.cooldownMin,
						capsuleConfig.cooldownMax
					);
				}
			}
		});

		simState.cells = newCellsWorkingCopy; // Finalize changes to the main cells Map


				// 1. AI & Toxin Production (for Attacker and Prey)
				newCellsWorkingCopy.forEach((cell, key) => {
					// Attacker AI Production
					if (cell.type === 'attacker' && !cell.isDead && !cell.isLysing) {
						const currentAI = simState.attackerAiGrid.get(key) || 0;
						simState.attackerAiGrid.set(key, currentAI + simState.config.attacker.qs.productionRate);
					}
					// Prey AI Production
					if (cell.type === 'prey' && !cell.isDead && !cell.isLysing) {
						const currentPreyAI = simState.preyAiGrid.get(key) || 0;
						simState.preyAiGrid.set(key, currentPreyAI + simState.config.prey.qs.productionRate);
					}
					// Prey Toxin Production
					if (cell.type === 'prey' && !cell.isDead && !cell.isLysing) {
						const triggerMode = simState.config.prey.triggerMode;
						const releaseOnLysis = simState.config.prey.releaseOnLysis;

						if (releaseOnLysis) {
							// Lysis Release Mode (permanent transition once activated)
							if (!cell.isPreyToxinProducer) {
								let startProduction = false;
								if (triggerMode === 'qs') {
									const qsConfig = simState.config.prey.toxinQS;
									const preyAiConcentration = simState.preyAiGrid.get(key) || 0;
									const K = qsConfig.midpoint;
									const n = qsConfig.cooperativity;
									let p_synthesis = 0.0;
									
									if (K < 0) {
										p_synthesis = 1.0;
									} else if (K === 0) {
										p_synthesis = (preyAiConcentration > 0) ? 1.0 : 0.0;
									} else {
										const K_pow_n = Math.pow(K, n);
										const AI_pow_n = Math.pow(preyAiConcentration, n);
										if ((K_pow_n + AI_pow_n) > 0) {
											p_synthesis = AI_pow_n / (K_pow_n + AI_pow_n);
										}
									}
									if (Number.isNaN(p_synthesis)) p_synthesis = 0.0;

									const probability = p_synthesis * (simState.config.prey.startProbability || 0.0);
									if (probability > 0 && rng() < probability) {
										startProduction = true;
									}
								} else if (triggerMode === 'attacker') {
									const initThreshold = simState.config.prey.toxinInitiationThreshold !== undefined ? simState.config.prey.toxinInitiationThreshold : 2;
									if ((cell.accumulatedNonLyticToxins || 0) >= initThreshold) {
										const probability = simState.config.prey.startProbability || 0.0;
										if (probability > 0 && rng() < probability) {
											startProduction = true;
										}
									}
								} else {
									// Standard mode
									const startProb = simState.config.prey.startProbability || 0.0;
									if (startProb > 0 && rng() < startProb) {
										startProduction = true;
									}
								}

								if (startProduction) {
									cell.isPreyToxinProducer = true;
									if (cell.preyToxinLysisThreshold === null) {
										const minThresh = simState.config.prey.lysisThresholdMin || 200;
										const maxThresh = simState.config.prey.lysisThresholdMax || 1000;
										cell.preyToxinLysisThreshold = getRandomIntInRange(minThresh, maxThresh);
									}
								}
							}

							// Lysis mode production execution
							if (cell.isPreyToxinProducer) {
								const prodNL = simState.config.prey.toxinNL.productionRate || 0;
								const prodL = simState.config.prey.toxinL.productionRate || 0;
								cell.internalPreyToxinNL += prodNL;
								cell.internalPreyToxinL += prodL;

								const totalInternal = cell.internalPreyToxinNL + cell.internalPreyToxinL;
								const thresh = cell.preyToxinLysisThreshold || 1000;
								if (totalInternal >= thresh) {
									cell.isDead = true;
									cell.isLysing = true;
									cell.lysisTimer = 10;
									simState.killedThisStep.prey++;
								}
							}
						} else {
							// Normal Secretion Mode (continuous release with stochastic activation & max production range limit)
							if (!cell.isPreyToxinProducer) {
								let startProduction = false;
								if (triggerMode === 'qs') {
									const qsConfig = simState.config.prey.toxinQS;
									const preyAiConcentration = simState.preyAiGrid.get(key) || 0;
									const K = qsConfig.midpoint;
									const n = qsConfig.cooperativity;
									let p_synthesis = 0.0;
									
									if (K < 0) {
										p_synthesis = 1.0;
									} else if (K === 0) {
										p_synthesis = (preyAiConcentration > 0) ? 1.0 : 0.0;
									} else {
										const K_pow_n = Math.pow(K, n);
										const AI_pow_n = Math.pow(preyAiConcentration, n);
										if ((K_pow_n + AI_pow_n) > 0) {
											p_synthesis = AI_pow_n / (K_pow_n + AI_pow_n);
										}
									}
									if (Number.isNaN(p_synthesis)) p_synthesis = 0.0;

									const probability = p_synthesis * (simState.config.prey.startProbability || 0.0);
									if (probability > 0 && rng() < probability) {
										startProduction = true;
									}
								} else if (triggerMode === 'attacker') {
									const initThreshold = simState.config.prey.toxinInitiationThreshold !== undefined ? simState.config.prey.toxinInitiationThreshold : 2;
									if ((cell.accumulatedNonLyticToxins || 0) >= initThreshold) {
										const probability = simState.config.prey.startProbability || 0.0;
										if (probability > 0 && rng() < probability) {
											startProduction = true;
										}
									}
								} else {
									// Standard mode
									const startProb = simState.config.prey.startProbability || 0.0;
									if (startProb > 0 && rng() < startProb) {
										startProduction = true;
									}
								}

								if (startProduction) {
									cell.isPreyToxinProducer = true;
									cell.continuousToxinProduced = 0;
									const minThresh = simState.config.prey.lysisThresholdMin || 200;
									const maxThresh = simState.config.prey.lysisThresholdMax || 1000;
									cell.preyToxinLysisThreshold = getRandomIntInRange(minThresh, maxThresh);
								}
							}

							// Normal secretion mode production execution
							if (cell.isPreyToxinProducer) {
								const prodNL = simState.config.prey.toxinNL.productionRate || 0;
								const prodL = simState.config.prey.toxinL.productionRate || 0;

								// Release continuously
								const currentPreyNL = simState.preyToxinNLGrid.get(key) || 0;
								simState.preyToxinNLGrid.set(key, currentPreyNL + prodNL);

								const currentPreyL = simState.preyToxinLGrid.get(key) || 0;
								simState.preyToxinLGrid.set(key, currentPreyL + prodL);

								// Accumulate to track continuous production progress
								cell.continuousToxinProduced = (cell.continuousToxinProduced || 0) + (prodNL + prodL);

								const thresh = cell.preyToxinLysisThreshold || 1000;
								if (cell.continuousToxinProduced >= thresh) {
									// Reach max production limit: stop producing and go back to normal growth
									cell.isPreyToxinProducer = false;
									cell.preyToxinLysisThreshold = null;
									cell.continuousToxinProduced = 0;
								}
							}
						}
					}
				});

				// 2. AI & Toxin Diffusion & Degradation
				simState.attackerAiGrid = updateAiGrid(simState.attackerAiGrid, simState.config.attacker.qs, newCellsWorkingCopy, currentGridRadius);
				simState.preyAiGrid = updateAiGrid(simState.preyAiGrid, simState.config.prey.qs, newCellsWorkingCopy, currentGridRadius);
				simState.preyToxinNLGrid = updateAiGrid(simState.preyToxinNLGrid, simState.config.prey.toxinNL, newCellsWorkingCopy, currentGridRadius, true);
				simState.preyToxinLGrid = updateAiGrid(simState.preyToxinLGrid, simState.config.prey.toxinL, newCellsWorkingCopy, currentGridRadius, true);

		// Update Cumulative Stats (based on what happened in *this* step's calculations)
		simState.cumulativeFirings += simState.firingsThisStep;
		simState.cumulativeKills.attacker += simState.killedThisStep.attacker;
		simState.cumulativeKills.prey += simState.killedThisStep.prey;
		simState.cumulativeKills.defender += simState.killedThisStep.defender;
		simState.cumulativeLyses.attacker += simState.lysedThisStep.attacker;
		simState.cumulativeLyses.prey += simState.lysedThisStep.prey;
		simState.cumulativeLyses.defender += simState.lysedThisStep.defender;

		// Update CPRG (based on lysis from *this* step's calculations and previous LacZ)
		// Note: totalActiveLacZReleased was updated in cell.decrementCooldowns if lysis occurred.
		if (simState.config.prey.lacZPerPrey > 0 && simState.totalActiveLacZReleased > 0 && simState.remainingCPRGSubstrate > 0) {
			const Vmax_current = simState.config.cprg.k_cat * simState.totalActiveLacZReleased;
			let convertedThisStep = 0;
			if (simState.config.cprg.Km + simState.remainingCPRGSubstrate > 0) {
				convertedThisStep = (Vmax_current * simState.remainingCPRGSubstrate) / (simState.config.cprg.Km + simState.remainingCPRGSubstrate);
			}
			convertedThisStep = Math.min(convertedThisStep, simState.remainingCPRGSubstrate);
			simState.totalCPRGConverted += convertedThisStep;
			simState.remainingCPRGSubstrate -= convertedThisStep;
		}

		// --- Advance Time for Next Iteration ---
		simState.simulationStepCount++;

		// --- Check for Mid-Simulation Data Batching (Offload to IndexedDB silently) ---
		const historyLimitBytes = (simState.config.history.sizeLimitMB || 0) * 1024 * 1024;
		if (simState.config.historyEnabled && historyLimitBytes > 0 && simState.capturedHistoryTotalSize >= historyLimitBytes) {
			await offloadHistoryToDB();
		}

		const imageLimitBytes = (simState.config.exports.sizeThresholdForZip || 0) * 1024 * 1024;
		if (simState.saveImagesEnabled && imageLimitBytes > 0 && simState.capturedImagesTotalSize >= imageLimitBytes) {
			await offloadImagesToDB();
		}

		const arenaStateLimitBytes = (simState.config.arenaStateBuffer.sizeLimitMB || 0) * 1024 * 1024;
		if (simState.saveArenaStatesEnabled && arenaStateLimitBytes > 0 && simState.capturedArenaStatesTSVTotalSize >= arenaStateLimitBytes) {
			await offloadArenaStatesToDB();
		}
		
		// --- Schedule Next Step ---
		if (simState.isRunning) {
            const delayForNextStep = isThisFrameRendered ? simState.config.simulationControl.simulationSpeedMs : 0;
            simState.timeoutId = setTimeout(runSimulationStep, delayForNextStep);
		}

		if(simState.isStepping) { // If stepping, allow UI to update for next step button press
			simState.isStepping = false;
			updateButtonStatesAndUI();
		}

	} catch (e) {
		console.error("Critical error in runSimulationStep:", e);
		simState.isRunning = false; simState.isStepping = false; clearTimeout(simState.timeoutId);
		updateButtonStatesAndUI();
		simulationErrorDisplay.textContent = `SIMULATION ERROR: ${e.message}. Check console.`;
		simulationErrorDisplay.classList.remove('hidden');
		showEndOfSimulationReport(`Error: ${e.message}`);
		return;
	}
}

	function updateImportSessionProgress(percentage, textStatus = null) {
		const container = document.getElementById('importSessionProgressContainer');
		const bar = document.getElementById('importSessionProgressBar');
		const statusDiv = document.getElementById('importSessionStatusMessage');
		
		if (container && bar) {
			if (percentage === null) {
				container.classList.add('hidden');
			} else {
				container.classList.remove('hidden');
				bar.style.width = `${percentage}%`;
			}
		}
		if (statusDiv) {
			if (textStatus === null) {
				statusDiv.classList.add('hidden');
				statusDiv.textContent = '';
			} else {
				statusDiv.classList.remove('hidden');
				statusDiv.textContent = textStatus;
			}
		}
	}

	function updateRenderHistoryProgress(percentage, textStatus = null) {
		const container = document.getElementById('renderHistoryProgressContainer');
		const bar = document.getElementById('renderHistoryProgressBar');
		const statusDiv = document.getElementById('renderHistoryStatusMessage');
		
		if (container && bar) {
			if (percentage === null) {
				container.classList.add('hidden');
			} else {
				container.classList.remove('hidden');
				bar.style.width = `${percentage}%`;
			}
		}
		if (statusDiv) {
			if (textStatus === null) {
				statusDiv.classList.add('hidden');
				statusDiv.textContent = '';
			} else {
				statusDiv.classList.remove('hidden');
				statusDiv.textContent = textStatus;
			}
		}
	}

	function updateRenderRangeInputs(forceReset = false) {
		const fromInput = document.getElementById('renderFromStepInput');
		const toInput = document.getElementById('renderToStepInput');
		if (!fromInput || !toInput) return;

		if (simState.optimizedHistoryFrames.size === 0) {
			fromInput.value = 1;
			toInput.value = 1;
			fromInput.min = 1;
			toInput.min = 1;
			fromInput.max = 1;
			toInput.max = 1;
			return;
		}

		const steps = [...simState.optimizedHistoryFrames.keys()].sort((a, b) => a - b);
		const minStep = steps[0];
		const maxStep = steps[steps.length - 1];

		const oldMin = parseInt(fromInput.min, 10) || 1;
		const oldMax = parseInt(fromInput.max, 10) || 1;

		fromInput.min = minStep;
		fromInput.max = maxStep;
		toInput.min = minStep;
		toInput.max = maxStep;

		const currentFrom = parseInt(fromInput.value, 10);
		const currentTo = parseInt(toInput.value, 10);

		if (forceReset || isNaN(currentFrom) || currentFrom < minStep || currentFrom > maxStep || currentFrom === oldMin) {
			fromInput.value = minStep;
		}
		if (forceReset || isNaN(currentTo) || currentTo < minStep || currentTo > maxStep || currentTo === oldMax) {
			toInput.value = maxStep;
		}
	}

	function captureArenaImageForState(stateObject, step, returnOnly = false) {
		const exportWidth = simState.imageExportResolution.width;
		const exportHeight = simState.imageExportResolution.height;
		const sizing = setupCanvasAndHexSize(exportWidth, exportHeight, simState.config.hexGridActualRadius);

		const offscreenCanvas = document.createElement('canvas');
		offscreenCanvas.width = sizing.actualCanvasWidth;
		offscreenCanvas.height = sizing.actualCanvasHeight;
		const offscreenCtx = offscreenCanvas.getContext('2d');

		let cprgBgColor = DEFAULT_CANVAS_BG_COLOR;
		if (simState.config.cprg.initialSubstrate > 0 && stateObject.totalCPRGConverted !== undefined) {
			const cprgRatio = Math.min(1, stateObject.totalCPRGConverted / simState.config.cprg.initialSubstrate);
			const r_val = Math.round(255 + (255 - 255) * cprgRatio);
			const g_val = Math.round(255 + (0 - 255) * cprgRatio);
			const b_val = Math.round(255 + (255 - 255) * cprgRatio);
			cprgBgColor = `rgb(${r_val}, ${g_val}, ${b_val})`;
		}
		drawArenaOnContext(offscreenCtx,
			sizing.actualCanvasWidth, 
			sizing.actualCanvasHeight, 
			stateObject.cells,
			stateObject.activeFiringsThisStep,
			stateObject.preyAiGrid,
			stateObject.preyToxinNLGrid,
			stateObject.preyToxinLGrid,
			simState.config.hexGridActualRadius,
			sizing.visualHexRadius,
			sizing.calculatedOffsetX,
			sizing.calculatedOffsetY,
			cprgBgColor
		);
		
		const finalCanvas = document.createElement('canvas');
		finalCanvas.width = exportWidth;
		finalCanvas.height = exportHeight;
		const finalCtx = finalCanvas.getContext('2d');
		finalCtx.fillStyle = cprgBgColor; 
		finalCtx.fillRect(0, 0, exportWidth, exportHeight);
		
		const scale = Math.min(exportWidth / sizing.actualCanvasWidth, exportHeight / sizing.actualCanvasHeight);
		const drawWidth = sizing.actualCanvasWidth * scale;
		const drawHeight = sizing.actualCanvasHeight * scale;
		const drawX = (exportWidth - drawWidth) / 2;
		const drawY = (exportHeight - drawHeight) / 2;

		finalCtx.drawImage(offscreenCanvas, 0, 0, sizing.actualCanvasWidth, sizing.actualCanvasHeight, drawX, drawY, drawWidth, drawHeight);

		const dataURL = finalCanvas.toDataURL('image/png');
		
		if (returnOnly) {
			return dataURL;
		}

		simState.capturedImagesDataURLs.push({ step: step, dataURL, isOffloaded: false });
		simState.capturedImagesTotalSize += dataURL.length;
	}

	async function renderImagesFromHistory() {
		if (simState.optimizedHistoryFrames.size === 0) {
			await showInfoAlert("No history available to render images from.", "No History");
			return;
		}

		// Read inputs and validate range
		let fromStep = 1;
		let toStep = 1;
		if (renderFromStepInput && renderToStepInput) {
			fromStep = parseInt(renderFromStepInput.value, 10);
			toStep = parseInt(renderToStepInput.value, 10);
		}

		const steps = [...simState.optimizedHistoryFrames.keys()].sort((a, b) => a - b);
		const minStep = steps[0];
		const maxStep = steps[steps.length - 1];

		if (isNaN(fromStep) || fromStep < minStep) fromStep = minStep;
		if (isNaN(toStep) || toStep > maxStep) toStep = maxStep;

		if (fromStep > toStep) {
			await showInfoAlert("From step cannot be greater than To step.", "Invalid Range");
			return;
		}

		let renderRate = 1;
		if (renderRateStepInput) {
			renderRate = parseInt(renderRateStepInput.value, 10);
			if (isNaN(renderRate) || renderRate < 1) renderRate = 1;
		}

		let filteredSteps = steps.filter(s => s >= fromStep && s <= toStep);
		
		if (renderRate > 1 && filteredSteps.length > 0) {
			const resultSteps = [];
			const lastStep = filteredSteps[filteredSteps.length - 1];
			
			for (let i = 0; i < filteredSteps.length; i += renderRate) {
				resultSteps.push(filteredSteps[i]);
			}
			
			if (resultSteps.length > 0 && resultSteps[resultSteps.length - 1] !== lastStep) {
				resultSteps.push(lastStep);
			}
			filteredSteps = resultSteps;
		}

		const totalSteps = filteredSteps.length;
		if (totalSteps === 0) {
			await showInfoAlert("No history frames found in the specified range.", "Invalid Range");
			return;
		}

		// Try to get directory handle first to avoid losing user gesture
		let handle = null;
		if ('showDirectoryPicker' in window) {
			handle = await getDirectoryHandle();
			if (!handle) {
				console.log("No directory handle selected, falling back to normal browser downloads.");
			}
		}

		simState.isRenderingFromHistory = true;
		simState.renderCancelled = false;

		if (cancelRenderButton) {
			cancelRenderButton.disabled = false;
			cancelRenderButton.textContent = "Stop & Save Rendered";
		}

		updateButtonStatesAndUI();
		updateConfigFromUI(true); // Read latest UI settings (size, limits)

		try {
			updateRenderHistoryProgress(0, `Starting render of ${totalSteps} steps...`);

			let currentZip = new JSZip();
			let currentZipSize = 0;
			let zipIndex = 1;
			let firstStepInZip = null;
			let lastStepInZip = null;
			const chunkLimitBytes = (simState.config.exports.sizeThresholdForZip || 100) * 1024 * 1024;
			let actuallySavedSomething = false;

			for (let i = 0; i < totalSteps; i++) {
				if (simState.renderCancelled) {
					console.log("Rendering cancelled by user.");
					break;
				}

				const stepIndex = filteredSteps[i];
				
				// Get history frame
				const optimizedState = await getHistoryFrame(stepIndex);
				if (!optimizedState) continue;

				// Rehydrate
				const rehydratedState = rehydrateOptimizedStep(optimizedState);

				// Capture image from rehydrated state (bypassing RAM array and DB)
				const dataURL = captureArenaImageForState(rehydratedState, stepIndex, true);
				
				if (firstStepInZip === null) firstStepInZip = stepIndex;
				lastStepInZip = stepIndex;

				const base64Data = dataURL.substring(dataURL.indexOf(',') + 1);
				currentZip.file(`image_${String(stepIndex).padStart(5, '0')}.png`, base64Data, { base64: true });
				currentZipSize += dataURL.length;
				actuallySavedSomething = true;

				const percent = Math.round(((i + 1) / totalSteps) * 100);

				if (currentZipSize >= chunkLimitBytes || i === totalSteps - 1) {
					updateRenderHistoryProgress(percent, `Saving ZIP part ${zipIndex}...`);
					const content = await currentZip.generateAsync({ type: "blob", compression: "STORE" });
					const fileName = `${simState.runTimestamp || generateTimestamp()}_images_steps_${String(firstStepInZip).padStart(5, '0')}_to_${String(lastStepInZip).padStart(5, '0')}_part${zipIndex}.zip`;
					
					await saveFile(content, fileName, { preApprovedHandle: handle });
					
					currentZip = new JSZip();
					currentZipSize = 0;
					firstStepInZip = null;
					zipIndex++;
				}

				// Update progress and yield
				updateRenderHistoryProgress(percent, `Rendering step ${stepIndex} (${i + 1}/${totalSteps})...`);
				await new Promise(resolve => requestAnimationFrame(resolve));
			}

			// If cancelled mid-chunk, save the remaining frames
			if (simState.renderCancelled && currentZipSize > 0) {
				updateRenderHistoryProgress(100, `Saving final ZIP part ${zipIndex}...`);
				const content = await currentZip.generateAsync({ type: "blob", compression: "STORE" });
				const fileName = `${simState.runTimestamp || generateTimestamp()}_images_steps_${String(firstStepInZip).padStart(5, '0')}_to_${String(lastStepInZip).padStart(5, '0')}_part${zipIndex}.zip`;
				await saveFile(content, fileName, { preApprovedHandle: handle });
			}

			updateRenderHistoryProgress(null, null);
			if (actuallySavedSomething) {
				if (simState.renderCancelled) {
					await showInfoAlert("Rendering stopped. Rendered images saved successfully!", "Stopped");
				} else {
					await showInfoAlert("Images rendered and saved successfully!", "Success");
				}
			} else {
				await showInfoAlert("No images were rendered to save.", "Info");
			}

		} catch (error) {
			console.error("Error rendering from history:", error);
			updateRenderHistoryProgress(null, null);
			await showInfoAlert(`Rendering failed: ${error.message}`, "Error");
		} finally {
			simState.isRenderingFromHistory = false;
			updateButtonStatesAndUI();
		}
	}


	function captureArenaImage() {
		const exportWidth = simState.imageExportResolution.width;
		const exportHeight = simState.imageExportResolution.height;
		const sizing = setupCanvasAndHexSize(exportWidth, exportHeight, simState.config.hexGridActualRadius);

		const offscreenCanvas = document.createElement('canvas');
		offscreenCanvas.width = sizing.actualCanvasWidth;
		offscreenCanvas.height = sizing.actualCanvasHeight;
		const offscreenCtx = offscreenCanvas.getContext('2d');

		const cprgBgColor = canvas.style.backgroundColor || DEFAULT_CANVAS_BG_COLOR;

		drawArenaOnContext(offscreenCtx,
			sizing.actualCanvasWidth, 
			sizing.actualCanvasHeight, 
			simState.cells,
			simState.activeFiringsThisStep,
			simState.preyAiGrid,
			simState.preyToxinNLGrid,
			simState.preyToxinLGrid,
			simState.config.hexGridActualRadius,
			sizing.visualHexRadius,
			sizing.calculatedOffsetX,
			sizing.calculatedOffsetY,
			cprgBgColor
		);
		
		const finalCanvas = document.createElement('canvas');
		finalCanvas.width = exportWidth;
		finalCanvas.height = exportHeight;
		const finalCtx = finalCanvas.getContext('2d');
		finalCtx.fillStyle = cprgBgColor; 
		finalCtx.fillRect(0, 0, exportWidth, exportHeight);
		
		const scale = Math.min(exportWidth / sizing.actualCanvasWidth, exportHeight / sizing.actualCanvasHeight);
		const drawWidth = sizing.actualCanvasWidth * scale;
		const drawHeight = sizing.actualCanvasHeight * scale;
		const drawX = (exportWidth - drawWidth) / 2;
		const drawY = (exportHeight - drawHeight) / 2;

		finalCtx.drawImage(offscreenCanvas, 0, 0, sizing.actualCanvasWidth, sizing.actualCanvasHeight, drawX, drawY, drawWidth, drawHeight);

		const dataURL = finalCanvas.toDataURL('image/png');
		simState.capturedImagesDataURLs.push({ step: simState.simulationStepCount, dataURL, isOffloaded: false });
		simState.capturedImagesTotalSize += dataURL.length;
	}


	async function showEndOfSimulationReport(outcomeReason) {
        if (simState.realTimeStartTime) {
            simState.realTimeElapsedMs += performance.now() - simState.realTimeStartTime;
            simState.realTimeStartTime = null;
        }
		// Automatically offload all remaining RAM data to IndexedDB at the end of the simulation
		if (simState.config.historyEnabled) {
			await offloadHistoryToDB();
		}
		if (simState.saveImagesEnabled) {
			await offloadImagesToDB();
		}
		if (simState.saveArenaStatesEnabled) {
			await offloadArenaStatesToDB();
		}

		// Show the modal
		reportModalOverlay.classList.remove('hidden');
		
		// Clear any previous status messages
		const statusDiv = document.getElementById('saveStatusMessage');
		statusDiv.textContent = ''; 

		// Populate the report with the final numbers
		reportOutcome.textContent = outcomeReason;
		reportDuration.textContent = simState.simulationStepCount;
		let finalLiveAttackers = 0, finalLivePrey = 0, finalLiveDefenders = 0;
		let finalDeadLysingAttackers = 0, finalDeadLysingPrey = 0, finalDeadLysingDefenders = 0;
		simState.cells.forEach(cell => {
			if (!isWithinHexBounds(cell.q, cell.r, simState.config.hexGridActualRadius) || cell.isEffectivelyGone) return;
			if (cell.isDead || cell.isLysing) {
				if (cell.type === 'attacker') finalDeadLysingAttackers++;
				else if (cell.type === 'prey') finalDeadLysingPrey++;
				else if (cell.type === 'defender') finalDeadLysingDefenders++;
			} else {
				if (cell.type === 'attacker') finalLiveAttackers++;
				else if (cell.type === 'prey') finalLivePrey++;
				else if (cell.type === 'defender') finalLiveDefenders++;
			}
		});
		reportAttackersRemaining.textContent = finalLiveAttackers;
		reportLivePreyRemaining.textContent = finalLivePrey;
		reportDefendersRemaining.textContent = finalLiveDefenders;
		reportDeadLysingAttackers.textContent = finalDeadLysingAttackers;
		reportDeadLysingPrey.textContent = finalDeadLysingPrey;
		reportDeadLysingDefenders.textContent = finalDeadLysingDefenders;
		reportCumulativeFirings.textContent = simState.cumulativeFirings.toLocaleString();
		reportCumulativeAttKilled.textContent = simState.cumulativeKills.attacker.toLocaleString();
		reportCumulativePreyKilled.textContent = simState.cumulativeKills.prey.toLocaleString();
		reportCumulativeDefKilled.textContent = simState.cumulativeKills.defender.toLocaleString();
		reportCumulativeAttLysed.textContent = simState.cumulativeLyses.attacker.toLocaleString();
		reportCumulativePreyLysed.textContent = simState.cumulativeLyses.prey.toLocaleString();
		reportCumulativeDefLysed.textContent = simState.cumulativeLyses.defender.toLocaleString();
		reportTotalCPRGConverted.textContent = simState.totalCPRGConverted.toLocaleString(undefined, {
			maximumFractionDigits: 0
		});

        const reportCalcTimeElem = document.getElementById('reportCalculationTime');
        if (reportCalcTimeElem) {
            const ms = simState.realTimeElapsedMs;
            if (ms < 1000) {
                reportCalcTimeElem.textContent = `${ms.toFixed(0)} ms`;
            } else if (ms < 60000) {
                reportCalcTimeElem.textContent = `${(ms / 1000).toFixed(2)} s`;
            } else if (ms < 3600000) {
                const minutes = Math.floor(ms / 60000);
                const seconds = ((ms % 60000) / 1000).toFixed(0);
                reportCalcTimeElem.textContent = `${minutes} m ${seconds} s`;
            } else {
                const hours = Math.floor(ms / 3600000);
                const minutes = Math.floor((ms % 3600000) / 60000);
                const seconds = ((ms % 60000) / 1000).toFixed(0);
                reportCalcTimeElem.textContent = `${hours} h ${minutes} m ${seconds} s`;
            }
        }

		// Control visibility of the "Load Arena State" button
		if (simState.saveArenaStatesEnabled && simState.capturedArenaStatesTSV && simState.capturedArenaStatesTSV.length > 0) {
			loadStateGroup.classList.remove('hidden');
			loadArenaStateToManualButton.disabled = false;
			const minStep = simState.capturedArenaStatesTSV[0].step;
			const maxStep = simState.capturedArenaStatesTSV[simState.capturedArenaStatesTSV.length - 1].step;
			loadStepNumberInput.min = minStep;
			loadStepNumberInput.max = maxStep;
			loadStepNumberInput.value = minStep;
		} else {
			loadStateGroup.classList.add('hidden');
			loadArenaStateToManualButton.disabled = true;
		}

		// Stop the simulation backend processes
		simState.isRunning = false;
		simState.isStepping = false;
		clearTimeout(simState.timeoutId);
		updateButtonStatesAndUI();
		
		// Ensure the close button is enabled
		closeReportModalButton.disabled = false;
	}

	closeReportModalButton.addEventListener('click', () => reportModalOverlay.classList.add('hidden'));

	openHelpModalButton.addEventListener('click', () => {
		helpModalOverlay.classList.remove('hidden');
	});

	closeHelpModalButton.addEventListener('click', () => helpModalOverlay.classList.add('hidden'));
	viewGraphButton.addEventListener('click', () => { displayGraph(); graphModalOverlay.classList.remove('hidden'); });
	closeGraphModalButton.addEventListener('click', () => graphModalOverlay.classList.add('hidden'));

	openLiteratureModalButton.addEventListener('click', () => {
	    literatureModalOverlay.classList.remove('hidden');
	});
	closeLiteratureModalButton.addEventListener('click', () => {
    	literatureModalOverlay.classList.add('hidden');
	});

	loadArenaStateToManualButton.addEventListener('click', handleLoadArenaStateToManual);

	function displayGraph() {
		const chartCanvasCtx = document.getElementById('simulationChartCanvas').getContext('2d');
		if (simulationChart) simulationChart.destroy(); 
		
		let dataToGraph = simState.historicalData;
		const MAX_POINTS = 5000;
		if (dataToGraph.length > MAX_POINTS) {
			const step = Math.ceil(dataToGraph.length / MAX_POINTS);
			dataToGraph = dataToGraph.filter((_, index) => index % step === 0 || index === dataToGraph.length - 1);
		}

		const labels = dataToGraph.map(data => data.time);
		const datasets = [
			{ label: 'Live Attackers', data: dataToGraph.map(data => data.liveAttackers), borderColor: ATTACKER_COLOR.replace('0.9', '1'), backgroundColor: ATTACKER_COLOR.replace('0.9', '0.2'), tension: 0.1, yAxisID: 'yCellCounts' },
			{ label: 'Live Prey', data: dataToGraph.map(data => data.livePrey), borderColor: PREY_COLOR.replace('0.9', '1'), backgroundColor: PREY_COLOR.replace('0.9', '0.2'), tension: 0.1, yAxisID: 'yCellCounts' },
			{ label: 'Live Defenders', data: dataToGraph.map(data => data.liveDefenders), borderColor: DEFENDER_COLOR.replace('0.9', '1'), backgroundColor: DEFENDER_COLOR.replace('0.9', '0.2'), tension: 0.1, yAxisID: 'yCellCounts' },
			{ label: 'Dead/Lysing Attackers', data: dataToGraph.map(data => data.deadLysingAttackers), borderColor: 'rgba(120, 20, 20, 1)', backgroundColor: 'rgba(120, 20, 20, 0.2)', tension: 0.1, yAxisID: 'yCellCounts', hidden: true },
			{ label: 'Dead/Lysing Prey', data: dataToGraph.map(data => data.deadLysingPrey), borderColor: 'rgba(20, 20, 120, 1)', backgroundColor: 'rgba(20, 20, 120, 0.2)', tension: 0.1, yAxisID: 'yCellCounts', hidden: true },
			{ label: 'Dead/Lysing Defenders', data: dataToGraph.map(data => data.deadLysingDefenders || 0), borderColor: 'rgba(200, 90, 10, 1)', backgroundColor: 'rgba(200, 90, 10, 0.2)', tension: 0.1, yAxisID: 'yCellCounts', hidden: true },
			{ label: 'CPRG Converted', data: dataToGraph.map(data => data.cprgConverted), borderColor: 'rgba(219, 39, 119, 1)', backgroundColor: 'rgba(219, 39, 119, 0.2)', tension: 0.1, yAxisID: 'yCPRG' }
		];
		simulationChart = new Chart(chartCanvasCtx, {
			type: 'line', data: { labels: labels, datasets: datasets },
			options: { responsive: true, maintainAspectRatio: false,
				scales: { x: { title: { display: true, text: 'Time (minutes)' } },
					yCellCounts: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Cell Counts' }, beginAtZero: true },
					yCPRG: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'CPRG Converted' }, grid: { drawOnChartArea: false }, beginAtZero: true }
				}, interaction: { mode: 'index', intersect: false, },
				plugins: { tooltip: { callbacks: { label: function(context) { let label = context.dataset.label || ''; if (label) label += ': '; if (context.parsed.y !== null) label += context.parsed.y.toLocaleString(); return label; } } } }
			}
		});
	}


	async function downloadDataAsTSV() {
		if (simState.historicalData.length === 0) {
			await showInfoAlert("No data to download.", "No Data");
			return;
		}

		const lines = [];
		const headers = ['Time', 'LiveAttackers', 'LivePrey', 'LiveDefenders', 'DeadLysingAttackers', 'DeadLysingPrey', 'DeadLysingDefenders', 'CumulativeFirings', 'CumulativeAttKilled', 'CumulativePreyKilled', 'CumulativeDefKilled', 'CumulativeAttLysed', 'CumulativePreyLysed', 'CumulativeDefLysed', 'CPRGConverted'];
		lines.push(headers.join("\t")); 

		for (const row of simState.historicalData) {
			const values = [ row.time, row.liveAttackers, row.livePrey, row.liveDefenders, row.deadLysingAttackers, row.deadLysingPrey, row.deadLysingDefenders, row.firings, row.killedAttackers, row.killedPrey, row.killedDefenders, row.lysedAttackers, row.lysedPrey, row.lysedDefenders, row.cprgConverted ];
			lines.push(values.map(val => (val !== undefined && val !== null) ? val : '').join("\t")); 
		}

		const tsvContent = lines.join("\n") + "\n";

		const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' }); 

		// ONLY call the saveFile helper.
		// The 'false' parameter correctly tells it NOT to use the directory handle,
		// which forces the "Save As..." prompt, exactly as you wanted for this button.
		const fileName = `${simState.runTimestamp || generateTimestamp()}_data_table.tsv`;
		await saveFile(blob, fileName, { useDirectoryHandle: true });
	}


	function generateSettingsTSV() {
		let settingsContent = "Parameter\tValue\n";
	    const config = simState.config; 

		settingsContent += `Arena_Radius\t${simState.config.hexGridActualRadius}\n`;
		settingsContent += `Simulation_Duration_Minutes\t${simState.config.simulationControl.totalSimulationMinutes}\n`;
		settingsContent += `Simulation_Step_Delay_ms\t${simState.config.simulationControl.simulationSpeedMs}\n`;
		settingsContent += `Simulation_Render_Rate_every_N_steps\t${simState.config.simulationControl.renderRate}\n`; 
		settingsContent += `Simulation_History_Record_Rate\t${simState.config.historyRecordRate}\n`;
		settingsContent += `Simulation_Seed\t${simulationSeedInput.value}\n`; 

		settingsContent += `Arena_State_Export_Enabled\t${simState.saveArenaStatesEnabled}\n`;
        settingsContent += `Full_State_History_Enabled\t${simState.config.historyEnabled}\n`;
		settingsContent += `Image_Export_Enabled\t${simState.saveImagesEnabled}\n`;
		settingsContent += `Image_Export_Size_px\t${simState.imageExportResolution.width}\n`;
        settingsContent += `Image_Buffer_Size_Limit_MB\t${simState.config.exports.sizeThresholdForZip}\n`;
        settingsContent += `History_Buffer_Size_Limit_MB\t${simState.config.history.sizeLimitMB}\n`;
	    settingsContent += `Arena_State_Buffer_Size_Limit_MB\t${simState.config.arenaStateBuffer.sizeLimitMB}\n`;


		// Attacker Settings
		settingsContent += `Attacker_Initial_Count\t${simState.config.attacker.initialCount}\n`;
		settingsContent += `Attacker_Replication_Mean_min\t${simState.config.attacker.replication.mean}\n`;
		settingsContent += `Attacker_Replication_Range_min\t${simState.config.attacker.replication.range}\n`;
		settingsContent += `Attacker_T6SS_Fire_Cooldown_Min_min\t${simState.config.attacker.t6ss.fireCooldownMin}\n`;
		settingsContent += `Attacker_T6SS_Fire_Cooldown_Max_min\t${simState.config.attacker.t6ss.fireCooldownMax}\n`;
		settingsContent += `Attacker_T6SS_Precision_Percent\t${simState.config.attacker.t6ss.precision * 100}\n`;
		settingsContent += `Attacker_T6SS_Contact_Sensing_Bias_Percent\t${simState.config.attacker.t6ss.contactSensingBias * 100}\n`;
		settingsContent += `Attacker_T6SS_Kin_Exclusion_Percent\t${simState.config.attacker.t6ss.kinExclusion * 100}\n`;
		settingsContent += `Attacker_T6SS_Kin_Exclusion_Penalty_min\t${simState.config.attacker.t6ss.kinExclusionPenalty}\n`;
		settingsContent += `Attacker_T6SS_NL_Units_per_Hit\t${simState.config.attacker.t6ss.nonLyticUnitsPerHit}\n`;
		settingsContent += `Attacker_T6SS_NL_Delivery_Chance_Percent\t${simState.config.attacker.t6ss.nonLyticDeliveryChance * 100}\n`;
		settingsContent += `Attacker_T6SS_L_Units_per_Hit\t${simState.config.attacker.t6ss.lyticUnitsPerHit}\n`;
		settingsContent += `Attacker_T6SS_L_Delivery_Chance_Percent\t${simState.config.attacker.t6ss.lyticDeliveryChance * 100}\n`;
		settingsContent += `Attacker_Sensitivity_NL_Units_to_Die\t${simState.config.attacker.sensitivity.nonLyticUnitsToDie}\n`;
		settingsContent += `Attacker_Sensitivity_L_Units_to_Lyse\t${simState.config.attacker.sensitivity.lyticUnitsToLyse}\n`;
		settingsContent += `Attacker_Sensitivity_Base_Lysis_Delay_min\t${simState.config.attacker.sensitivity.baseLysisDelay}\n`;
		settingsContent += `Attacker_Movement_Cooldown_Min_min\t${simState.config.attacker.movement.cooldownMin}\n`;
		settingsContent += `Attacker_Movement_Cooldown_Max_min\t${simState.config.attacker.movement.cooldownMax}\n`;
		settingsContent += `Attacker_Movement_Probability_Percent\t${simState.config.attacker.movement.probability * 100}\n`;
		settingsContent += `Attacker_Movement_Directionality_Percent\t${simState.config.attacker.movement.directionality * 100}\n`;
		settingsContent += `Attacker_Movement_Prey_AI_Attraction_Percent\t${simState.config.attacker.movement.preyAiAttraction * 100}\n`;
		settingsContent += `Attacker_Movement_Prey_AI_Attraction_Threshold\t${simState.config.attacker.movement.preyAiAttractionThreshold}\n`; // New
		// Attacker QS Settings
		settingsContent += `Attacker_QS_Production_Rate_per_min\t${simState.config.attacker.qs.productionRate}\n`;
		settingsContent += `Attacker_QS_Degradation_Rate_Percent_per_min\t${simState.config.attacker.qs.degradationRate * 100}\n`;
		settingsContent += `Attacker_QS_Diffusion_Rate\t${simState.config.attacker.qs.diffusionRate}\n`;
		settingsContent += `Attacker_QS_Activation_Midpoint_K\t${simState.config.attacker.qs.midpoint}\n`;
		settingsContent += `Attacker_QS_Cooperativity_n\t${simState.config.attacker.qs.cooperativity}\n`;
		settingsContent += `Attacker_Replication_Reward_Lyses_per_Reward\t${simState.config.attacker.replicationReward.lysesPerReward}\n`;
		settingsContent += `Attacker_Replication_Reward_Mean_min\t${simState.config.attacker.replicationReward.mean}\n`;
		settingsContent += `Attacker_Replication_Reward_Range_min\t${simState.config.attacker.replicationReward.range}\n`;
		settingsContent += `Attacker_Resistance_vs_Prey_Toxin_NL_Percent\t${simState.config.attacker.sensitivity.preyToxinNLResistanceChance * 100}\n`;
		settingsContent += `Attacker_Resistance_vs_Prey_Toxin_L_Percent\t${simState.config.attacker.sensitivity.preyToxinLResistanceChance * 100}\n`;
		settingsContent += `Attacker_Prey_Toxin_NL_Threshold\t${simState.config.attacker.sensitivity.preyToxinNLThreshold}\n`;
		settingsContent += `Attacker_Prey_Toxin_L_Threshold\t${simState.config.attacker.sensitivity.preyToxinLThreshold}\n`;
		settingsContent += `Attacker_Prey_Toxin_NL_Absorption_Rate_Percent\t${simState.config.attacker.sensitivity.preyToxinNLAbsorptionRate * 100}\n`;
		settingsContent += `Attacker_Prey_Toxin_L_Absorption_Rate_Percent\t${simState.config.attacker.sensitivity.preyToxinLAbsorptionRate * 100}\n`;

		// Prey Settings
		settingsContent += `Prey_Initial_Count\t${simState.config.prey.initialCount}\n`;
		settingsContent += `Prey_Replication_Mean_min\t${simState.config.prey.replication.mean}\n`;
		settingsContent += `Prey_Replication_Range_min\t${simState.config.prey.replication.range}\n`;
		settingsContent += `Prey_Sensitivity_vs_Att_NL_Units_to_Die\t${simState.config.prey.sensitivityToAttacker.nonLyticUnitsToDie}\n`;
		settingsContent += `Prey_Sensitivity_vs_Att_L_Units_to_Lyse\t${simState.config.prey.sensitivityToAttacker.lyticUnitsToLyse}\n`;
		settingsContent += `Prey_Sensitivity_vs_Att_Base_Lysis_Delay_min\t${simState.config.prey.sensitivityToAttacker.baseLysisDelay}\n`;
		settingsContent += `Prey_Resistance_vs_Att_NL_Percent\t${simState.config.prey.sensitivityToAttacker.nonLyticResistanceChance * 100}\n`;
		settingsContent += `Prey_Resistance_vs_Att_L_Percent\t${simState.config.prey.sensitivityToAttacker.lyticResistanceChance * 100}\n`;
		settingsContent += `Prey_Sensitivity_vs_Def_NL_Units_to_Die\t${simState.config.prey.sensitivityToDefender.nonLyticUnitsToDie}\n`;
		settingsContent += `Prey_Sensitivity_vs_Def_L_Units_to_Lyse\t${simState.config.prey.sensitivityToDefender.lyticUnitsToLyse}\n`;
		settingsContent += `Prey_Sensitivity_vs_Def_Base_Lysis_Delay_min\t${simState.config.prey.sensitivityToDefender.baseLysisDelay}\n`;
		settingsContent += `Prey_Resistance_vs_Def_NL_Percent\t${simState.config.prey.sensitivityToDefender.nonLyticResistanceChance * 100}\n`;
		settingsContent += `Prey_Resistance_vs_Def_L_Percent\t${simState.config.prey.sensitivityToDefender.lyticResistanceChance * 100}\n`;
		settingsContent += `Prey_LacZ_Units_per_Lysis\t${simState.config.prey.lacZPerPrey}\n`;
		settingsContent += `Prey_Movement_Cooldown_Min_min\t${simState.config.prey.movement.cooldownMin}\n`;
		settingsContent += `Prey_Movement_Cooldown_Max_min\t${simState.config.prey.movement.cooldownMax}\n`;
		settingsContent += `Prey_Movement_Probability_Percent\t${simState.config.prey.movement.probability * 100}\n`;
		settingsContent += `Prey_Movement_Directionality_Percent\t${simState.config.prey.movement.directionality * 100}\n`;
		settingsContent += `Prey_QS_Production_Rate_per_min\t${simState.config.prey.qs.productionRate}\n`; // <-- ADD THIS BLOCK
		settingsContent += `Prey_QS_Degradation_Rate_Percent_per_min\t${simState.config.prey.qs.degradationRate * 100}\n`;
		settingsContent += `Prey_QS_Diffusion_Rate\t${simState.config.prey.qs.diffusionRate}\n`;
		settingsContent += `Prey_Capsule_System_Enabled\t${simState.config.prey.capsule.isEnabled}\n`;
		settingsContent += `Prey_Capsule_Max_Protection_Percent\t${simState.config.prey.capsule.maxProtection}\n`;
		settingsContent += `Prey_Capsule_Derepression_Midpoint_K\t${simState.config.prey.capsule.midpoint}\n`;
		settingsContent += `Prey_Capsule_Cooperativity_n\t${simState.config.prey.capsule.cooperativity}\n`;
		settingsContent += `Prey_Capsule_Cooldown_Min_min\t${simState.config.prey.capsule.cooldownMin}\n`;
		settingsContent += `Prey_Capsule_Cooldown_Max_min\t${simState.config.prey.capsule.cooldownMax}\n`;
		settingsContent += `Prey_Toxin_Trigger_Mode\t${simState.config.prey.triggerMode}\n`;
		settingsContent += `Prey_Toxin_QS_Derepression_Midpoint_K\t${simState.config.prey.toxinQS.midpoint}\n`;
		settingsContent += `Prey_Toxin_QS_Cooperativity_n\t${simState.config.prey.toxinQS.cooperativity}\n`;
		settingsContent += `Prey_Toxin_Release_On_Lysis\t${simState.config.prey.releaseOnLysis}\n`;
		settingsContent += `Prey_Toxin_Lysis_Threshold_Min\t${simState.config.prey.lysisThresholdMin}\n`;
		settingsContent += `Prey_Toxin_Lysis_Threshold_Max\t${simState.config.prey.lysisThresholdMax}\n`;
		settingsContent += `Prey_Toxin_Start_Probability_Percent\t${simState.config.prey.startProbability * 100}\n`;
		settingsContent += `Prey_Toxin_Initiation_Threshold\t${simState.config.prey.toxinInitiationThreshold}\n`;
		settingsContent += `Prey_Toxin_NL_Production_Rate_per_min\t${simState.config.prey.toxinNL.productionRate}\n`;
		settingsContent += `Prey_Toxin_NL_Degradation_Rate_Percent_per_min\t${simState.config.prey.toxinNL.degradationRate * 100}\n`;
		settingsContent += `Prey_Toxin_NL_Diffusion_Rate\t${simState.config.prey.toxinNL.diffusionRate}\n`;
		settingsContent += `Prey_Toxin_L_Production_Rate_per_min\t${simState.config.prey.toxinL.productionRate}\n`;
		settingsContent += `Prey_Toxin_L_Degradation_Rate_Percent_per_min\t${simState.config.prey.toxinL.degradationRate * 100}\n`;
		settingsContent += `Prey_Toxin_L_Diffusion_Rate\t${simState.config.prey.toxinL.diffusionRate}\n`;

		// Defender Settings
		settingsContent += `Defender_Initial_Count\t${simState.config.defender.initialCount}\n`;
		settingsContent += `Defender_Replication_Mean_min\t${simState.config.defender.replication.mean}\n`;
		settingsContent += `Defender_Replication_Range_min\t${simState.config.defender.replication.range}\n`;
		settingsContent += `Defender_Retaliation_Sense_Chance_Percent\t${simState.config.defender.retaliation.senseChance * 100}\n`;
		settingsContent += `Defender_Retaliation_Max_Shots\t${simState.config.defender.retaliation.maxRetaliations}\n`;
		settingsContent += `Defender_Random_Fire_Cooldown_Min_min\t${simState.config.defender.randomFiring.cooldownMin}\n`;
		settingsContent += `Defender_Random_Fire_Cooldown_Max_min\t${simState.config.defender.randomFiring.cooldownMax}\n`;
		settingsContent += `Defender_Random_Fire_Chance_Percent\t${simState.config.defender.randomFiring.chance * 100}\n`;
		settingsContent += `Defender_T6SS_NL_Units_per_Hit\t${simState.config.defender.t6ss.nonLyticUnitsPerHit}\n`;
		settingsContent += `Defender_T6SS_NL_Delivery_Chance_Percent\t${simState.config.defender.t6ss.nonLyticDeliveryChance * 100}\n`;
		settingsContent += `Defender_T6SS_L_Units_per_Hit\t${simState.config.defender.t6ss.lyticUnitsPerHit}\n`;
		settingsContent += `Defender_T6SS_L_Delivery_Chance_Percent\t${simState.config.defender.t6ss.lyticDeliveryChance * 100}\n`;
		settingsContent += `Defender_Sensitivity_vs_Att_NL_Units_to_Die\t${simState.config.defender.sensitivity.nonLyticUnitsToDie}\n`;
		settingsContent += `Defender_Sensitivity_vs_Att_L_Units_to_Lyse\t${simState.config.defender.sensitivity.lyticUnitsToLyse}\n`;
		settingsContent += `Defender_Sensitivity_vs_Att_Base_Lysis_Delay_min\t${simState.config.defender.sensitivity.baseLysisDelay}\n`;
		settingsContent += `Defender_Resistance_vs_Att_NL_Percent\t${simState.config.defender.sensitivity.nonLyticResistanceChance * 100}\n`;
		settingsContent += `Defender_Resistance_vs_Att_L_Percent\t${simState.config.defender.sensitivity.lyticResistanceChance * 100}\n`;
		settingsContent += `Defender_Movement_Cooldown_Min_min\t${simState.config.defender.movement.cooldownMin}\n`;
		settingsContent += `Defender_Movement_Cooldown_Max_min\t${simState.config.defender.movement.cooldownMax}\n`;
		settingsContent += `Defender_Movement_Probability_Percent\t${simState.config.defender.movement.probability * 100}\n`;
		settingsContent += `Defender_Movement_Directionality_Percent\t${simState.config.defender.movement.directionality * 100}\n`;
		settingsContent += `Defender_Replication_Reward_Lyses_per_Reward\t${simState.config.defender.replicationReward.lysesPerReward}\n`;
		settingsContent += `Defender_Replication_Reward_Mean_min\t${simState.config.defender.replicationReward.mean}\n`;
		settingsContent += `Defender_Replication_Reward_Range_min\t${simState.config.defender.replicationReward.range}\n`;
		settingsContent += `Defender_Resistance_vs_Prey_Toxin_NL_Percent\t${simState.config.defender.sensitivity.preyToxinNLResistanceChance * 100}\n`;
		settingsContent += `Defender_Resistance_vs_Prey_Toxin_L_Percent\t${simState.config.defender.sensitivity.preyToxinLResistanceChance * 100}\n`;
		settingsContent += `Defender_Prey_Toxin_NL_Threshold\t${simState.config.defender.sensitivity.preyToxinNLThreshold}\n`;
		settingsContent += `Defender_Prey_Toxin_L_Threshold\t${simState.config.defender.sensitivity.preyToxinLThreshold}\n`;
		settingsContent += `Defender_Prey_Toxin_NL_Absorption_Rate_Percent\t${simState.config.defender.sensitivity.preyToxinNLAbsorptionRate * 100}\n`;
		settingsContent += `Defender_Prey_Toxin_L_Absorption_Rate_Percent\t${simState.config.defender.sensitivity.preyToxinLAbsorptionRate * 100}\n`;


		// CPRG Reporter Settings
		settingsContent += `CPRG_Initial_Substrate_Units\t${simState.config.cprg.initialSubstrate}\n`;
		settingsContent += `CPRG_LacZ_kcat_Units_per_min_per_LacZ\t${simState.config.cprg.k_cat}\n`;
		settingsContent += `CPRG_LacZ_Km_Units\t${simState.config.cprg.Km}\n`;

		return settingsContent;
	}

	function downloadSettingsAsTSV() {
		updateConfigFromUI(true); 
		
		const settingsContent = generateSettingsTSV();
		
		const blob = new Blob([settingsContent], { type: 'text/tab-separated-values;charset=utf-8;' });
		const link = document.createElement("a");
		if (link.download !== undefined) {
			const url = URL.createObjectURL(blob);
			link.setAttribute("href", url);
			link.setAttribute("download", "t6ss_simulation_settings.tsv");
			link.style.visibility = 'hidden';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		}
	}

function promptForBatchSave(dataType) {
    const overlay = document.getElementById('batchSaveModalOverlay');
    const title = document.getElementById('batchSaveModalTitle');
    const body = document.getElementById('batchSaveModalBody');
    const confirmBtn = document.getElementById('confirmBatchSaveButton');

    let titleText = "", bodyText = "";
    switch (dataType) {
        case 'Images':
            titleText = "Image Buffer Full";
            bodyText = "The image buffer has reached its capacity. Click below to save the current batch of images and continue the simulation.";
            break;
        case 'History':
            titleText = "History Buffer Full";
            bodyText = "The history memory limit has been reached. Click below to save the current history segment and continue the simulation.";
            break;
        case 'ArenaStates':
            titleText = "Arena State Buffer Full";
            bodyText = "The arena state buffer has reached its capacity. Click below to save the current batch of arena layouts and continue the simulation.";
            break;
    }
    title.textContent = titleText;
    body.innerHTML = `<p>${bodyText}</p>`;
    
    // The main click handler, now async
    const clickListener = async () => {
        // Disable button to prevent multiple saves
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Saving...';

        try {
            // Perform the correct save action.
            // The download functions will resume the simulation automatically.
            switch (dataType) {
                case 'Images':
                    await downloadImagesAsZIP(true);
                    break;
                case 'History':
                    await saveFullSimulationToFile(true);
                    break;
                case 'ArenaStates':
                    await downloadArenaStatesAsZIP(true);
                    break;
            }
        } catch (error) {
            console.error(`Batch save for ${dataType} failed:`, error);
            // If saving fails, we must manually re-enable UI and show the error
            startButton.disabled = false;
            pauseButton.disabled = true;
            stepButton.disabled = false;
            showInfoAlert(`Save failed: ${error.message}`, "Error");
        } finally {
            // This code runs whether the save succeeded or failed
            overlay.classList.add('hidden');
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Save & Continue';
        }
    };

    // Use { once: true } to ensure the listener only fires once and is self-cleaning.
    // We must first clone the button to remove any previous listeners before adding a new one.
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    newConfirmBtn.addEventListener('click', clickListener, { once: true });

    // Finally, show the modal.
    overlay.classList.remove('hidden');
}

async function getDirectoryHandle() {
    // If we already have a handle for this session, just return it instantly.
    if (simState.directoryHandle) {
        return simState.directoryHandle;
    }

    // If not, and the browser supports the API, prompt the user.
    if ('showDirectoryPicker' in window) {
        try {
            console.log("Directory handle not found. Prompting user...");
            // The one-time prompt to the user happens HERE.
            const handle = await window.showDirectoryPicker({
				id: 'bft6-simulation-saves', 
				mode: 'readwrite',
		        startIn: 'documents'
			});
            simState.directoryHandle = handle; // Store the handle for all future saves in this session.
            return handle;
        } catch (err) {
            console.warn("User cancelled directory selection.", err);
            simState.directoryHandle = null; // Ensure it's null if they cancel
            return null;
        }
    }
    
    // Return null if the API is not supported.
    return null;
}

async function saveFile(blob, fileName, { useDirectoryHandle = true, preApprovedHandle = null } = {}) {
    let handle = preApprovedHandle;

    // If no handle was passed in, try to get one.
    // This maintains the original "get-or-prompt" behavior.
    if (!handle && useDirectoryHandle && 'showDirectoryPicker' in window) {
        handle = await getDirectoryHandle();
    }

    // Now, proceed based on whether we have a handle.
    if (handle) {
        // Modern Way: We have a handle, so save silently to the directory.
        try {
            const fileHandle = await handle.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
            console.log(`Successfully saved to directory: ${fileName}`);
        } catch (err) {
            console.error(`Error saving file via File System Access API:`, err);
            // Fallback to single download if there's an error with the handle
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        }
    } else {
        // Fallback Way: No handle exists, trigger a standard "Save As..." prompt.
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }
}

async function downloadImagesAsZIP(isMidSimBatch = false, andClearBuffer = false) {
    const button = document.getElementById('saveAllArchivesButton'); // Use the main button for reference
    if (button && !isMidSimBatch) {
        button.disabled = true; // Still disable the button in the report modal
    }

    if (simState.capturedImagesDataURLs.length === 0) {
        if (!isMidSimBatch) await showInfoAlert("No images are currently buffered to download.", "No Images");
        if (button && !isMidSimBatch) { button.disabled = false; }
        return;
    }

    // 1. Get permission FIRST, while the user click is "trusted".
    const handle = await getDirectoryHandle();

    if (isMidSimBatch) {
        const confirmBtn = document.getElementById('confirmBatchSaveButton');
        if (confirmBtn) confirmBtn.textContent = 'Packaging Images... Please Wait';
    }

    // 2. NOW do the slow work.
    if (button && !isMidSimBatch) button.textContent = 'Packaging Images...';
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Chunking parameters
    const chunkLimitMB = simState.config.exports.sizeThresholdForZip || 100;
    const chunkLimitBytes = chunkLimitMB * 1024 * 1024;

    const db = await getDB();
    
    let currentZip = new JSZip();
    let currentZipSize = 0;
    let zipIndex = 1;
    let firstStepInZip = null;
    let lastStepInZip = null;
    const processedSteps = [];

    for (let i = 0; i < simState.capturedImagesDataURLs.length; ) {
        let batchRefs = [];
        let accumulatedSize = 0;
        let j = i;
        
        while (j < simState.capturedImagesDataURLs.length) {
            const ref = simState.capturedImagesDataURLs[j];
            const size = ref.sizeBytes || (1024 * 1024); // Fallback estimate (1MB) if undefined
            
            // If accumulated size plus this image exceeds the limit, stop adding to this batch
            if (batchRefs.length > 0 && accumulatedSize + size >= chunkLimitBytes) {
                break;
            }
            batchRefs.push(ref);
            accumulatedSize += size;
            j++;
        }

        const stepsToFetch = batchRefs.filter(ref => ref.isOffloaded).map(ref => ref.step);
        let dbBatchMap = new Map();
        
        if (stepsToFetch.length > 0) {
            dbBatchMap = await db.getImagesBySteps(stepsToFetch);
        }

        for (let j = 0; j < batchRefs.length; j++) {
            const imgRef = batchRefs[j];
            let dataURL = null;
            if (!imgRef.isOffloaded) {
                dataURL = imgRef.dataURL;
            } else {
                dataURL = dbBatchMap.get(imgRef.step);
            }
            if (!dataURL) continue;

            if (firstStepInZip === null) firstStepInZip = imgRef.step;
            lastStepInZip = imgRef.step;
            processedSteps.push(imgRef.step);

            const base64Data = dataURL.substring(dataURL.indexOf(',') + 1);
            currentZip.file(`image_${String(imgRef.step).padStart(5, '0')}.png`, base64Data, { base64: true });
            currentZipSize += dataURL.length;

            const overallIndex = i + j;
            const percent = Math.round((overallIndex / simState.capturedImagesDataURLs.length) * 100);
            updateSaveProgress(percent, `Packaging Images: ${percent}%`);

            // If we reached the size limit, or it is the last image, write the ZIP
            if (currentZipSize >= chunkLimitBytes || overallIndex === simState.capturedImagesDataURLs.length - 1) {
                const content = await currentZip.generateAsync({ type: "blob", compression: "STORE" });
                const fileName = `${simState.runTimestamp || generateTimestamp()}_images_steps_${String(firstStepInZip).padStart(5, '0')}_to_${String(lastStepInZip).padStart(5, '0')}_part${zipIndex}.zip`;
                
                await saveFile(content, fileName, { preApprovedHandle: handle });

                // Reset ZIP parameters
                currentZip = new JSZip();
                currentZipSize = 0;
                firstStepInZip = null;
                zipIndex++;
            }
        }
        i = j; // Move the outer loop index forward to the next unbatched item
    }
    updateSaveProgress(null, "Images saved successfully!");

    if (isMidSimBatch || andClearBuffer) {
        simState.capturedImagesDataURLs = [];
        simState.capturedImagesTotalSize = 0;
        // Delete processed images from IndexedDB
        for (const step of processedSteps) {
            await db.deleteImage(step);
        }
    }

    if (isMidSimBatch) {
        startButton.click();
    } else if (button) {
        button.textContent = 'Save All Data';
        button.disabled = false;
    }
}


async function downloadArenaStatesAsZIP(isMidSimBatch = false, andClearBuffer = false) {
    const button = document.getElementById('saveAllArchivesButton');
    if (button && !isMidSimBatch) {
        button.disabled = true;
    }

    if (simState.capturedArenaStatesTSV.length === 0) {
        if (!isMidSimBatch) await showInfoAlert("No arena states were saved to download.", "No Data");
        if (button && !isMidSimBatch) { button.disabled = false; }
        return;
    }

    // --- NEW LOGIC ---
    const handle = await getDirectoryHandle();
	
    if (isMidSimBatch) {
        const confirmBtn = document.getElementById('confirmBatchSaveButton');
        if (confirmBtn) confirmBtn.textContent = 'Packaging States... Please Wait';
    }

    if (button && !isMidSimBatch) button.textContent = 'Packaging States...';
    await new Promise(resolve => setTimeout(resolve, 0));

    // Chunking parameters
    const chunkLimitMB = simState.config.arenaStateBuffer.sizeLimitMB || 50;
    const chunkLimitBytes = chunkLimitMB * 1024 * 1024;
    const db = await getDB();
    
    let currentZip = new JSZip();
    let currentZipSize = 0;
    let zipIndex = 1;
    let firstStepInZip = null;
    let lastStepInZip = null;
    const processedSteps = [];

    for (let i = 0; i < simState.capturedArenaStatesTSV.length; ) {
        let batchRefs = [];
        let accumulatedSize = 0;
        let j = i;
        
        while (j < simState.capturedArenaStatesTSV.length) {
            const ref = simState.capturedArenaStatesTSV[j];
            const size = ref.sizeBytes || (50 * 1024); // Fallback estimate (50KB) if undefined
            
            if (batchRefs.length > 0 && accumulatedSize + size >= chunkLimitBytes) {
                break;
            }
            batchRefs.push(ref);
            accumulatedSize += size;
            j++;
        }

        const stepsToFetch = batchRefs.filter(ref => ref.isOffloaded).map(ref => ref.step);
        let dbBatchMap = new Map();
        
        if (stepsToFetch.length > 0) {
            dbBatchMap = await db.getArenaStatesBySteps(stepsToFetch);
        }

        for (let k = 0; k < batchRefs.length; k++) {
            const stateRef = batchRefs[k];
            let tsvData = null;
            if (!stateRef.isOffloaded) {
                tsvData = stateRef.tsvData;
            } else {
                tsvData = dbBatchMap.get(stateRef.step);
            }
            if (!tsvData) continue;

            if (firstStepInZip === null) firstStepInZip = stateRef.step;
            lastStepInZip = stateRef.step;
            processedSteps.push(stateRef.step);

            currentZip.file(`arena_state_step_${String(stateRef.step).padStart(5, '0')}.tsv`, tsvData);
            currentZipSize += tsvData.length;

            const overallIndex = i + k;
            const percent = Math.round((overallIndex / simState.capturedArenaStatesTSV.length) * 100);
            updateSaveProgress(percent, `Packaging States: ${percent}%`);

            if (currentZipSize >= chunkLimitBytes || overallIndex === simState.capturedArenaStatesTSV.length - 1) {
                const content = await currentZip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
                const fileName = `${simState.runTimestamp || generateTimestamp()}_arena_states_steps_${String(firstStepInZip).padStart(5, '0')}_to_${String(lastStepInZip).padStart(5, '0')}_part${zipIndex}.zip`;
                
                await saveFile(content, fileName, { preApprovedHandle: handle });

                currentZip = new JSZip();
                currentZipSize = 0;
                firstStepInZip = null;
                zipIndex++;
            }
        }
        i = j; // Move the outer loop index forward to the next unbatched item
    }
    updateSaveProgress(null, "Arena states saved successfully!");

    if (isMidSimBatch || andClearBuffer) {
        simState.capturedArenaStatesTSV = [];
        simState.capturedArenaStatesTSVTotalSize = 0;
        // Delete processed arena states from IndexedDB
        for (const step of processedSteps) {
            await db.deleteArenaState(step);
        }
    }

    if (isMidSimBatch) {
        startButton.click();
    } else if (button) {
        button.textContent = 'Save All Data';
        button.disabled = false;
    }
}


async function saveFullSimulationToFile(isBatch = false) {
    const button = document.getElementById('saveAllArchivesButton');
    if (button && !isBatch) {
        button.disabled = true;
    }

    const allKeys = [...simState.optimizedHistoryFrames.keys()].sort((a, b) => a - b);
    if (!simState.config.historyEnabled || allKeys.length === 0) {
        if (!isBatch) await showInfoAlert("Full history saving is not enabled or no history has been recorded.", "Cannot Save Session");
        if (button && !isBatch) {
            button.disabled = false;
        }
        return;
    }

    // Get the handle and provide user feedback.
    const handle = await getDirectoryHandle();
    if (isBatch) {
        const confirmBtn = document.getElementById('confirmBatchSaveButton');
        if (confirmBtn) confirmBtn.textContent = 'Packaging History... Please Wait';
    }
    if (button && !isBatch) button.textContent = 'Packaging History...';
    await new Promise(resolve => setTimeout(resolve, 0));

    const firstStep = allKeys[0];
    const lastStep = allKeys[allKeys.length - 1];
    const fileName = `${simState.runTimestamp || generateTimestamp()}_history_steps_${String(firstStep).padStart(5, '0')}_to_${String(lastStep).padStart(5, '0')}.bft6`;

    // Stream the history file sequentially to keep a tiny memory footprint.
    let writableStream = null;
    const blobChunks = [];

    if (handle) {
        try {
            const fileHandle = await handle.getFileHandle(fileName, { create: true });
            writableStream = await fileHandle.createWritable();
        } catch (err) {
            console.error("Could not create writable stream, falling back to Blob chunks:", err);
            writableStream = null;
        }
    }

    let hasStreamError = false;
    let usingBlobFallback = (writableStream === null); // Record if we START in fallback mode

    async function writeChunk(data) {
        if (hasStreamError) return false;

        if (writableStream) {
            try {
                await writableStream.write(data);
                return true;
            } catch (err) {
                console.error("Writable stream write error. Aborting save.", err);
                hasStreamError = true;
                simState.directoryHandle = null; // force fresh handle next time
                try {
                    await writableStream.abort();
                } catch(e) {}
                writableStream = null;
                return false;
            }
        } else if (usingBlobFallback) {
            blobChunks.push(data);
            return true;
        }
        return false;
    }

    const db = await getDB();
    
    // Outer MsgPack map has 4 keys: "schema_version", "cell_schema", "settingsTSV", "history"
    await writeChunk(new Uint8Array([0x84])); // 0x84 represents a fixmap with 4 entries

    // 1. schema_version -> 3
    await writeChunk(msgpack.encode("schema_version"));
    await writeChunk(msgpack.encode(3));

    // 2. cell_schema -> CELL_SCHEMA
    await writeChunk(msgpack.encode("cell_schema"));
    await writeChunk(msgpack.encode(CELL_SCHEMA));

    // 3. settingsTSV -> generateSettingsTSV()
    await writeChunk(msgpack.encode("settingsTSV"));
    await writeChunk(msgpack.encode(generateSettingsTSV()));

    // 4. history -> Array of N frames
    await writeChunk(msgpack.encode("history"));

    const N = allKeys.length;
    if (N < 16) {
        if (!(await writeChunk(new Uint8Array([0x90 | N])))) return;
    } else if (N < 65536) {
        if (!(await writeChunk(new Uint8Array([0xdc, (N >> 8) & 0xff, N & 0xff])))) return;
    } else {
        if (!(await writeChunk(new Uint8Array([0xdd, (N >> 24) & 0xff, (N >> 16) & 0xff, (N >> 8) & 0xff, N & 0xff])))) return;
    }

    // Use a fixed chunk size of 100 to prevent aggressive memory usage that causes crashes
    const batchStepCount = 100;
    
    console.log(`Saving history in batches of ${batchStepCount} steps`);
    
    // Write frames in batches
    for (let i = 0; i < N; i += batchStepCount) {
        const batchKeys = allKeys.slice(i, i + batchStepCount);
        
        // Find which keys in this batch need to be fetched from DB
        const dbKeys = [];
        const ramFrames = new Map();
        for (const key of batchKeys) {
            const frame = simState.optimizedHistoryFrames.get(key);
            if (frame && !frame.isOffloaded) {
                ramFrames.set(key, frame);
            } else {
                dbKeys.push(key);
            }
        }
        
        // Fetch offloaded frames in a single transaction
        let dbFrames = new Map();
        if (dbKeys.length > 0) {
            try {
                dbFrames = await getHistoryFramesBatch(db, dbKeys);
            } catch (err) {
                console.error("Error fetching history batch from IndexedDB:", err);
            }
        }
        
        // Encode all frames in the batch
        const encodedChunks = [];
        for (const key of batchKeys) {
            const frame = ramFrames.get(key) || dbFrames.get(key);
            if (frame) {
                encodedChunks.push(msgpack.encode(frame));
            }
        }
        
        // Combine all encoded frames in this batch and write as one big chunk
        if (encodedChunks.length > 0) {
            let totalLength = 0;
            for (const chunk of encodedChunks) {
                totalLength += chunk.length;
            }
            const combinedChunk = new Uint8Array(totalLength);
            let offset = 0;
            for (const chunk of encodedChunks) {
                combinedChunk.set(chunk, offset);
                offset += chunk.length;
            }
            
            const success = await writeChunk(combinedChunk);
            if (!success) {
                break; // Stop immediately if there's an error
            }
        }
        
        const percent = Math.min(100, Math.round(((i + batchKeys.length) / N) * 100));
        updateSaveProgress(percent, `Saving History: ${percent}%`);
        // Yield to prevent thread locking
        await new Promise(resolve => setTimeout(resolve, 0));
    }

    // Complete saving process
    if (hasStreamError) {
        updateSaveProgress(null, null);
        await showInfoAlert("An error occurred while writing to disk. Make sure you have enough free space and that the file is not locked.", "Save Failed");
        if (button && !isBatch) button.disabled = false;
        return;
    }

    if (writableStream) {
        try {
            await writableStream.close();
            console.log(`Successfully stream-saved single history file: ${fileName}`);
        } catch (err) {
            console.error("Writable stream close error:", err);
            updateSaveProgress(null, null);
            await showInfoAlert(`The file was successfully written, but your browser failed to finalize it (often due to antivirus scans timing out on massive files). \n\nIf you see a '.crswap' file in your folder, your data is safe! Simply rename that file to:\n\n${fileName}\n\nand it will work perfectly.`, "Finalization Error");
            if (button && !isBatch) button.disabled = false;
            return;
        }
    } else {
        const singleFileBlob = new Blob(blobChunks, { type: 'application/octet-stream' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(singleFileBlob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        console.log(`Successfully downloaded single history file via Blob fallback: ${fileName}`);
    }
    updateSaveProgress(null, "History saved successfully!");

    // Clear the main buffer right away if this is a batch save.
    if (isBatch) {
        simState.history = [];
        simState.optimizedHistoryFrames = new Map();
        simState.capturedHistoryTotalSize = 0;
        await db.clearHistory();
    }

    if (isBatch) {
        startButton.click();
    } else if (button) {
        button.textContent = 'Save All Data';
        button.disabled = false;
    }
}


async function exportCurrentStepState() {
    const button = document.getElementById('exportCurrentStepStateButton');

    try {
        button.disabled = true;
        button.textContent = 'Generating...';

        let stateSource;
        let sourceDescription = 'live_state';
        let rngCountValue;
        let rngCountType;

        if (simState.isScrubbing) {
            const slider = document.getElementById('timeTravelSlider');
            const stepIndex = parseInt(slider.value);
            const optimizedState = simState.optimizedHistoryFrames.get(stepIndex);
            
            if (!optimizedState) {
                showInfoAlert("Could not find the historical state to export.", "Error");
                return;
            }
            
            stateSource = rehydrateOptimizedStep(optimizedState);
            sourceDescription = 'history_scrub';

            // Check if the historical state contains the specific RNG count for that step
            if (stateSource.rngDrawCountAtStep !== undefined) {
                rngCountValue = stateSource.rngDrawCountAtStep;
                rngCountType = 'historical'; // It's a true snapshot
            } else {
                // This is an older history file, so we must use the live count
                rngCountValue = simState.rngDrawCount;
                rngCountType = 'current'; 
            }

        } else {
            // We are exporting the current, live state
            stateSource = simState;
            rngCountValue = simState.rngDrawCount;
            rngCountType = 'current';
        }

        const exportObject = {
            metadata: {
                exportTimestamp: new Date().toISOString(),
                simulationStepCount: stateSource.simulationStepCount,
                simulationSeed: simulationSeedInput.value,
                rngDrawCount: {
                    value: rngCountValue,
                    type: rngCountType // Explicitly states the source
                },
                source: sourceDescription
            },
			settingsTSV: generateSettingsTSV(),
            state: {
                nextCellId: stateSource.nextCellId,
                cumulativeFirings: stateSource.cumulativeFirings,
                cumulativeKills: stateSource.cumulativeKills,
                cumulativeLyses: stateSource.cumulativeLyses,
                totalCPRGConverted: stateSource.totalCPRGConverted,
		        remainingCPRGSubstrate: stateSource.remainingCPRGSubstrate,
				totalActiveLacZReleased: stateSource.totalActiveLacZReleased,
                cells: Array.from(stateSource.cells.values()),
				attackerAiGrid: Array.from(stateSource.attackerAiGrid.entries()),
				preyAiGrid: Array.from(stateSource.preyAiGrid.entries()),
				preyToxinNLGrid: Array.from(stateSource.preyToxinNLGrid.entries()),
				preyToxinLGrid: Array.from(stateSource.preyToxinLGrid.entries()),
	            activeFiringsThisStep: Array.from(stateSource.activeFiringsThisStep.entries())
            }
        };

        const jsonString = JSON.stringify(exportObject, (key, value) =>
            value === Infinity ? "Infinity" : value,
        2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const fileName = `bft6_state_step_${stateSource.simulationStepCount}_seed_${simulationSeedInput.value}.json`;
        
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Error during state export:", error);
        showInfoAlert(`An error occurred during export: ${error.message}`, "Export Failed");
    } finally {
        button.disabled = false;
        button.textContent = 'Export Step';
    }
}


async function importStepStateFromFile() {
    // --- The confirmation modal logic is correct ---
    try {
        await showConfirmationModal(
            "This will overwrite all current settings and clear the arena to load the state from the file. Are you sure you want to continue?",
            "Import Simulation State?",
            "Import"
        );
    } catch (e) {
        console.log("Import cancelled by user.");
        return;
    }

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,application/json';

    fileInput.onchange = e => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => { // Make the onload function async
                const button = document.getElementById('importStepStateButton');
                try {
                    button.disabled = true;
                    button.textContent = 'Importing...';

                    const fileContent = event.target.result;
                    const loadedObject = JSON.parse(fileContent);

                    // --- Validation, Settings Import, and State Reset are correct ---
                    if (!loadedObject.metadata || !loadedObject.settingsTSV || !loadedObject.state) {
                        throw new Error("Invalid state file. Missing required sections.");
                    }
                    importSettingsFromTSV(loadedObject.settingsTSV);
                    updateConfigFromUI(true);
                    await resetSimulationState(); // This resets rngDrawCount to 0

                    // --- Rehydration and State Restoration are correct ---
                    const rehydratedState = rehydrateOptimizedStep(loadedObject);
                    restoreSimStateFromHistoryObject(rehydratedState);

                    // --- 5. RNG SYNCHRONIZATION (NEW AND CRITICAL) ---
					// This robustly checks for the RNG count from either a .bft6 history frame or a .json metadata object
					const targetRngCount = rehydratedState.rngDrawCountAtStep !== undefined 
						? rehydratedState.rngDrawCountAtStep 
						: (loadedObject.metadata && loadedObject.metadata.rngDrawCount ? loadedObject.metadata.rngDrawCount.value : 0);

                    const currentRngCount = simState.rngDrawCount; // Will be 0 after reset
                    const numbersToBurn = targetRngCount - currentRngCount;
                    
					synchronizeRNG(targetRngCount);
                    
                    // --- 6. Final UI Update ---
                    updateUiFromState(rehydratedState);
                    updateButtonStatesAndUI();
                    simState.isInitialized = true;
                    showInfoAlert(`Successfully imported and synchronized state from step ${rehydratedState.simulationStepCount}.`, "Import Complete");

                } catch (error) {
                    console.error("Failed to import step state file:", error);
                    showInfoAlert(`Error importing file: ${error.message}`, "Import Error");
                } finally {
                    button.disabled = false;
                    button.textContent = 'Import Step';
                }
            };
            reader.readAsText(file);
        }
    };
    fileInput.click();
}

async function handleSaveAllData() {
    const button = document.getElementById('saveAllArchivesButton');
    const statusDiv = document.getElementById('saveStatusMessage');
    
    button.disabled = true;
    button.textContent = 'Saving...';
    
    try {
        updateSaveProgress(0, 'Preparing saves...');

        if (simState.historicalData.length > 0) {
            updateSaveProgress(0, 'Saving simulation data...');
            // This function saves the file but does NOT clear the data from memory.
            await downloadDataAsTSV();
        }
 
        if (simState.capturedImagesDataURLs.length > 0) {
            await downloadImagesAsZIP(false, true); 
        }

        if (simState.capturedArenaStatesTSV.length > 0) {
            await downloadArenaStatesAsZIP(false, false); 
        }

        if (simState.optimizedHistoryFrames.size > 0) {
            await saveFullSimulationToFile(false);
        }

        updateSaveProgress(null, 'All archives saved successfully!');

    } catch (err) {
        console.error("An error occurred during 'Save All' sequence:", err);
        updateSaveProgress(null, `An error occurred: ${err.message}`);
    } finally {
        button.disabled = false;
        button.textContent = 'Save All Data';
    }
}

async function loadFullSimulationFromFile(fileInputData) { // can be File, Blob or ArrayBuffer
    try {
        simState.importSessionCancelled = false;
        simState.isImportingSession = true;
        updateButtonStatesAndUI();

        if (cancelImportSessionButton) {
            cancelImportSessionButton.disabled = false;
            cancelImportSessionButton.textContent = "Stop & Save History Loaded";
        }
        updateImportSessionProgress(0, "Initializing session import...");

        let blob = fileInputData;
        if (fileInputData instanceof ArrayBuffer) {
            blob = new Blob([fileInputData]);
        }

        const textDecoder = new TextDecoder("utf-8");
        let sharedDataView = null;

        // 1. Recursive MsgPack decoder supporting core schema structures
        function decodeMsgPackPart(bytes, offset) {
            let pos = offset;
            if (pos >= bytes.length) {
                throw new RangeError("Out of bounds");
            }
            const type = bytes[pos];
            if (type === undefined) {
                throw new RangeError("Out of bounds");
            }
            
            if (type <= 0x7f) return { value: type, bytesRead: 1 };
            if (type >= 0xe0) return { value: type - 0x100, bytesRead: 1 };
            
            if (type >= 0x80 && type <= 0x8f) {
                const size = type & 0x0f;
                pos += 1;
                const map = {};
                for (let i = 0; i < size; i++) {
                    const keyRes = decodeMsgPackPart(bytes, pos);
                    pos += keyRes.bytesRead;
                    const valRes = decodeMsgPackPart(bytes, pos);
                    pos += valRes.bytesRead;
                    map[keyRes.value] = valRes.value;
                }
                return { value: map, bytesRead: pos - offset };
            }
            if (type >= 0x90 && type <= 0x9f) {
                const size = type & 0x0f;
                pos += 1;
                const arr = [];
                for (let i = 0; i < size; i++) {
                    const res = decodeMsgPackPart(bytes, pos);
                    pos += res.bytesRead;
                    arr.push(res.value);
                }
                return { value: arr, bytesRead: pos - offset };
            }
            if (type >= 0xa0 && type <= 0xbf) {
                const length = type & 0x1f;
                if (pos + 1 + length > bytes.length) throw new RangeError("Out of bounds");
                pos += 1;
                const strBytes = bytes.subarray(pos, pos + length);
                const str = textDecoder.decode(strBytes);
                return { value: str, bytesRead: 1 + length };
            }
            if (type === 0xc0) return { value: null, bytesRead: 1 };
            if (type === 0xc2) return { value: false, bytesRead: 1 };
            if (type === 0xc3) return { value: true, bytesRead: 1 };
            
            if (type === 0xcb) {
                if (pos + 9 > bytes.length) throw new RangeError("Out of bounds");
                if (!sharedDataView || sharedDataView.buffer !== bytes.buffer) {
                    sharedDataView = new DataView(bytes.buffer);
                }
                const val = sharedDataView.getFloat64(bytes.byteOffset + pos + 1, false);
                return { value: val, bytesRead: 9 };
            }
            if (type === 0xcc) {
                if (pos + 2 > bytes.length) throw new RangeError("Out of bounds");
                return { value: bytes[pos + 1], bytesRead: 2 };
            }
            if (type === 0xcd) {
                if (pos + 3 > bytes.length) throw new RangeError("Out of bounds");
                return { value: (bytes[pos + 1] << 8) | bytes[pos + 2], bytesRead: 3 };
            }
            if (type === 0xce) {
                if (pos + 5 > bytes.length) throw new RangeError("Out of bounds");
                const val = ((bytes[pos + 1] << 24) | (bytes[pos + 2] << 16) | (bytes[pos + 3] << 8) | bytes[pos + 4]) >>> 0;
                return { value: val, bytesRead: 5 };
            }
            if (type === 0xd0) {
                if (pos + 2 > bytes.length) throw new RangeError("Out of bounds");
                return { value: new Int8Array([bytes[pos + 1]])[0], bytesRead: 2 };
            }
            if (type === 0xd1) {
                if (pos + 3 > bytes.length) throw new RangeError("Out of bounds");
                return { value: new Int16Array([(bytes[pos + 1] << 8) | bytes[pos + 2]])[0], bytesRead: 3 };
            }
            if (type === 0xd2) {
                if (pos + 5 > bytes.length) throw new RangeError("Out of bounds");
                return { value: new Int32Array([(bytes[pos + 1] << 24) | (bytes[pos + 2] << 16) | (bytes[pos + 3] << 8) | bytes[pos + 4]])[0], bytesRead: 5 };
            }
            if (type === 0xd9) {
                if (pos + 2 > bytes.length) throw new RangeError("Out of bounds");
                const length = bytes[pos + 1];
                if (pos + 2 + length > bytes.length) throw new RangeError("Out of bounds");
                pos += 2;
                const strBytes = bytes.subarray(pos, pos + length);
                const str = textDecoder.decode(strBytes);
                return { value: str, bytesRead: 2 + length };
            }
            if (type === 0xda) {
                if (pos + 3 > bytes.length) throw new RangeError("Out of bounds");
                const length = (bytes[pos + 1] << 8) | bytes[pos + 2];
                if (pos + 3 + length > bytes.length) throw new RangeError("Out of bounds");
                pos += 3;
                const strBytes = bytes.subarray(pos, pos + length);
                const str = textDecoder.decode(strBytes);
                return { value: str, bytesRead: 3 + length };
            }
            if (type === 0xdb) {
                if (pos + 5 > bytes.length) throw new RangeError("Out of bounds");
                const length = ((bytes[pos + 1] << 24) | (bytes[pos + 2] << 16) | (bytes[pos + 3] << 8) | bytes[pos + 4]) >>> 0;
                if (pos + 5 + length > bytes.length) throw new RangeError("Out of bounds");
                pos += 5;
                const strBytes = bytes.subarray(pos, pos + length);
                const str = textDecoder.decode(strBytes);
                return { value: str, bytesRead: 5 + length };
            }
            if (type === 0xdc) {
                if (pos + 3 > bytes.length) throw new RangeError("Out of bounds");
                const size = (bytes[pos + 1] << 8) | bytes[pos + 2];
                pos += 3;
                const arr = [];
                for (let i = 0; i < size; i++) {
                    const res = decodeMsgPackPart(bytes, pos);
                    pos += res.bytesRead;
                    arr.push(res.value);
                }
                return { value: arr, bytesRead: pos - offset };
            }
            if (type === 0xdd) {
                if (pos + 5 > bytes.length) throw new RangeError("Out of bounds");
                const size = ((bytes[pos + 1] << 24) | (bytes[pos + 2] << 16) | (bytes[pos + 3] << 8) | bytes[pos + 4]) >>> 0;
                pos += 5;
                const arr = [];
                for (let i = 0; i < size; i++) {
                    const res = decodeMsgPackPart(bytes, pos);
                    pos += res.bytesRead;
                    arr.push(res.value);
                }
                return { value: arr, bytesRead: pos - offset };
            }
            if (type === 0xde) {
                if (pos + 3 > bytes.length) throw new RangeError("Out of bounds");
                const size = (bytes[pos + 1] << 8) | bytes[pos + 2];
                pos += 3;
                const map = {};
                for (let i = 0; i < size; i++) {
                    const keyRes = decodeMsgPackPart(bytes, pos);
                    pos += keyRes.bytesRead;
                    const valRes = decodeMsgPackPart(bytes, pos);
                    pos += valRes.bytesRead;
                    map[keyRes.value] = valRes.value;
                }
                return { value: map, bytesRead: pos - offset };
            }
            if (type === 0xdf) {
                if (pos + 5 > bytes.length) throw new RangeError("Out of bounds");
                const size = ((bytes[pos + 1] << 24) | (bytes[pos + 2] << 16) | (bytes[pos + 3] << 8) | bytes[pos + 4]) >>> 0;
                pos += 5;
                const map = {};
                for (let i = 0; i < size; i++) {
                    const keyRes = decodeMsgPackPart(bytes, pos);
                    pos += keyRes.bytesRead;
                    const valRes = decodeMsgPackPart(bytes, pos);
                    pos += valRes.bytesRead;
                    map[keyRes.value] = valRes.value;
                }
                return { value: map, bytesRead: pos - offset };
            }
            
            throw new Error(`Unsupported MsgPack type byte: 0x${type.toString(16)}`);
        }

        // 2. Sliding window helper to slice and read the file sequentially
        let filePos = 0;
        const fileSize = blob.size;
        const defaultBlockSize = 10 * 1024 * 1024; // 10MB read block size
        let currentBuffer = new Uint8Array(0);
        let currentBufferOffset = 0;

        async function ensureBytes(requiredBytes) {
            const remainingBuffered = currentBuffer.length - currentBufferOffset;
            if (remainingBuffered >= requiredBytes) {
                return;
            }
            const readSize = Math.max(defaultBlockSize, requiredBytes);
            const slice = blob.slice(filePos, filePos + readSize);
            const buffer = await slice.arrayBuffer();
            
            const newBuffer = new Uint8Array(remainingBuffered + buffer.byteLength);
            newBuffer.set(currentBuffer.subarray(currentBufferOffset));
            newBuffer.set(new Uint8Array(buffer), remainingBuffered);
            
            filePos += buffer.byteLength;
            currentBuffer = newBuffer;
            currentBufferOffset = 0;
        }

        let lastSuccessfulFrameSize = 10000;

        async function readMsgPackPart() {
            await ensureBytes(9);
            const type = currentBuffer[currentBufferOffset];
            
            let estimatedSize = 1;
            if (type >= 0xa0 && type <= 0xbf) estimatedSize = 1 + (type & 0x1f);
            else if (type === 0xcb) estimatedSize = 9;
            else if (type === 0xcc) estimatedSize = 2;
            else if (type === 0xcd) estimatedSize = 3;
            else if (type === 0xce) estimatedSize = 5;
            else if (type === 0xd0) estimatedSize = 2;
            else if (type === 0xd1) estimatedSize = 3;
            else if (type === 0xd2) estimatedSize = 5;
            else if (type === 0xd9) {
                await ensureBytes(2);
                estimatedSize = 2 + currentBuffer[currentBufferOffset + 1];
            } else if (type === 0xda) {
                await ensureBytes(3);
                estimatedSize = 3 + ((currentBuffer[currentBufferOffset + 1] << 8) | currentBuffer[currentBufferOffset + 2]);
            } else if (type === 0xdb) {
                await ensureBytes(5);
                estimatedSize = 5 + (((currentBuffer[currentBufferOffset + 1] << 24) | (currentBuffer[currentBufferOffset + 2] << 16) | (currentBuffer[currentBufferOffset + 3] << 8) | currentBuffer[currentBufferOffset + 4]) >>> 0);
            } else {
                // Large objects like maps/arrays: start estimate with the size of the last successfully parsed object
                estimatedSize = Math.max(10000, lastSuccessfulFrameSize);
            }

            await ensureBytes(estimatedSize);
            
            while (true) {
                try {
                    const result = decodeMsgPackPart(currentBuffer, currentBufferOffset);
                    const bytesRead = result.bytesRead;
                    currentBufferOffset += bytesRead;
                    if (bytesRead > 100) {
                        lastSuccessfulFrameSize = bytesRead;
                    }
                    return result.value;
                } catch (err) {
                    if (err.message.includes("out of bounds") || err instanceof RangeError) {
                        // Protect RAM: if the entire remainder of the file has already been loaded,
                        // doubling estimatedSize and retrying will result in an infinite loop/OOM crash.
                        const remainingFileBytes = fileSize - filePos;
                        if (remainingFileBytes <= 0) {
                            throw new RangeError("Out of bounds: Truncated or corrupted session file");
                        }

                        estimatedSize *= 2;
                        if (estimatedSize > fileSize) {
                            throw err;
                        }
                        await ensureBytes(estimatedSize);
                    } else {
                        throw err;
                    }
                }
            }
        }

        // 3. Decode the Outer Map Header
        await ensureBytes(9);
        const mapType = currentBuffer[currentBufferOffset];
        let mapSize = 0;
        if (mapType >= 0x80 && mapType <= 0x8f) {
            mapSize = mapType & 0x0f;
            currentBufferOffset += 1;
        } else if (mapType === 0xde) {
            mapSize = (currentBuffer[currentBufferOffset + 1] << 8) | currentBuffer[currentBufferOffset + 2];
            currentBufferOffset += 3;
        } else if (mapType === 0xdf) {
            mapSize = ((currentBuffer[currentBufferOffset + 1] << 24) | (currentBuffer[currentBufferOffset + 2] << 16) | (currentBuffer[currentBufferOffset + 3] << 8) | currentBuffer[currentBufferOffset + 4]) >>> 0;
            currentBufferOffset += 5;
        } else {
            throw new Error("Invalid session file: outer object is not a Map.");
        }

        let settingsTSV = null;
        let cellSchema = CELL_SCHEMA;
        let numFrames = 0;

        // 4. Extract TSV Settings first to initialize the board
        for (let entry = 0; entry < mapSize; entry++) {
            if (simState.importSessionCancelled) break;
            const key = await readMsgPackPart();
            if (key === "schema_version") {
                const version = await readMsgPackPart();
                if (version < 3) throw new Error("Outdated session file version.");
            } else if (key === "cell_schema") {
                cellSchema = await readMsgPackPart();
            } else if (key === "settingsTSV") {
                settingsTSV = await readMsgPackPart();
                
                if (simState.optimizedHistoryFrames.size === 0) {
                    console.log("Loading settings from stream...");
                    await initializeBlankSlate();
                    importSettingsFromTSV(settingsTSV);
                    updateConfigFromUI(true);
                    
                    const newFileSeed = settingsTSV.split('\n').find(l => l.startsWith("Simulation_Seed"))?.split('\t')[1]?.trim();
                    simState.runTimestamp = newFileSeed || generateTimestamp();
                } else {
                    // Additive loading: Validate that Seed and Arena Radius match
                    const lines = settingsTSV.split('\n');
                    const fileSeed = lines.find(l => l.startsWith("Simulation_Seed"))?.split('\t')[1]?.trim();
                    const radiusLine = lines.find(l => l.startsWith("Arena_Radius"));
                    const fileRadius = radiusLine ? parseInt(radiusLine.split('\t')[1]?.trim(), 10) : null;
                    
                    const currentSeed = simulationSeedInput.value;
                    const currentRadius = simState.config.hexGridActualRadius;
                    
                    if (fileSeed !== currentSeed || (fileRadius !== null && fileRadius !== currentRadius)) {
                        throw new Error(`Session mismatch. The file's Seed (${fileSeed}) or Arena Radius (${fileRadius}) does not match the current Seed (${currentSeed}) or Arena Radius (${currentRadius}).`);
                    }
                }
            } else if (key === "history") {
                await ensureBytes(9);
                const arrayType = currentBuffer[currentBufferOffset];
                if (arrayType >= 0x90 && arrayType <= 0x9f) {
                    numFrames = arrayType & 0x0f;
                    currentBufferOffset += 1;
                } else if (arrayType === 0xdc) {
                    numFrames = (currentBuffer[currentBufferOffset + 1] << 8) | currentBuffer[currentBufferOffset + 2];
                    currentBufferOffset += 3;
                } else if (arrayType === 0xdd) {
                    numFrames = ((currentBuffer[currentBufferOffset + 1] << 24) | (currentBuffer[currentBufferOffset + 2] << 16) | (currentBuffer[currentBufferOffset + 3] << 8) | currentBuffer[currentBufferOffset + 4]) >>> 0;
                    currentBufferOffset += 5;
                } else {
                    throw new Error("Invalid session file: 'history' field is not an Array.");
                }

                console.log(`Stream-decoding ${numFrames} history frames directly to database...`);
                const db = await getDB();
                
                let batch = [];
                const batchSize = 100;

                for (let frameIndex = 0; frameIndex < numFrames; frameIndex++) {
                    if (simState.importSessionCancelled) {
                        // Write any pending batch to IndexedDB before stopping
                        if (batch.length > 0) {
                            const transaction = db.db.transaction("history", "readwrite");
                            const store = transaction.objectStore("history");
                            
                            for (const stepObj of batch) {
                                store.put({ step: stepObj.simulationStepCount, data: stepObj });
                            }

                            await new Promise((resolve, reject) => {
                                transaction.oncomplete = () => resolve();
                                transaction.onerror = (e) => reject(e.target.error);
                            });

                            batch = [];
                        }
                        break;
                    }

                    const optimizedStep = await readMsgPackPart();
                    batch.push(optimizedStep);
                    
                    const lightweightStep = { ...optimizedStep };
                    lightweightStep.isOffloaded = true;
                    lightweightStep.cells = [];
                    lightweightStep.attackerAiGrid = [];
                    lightweightStep.preyAiGrid = [];
                    lightweightStep.preyToxinNLGrid = [];
                    lightweightStep.preyToxinLGrid = [];
                    simState.optimizedHistoryFrames.set(optimizedStep.simulationStepCount, lightweightStep);

                    // If batch is full, or it is the last frame, write to IndexedDB in a single transaction
                    if (batch.length >= batchSize || frameIndex === numFrames - 1) {
                        const transaction = db.db.transaction("history", "readwrite");
                        const store = transaction.objectStore("history");
                        
                        for (const stepObj of batch) {
                            store.put({ step: stepObj.simulationStepCount, data: stepObj });
                        }

                        await new Promise((resolve, reject) => {
                            transaction.oncomplete = () => resolve();
                            transaction.onerror = (e) => reject(e.target.error);
                        });

                        batch = []; // Clear batch to free memory

                        // Update progress & yield control to prevent memory exhaustion and freeze
                        const percent = Math.round(((frameIndex + 1) / numFrames) * 100);
                        updateImportSessionProgress(percent, `Imported ${frameIndex + 1}/${numFrames} frames (${percent}%)`);
                        await new Promise(resolve => setTimeout(resolve, 0)); // Allows garbage collection & UI repaint
                    }
                }
            } else {
                await readMsgPackPart(); // Skip unknown key values
            }
        }

        console.log(`Successfully stream-loaded ${numFrames} frames directly into IndexedDB.`);

        // 5. Update UI to reflect loaded state
        simState.isInitialized = true;
        updateButtonStatesAndUI();
        updateRenderRangeInputs(true);
        updateTimeTravelSlider();
        
        // Find the very last step in our newly merged history to display
        const allKeys = [...simState.optimizedHistoryFrames.keys()];
        const lastStepKey = allKeys.length > 0 ? allKeys.reduce((a, b) => a > b ? a : b) : 0;
        const lastOptimizedState = await getHistoryFrame(lastStepKey);

        if (lastOptimizedState) {
            const lastRehydratedState = rehydrateOptimizedStep(lastOptimizedState);
            restoreSimStateFromHistoryObject(lastRehydratedState);
            updateUiFromState(lastRehydratedState);
            const targetRngCount = lastOptimizedState.rngDrawCountAtStep || 0;
            initializeSeededRNG(simulationSeedInput.value);
            synchronizeRNG(targetRngCount);
        } else {
            drawGrid();
            updateStats();
        }

        updateImportSessionProgress(null, null); // Hide progress indicator
        if (simState.importSessionCancelled) {
            await showInfoAlert("Import stopped. Loaded steps saved successfully!", "Stopped");
        } else {
            await showInfoAlert("Full simulation session loaded directly to DB successfully.", "Session Loaded");
        }

    } catch (e) {
        console.error("Failed to load session file:", e);
        updateImportSessionProgress(null, null);
        await showInfoAlert(`Error loading session: ${e.message}`, "Load Error");
    } finally {
        simState.isImportingSession = false;
        updateButtonStatesAndUI();
    }
}

	async function handleLoadArenaStateToManual() {
		if (!simState.capturedArenaStatesTSV || simState.capturedArenaStatesTSV.length === 0) {
			await showInfoAlert("No arena states available to load.", "Load Error");
			return;
		}

		const stepNumberStr = loadStepNumberInput.value; // Get value from the input field
		const stepNumber = parseInt(stepNumberStr);

		const minStep = parseInt(loadStepNumberInput.min); // Get min from the input's attribute
		const maxStep = parseInt(loadStepNumberInput.max); // Get max from the input's attribute

		if (isNaN(stepNumber) || stepNumber < minStep || stepNumber > maxStep) {
			await showInfoAlert(`Invalid step number. Please enter a number between ${minStep} and ${maxStep}.`, "Invalid Input");
			loadStepNumberInput.focus(); // Focus the input for easy correction
			return;
		}

		const tsvData = await getArenaStateFrame(stepNumber);
		const foundState = tsvData ? { step: stepNumber, tsvData: tsvData } : null;

		if (!foundState || !foundState.tsvData) {
			// This condition should ideally not be met if stepNumber is validated against min/max 
			// derived from actually available capturedArenaStatesTSV
			await showInfoAlert(`Arena state for step ${stepNumber} could not be retrieved. Please check the step number.`, "Load Error");
			return;
		}

		// 1. Reset simulation to a blank slate. This also calls updateConfigFromUI(true).
		await initializeBlankSlate();

		// 2. Explicitly activate manual setup mode
		simState.manualSetupActive = true;
		simState.selectedManualCellType = 'prey'; // Default placement tool
		updateButtonStatesAndUI(); // Update UI immediately to reflect manual mode and selected tool

		// 3. Use the existing import function for manual arena.
		importManualArenaFromTSV(foundState.tsvData); // This handles parsing and populating

		// 4. Close all modals
		reportModalOverlay.classList.add('hidden');
		graphModalOverlay.classList.add('hidden');
		presetsModalOverlay.classList.add('hidden');
		if (literatureModalOverlay) literatureModalOverlay.classList.add('hidden'); // New

		window.scrollTo({ top: canvasContainer.offsetTop - 20 || 0, behavior: 'smooth' });

		simulationErrorDisplay.textContent = `Arena from step ${stepNumber} loaded into Manual Placement mode.`;
		simulationErrorDisplay.classList.remove('hidden');
		simulationErrorDisplay.style.color = 'green';
		setTimeout(() => {
			simulationErrorDisplay.classList.add('hidden');
			simulationErrorDisplay.style.color = 'red'; // Reset color for actual errors
		}, 4000);
	}
	
	function importSettingsFromTSV(fileContent) {
		if (typeof parameterToElementIdMap === 'undefined') {
			console.error("CRITICAL: parameterToElementIdMap is not defined for settings import.");
			simulationErrorDisplay.textContent = "Error: Settings map not found.";
			simulationErrorDisplay.classList.remove('hidden');
			return; // Indicate failure or no action
		}

		const lines = fileContent.split('\n');
		const expectedHeader = "Parameter\tValue";
		let headerProcessed = false;
		let settingsImportedCount = 0;
		let failedParseCount = 0;
	    const importStatusDiv = document.getElementById('importStatusMessage');

		// Clear previous messages and errors
		if (importStatusDiv) importStatusDiv.innerHTML = '';

		let radiusPotentiallyChanged = false;

		simulationErrorDisplay.classList.add('hidden');

		for (const line of lines) {
			const trimmedLine = line.trim();
			if (!trimmedLine || trimmedLine.startsWith("#")) continue;

			if (!headerProcessed) {
				if (trimmedLine.toLowerCase() === expectedHeader.toLowerCase()) {
					headerProcessed = true;
					continue;
				} else {
					simulationErrorDisplay.textContent = "Invalid settings TSV header. Expected 'Parameter\tValue'.";
					simulationErrorDisplay.classList.remove('hidden');
					console.error("Invalid TSV header for settings import. Found: ", trimmedLine);
					return;
				}
			}

			const parts = trimmedLine.split('\t');
			if (parts.length === 2) {
				let paramName = parts[0].trim();
				let valueFromFile = parts[1].trim();

				// Convert legacy parameters
				if (paramName === "Prey_Toxin_QS_Regulated") {
					paramName = "Prey_Toxin_Trigger_Mode";
					valueFromFile = (valueFromFile.toLowerCase() === 'true' || valueFromFile === '1') ? 'qs' : 'standard';
				} else if (paramName === "Prey_Toxin_Activation_Mode") {
					paramName = "Prey_Toxin_Trigger_Mode";
					if (valueFromFile === 'constitutive' || valueFromFile === 'stochastic') {
						valueFromFile = 'standard';
					} else if (valueFromFile === 'toxin') {
						valueFromFile = 'attacker';
					}
				}

				const elementId = parameterToElementIdMap[paramName];

				if (elementId) {
					const element = document.getElementById(elementId);
					if (element) {
						updateInputElement(elementId, valueFromFile, true);
						settingsImportedCount++;
						if (elementId === 'arenaGridRadiusInput') {
							radiusPotentiallyChanged = true;
						}
					} else {
						console.warn(`Import: Element ID "${elementId}" not found for parameter "${paramName}".`);
						failedParseCount++;
					}
				} else {
					console.warn(`Import: Unknown parameter "${paramName}" in settings file.`);
					failedParseCount++;
				}
			} else {
				console.warn(`Import: Skipping malformed line in settings TSV: "${trimmedLine}".`);
				failedParseCount++;
			}
		}

		if (!headerProcessed && lines.filter(l => l.trim() && !l.startsWith("#")).length > 0) {
			simulationErrorDisplay.textContent = "Settings TSV file seems to be missing the header or is empty.";
			simulationErrorDisplay.classList.remove('hidden');
			return;
		}

		if (importStatusDiv && (settingsImportedCount > 0 || failedParseCount > 0)) {
			let message = `Successfully recognized ${settingsImportedCount} parameters.`;
			let messageColor = 'text-green-600';

			if (failedParseCount > 0) {
				message += ` (Could not parse ${failedParseCount}).`;
				messageColor = 'text-yellow-700';
			}
			
			importStatusDiv.textContent = message;
			importStatusDiv.className = `text-xs text-center mt-2 ${messageColor}`;

			setTimeout(() => { if (importStatusDiv) importStatusDiv.innerHTML = ''; }, 6000);
		}
	
		if (settingsImportedCount > 0) {
			const seedFromSettings = simulationSeedInput.value;
			initializeSeededRNG(seedFromSettings);
			updateConfigFromUI(true);
			drawGrid();
			updateStats();
			updateButtonStatesAndUI();
			console.log(`${settingsImportedCount} settings imported. Config updated.`);
		} else if (headerProcessed) {
			simulationErrorDisplay.textContent = "No valid settings were found or applied from the file.";
			simulationErrorDisplay.classList.remove('hidden');
		}
	}
	
	importSettingsButton.addEventListener('click', () => {
		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.accept = '.tsv,text/tab-separated-values';

		fileInput.onchange = e => {
			const file = e.target.files[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = (event) => {
					try {
						importSettingsFromTSV(event.target.result);
					} catch (error) {
						// This catch is for unexpected errors during the import process itself
						console.error("Critical error during settings import process:", error);
						simulationErrorDisplay.textContent = `Critical error importing settings: ${error.message}. Check console.`;
						simulationErrorDisplay.classList.remove('hidden');
					}
				};
				reader.onerror = (error) => {
					console.error("Error reading settings file:", error);
					simulationErrorDisplay.textContent = "Error reading settings file.";
					simulationErrorDisplay.classList.remove('hidden');
				};
				reader.readAsText(file);
			}
		};
		fileInput.click();
	});
	
	// New: Function to import arena state for manual placement
	function importManualArenaFromTSV(fileContent) {
		if (!simState.manualSetupActive) {
			console.warn("Arena import attempted outside of manual setup mode.");
			simulationErrorDisplay.textContent = "Arena import is only available during manual placement.";
			simulationErrorDisplay.classList.remove('hidden');
			setTimeout(() => simulationErrorDisplay.classList.add('hidden'), 3000);
			return;
		}
		console.log("Importing manual arena state...");

		let placedCount = 0;
		let failedCount = 0;
		const statusDiv = document.getElementById('arenaImportStatusMessage');
		if(statusDiv) statusDiv.innerHTML = ''; // Clear previous messages

		const lines = fileContent.split('\n');
		const expectedHeader = "q\tr\ttype";
		let headerProcessed = false;

		for (const line of lines) {
			const trimmedLine = line.trim();
			if (!trimmedLine) continue; // Skip empty lines

			if (!headerProcessed) {
				if (trimmedLine.toLowerCase() === expectedHeader.toLowerCase()) {
					headerProcessed = true;
					continue;
				} else {
					simulationErrorDisplay.textContent = "Invalid TSV header. Expected 'q	r	type'.";
					simulationErrorDisplay.classList.remove('hidden');
					console.error("Invalid TSV header for arena import.");
					// Optional: clear cells again if some were added before header check failed, though unlikely here.
					simState.cells.clear();
					drawGrid(); updateStats(); updateButtonStatesAndUI();
					return;
				}
			}

			const parts = trimmedLine.split('\t');
			if (parts.length === 3) {
				const q = parseInt(parts[0]);
				const r = parseInt(parts[1]);
				const type = parts[2].trim().toLowerCase();

				if (!isNaN(q) && !isNaN(r) && ['attacker', 'prey', 'defender', 'barrier'].includes(type)) {
					if (isWithinHexBounds(q, r, simState.config.hexGridActualRadius)) {
						const key = `${q},${r}`;
						// It's good practice to remove any cell that might be at the target location already
						// if multiple lines in TSV try to define the same spot. Last one wins.
						simState.cells.delete(key);
						const cell = new Cell(q, r, type, `${type}-${simState.nextCellId++}`);
						simState.cells.set(key, cell);
						placedCount++;
					} else {
						console.warn(`Cell at ${q},${r} is out of bounds for current arena radius.`);
						failedCount++;

					}
				} else {
					console.warn(`Invalid cell data in TSV: q=${parts[0]}, r=${parts[1]}, type=${parts[2]}`);
					failedCount++;
				}
			} else {
				 console.warn(`Skipping malformed TSV line for arena import: ${trimmedLine}`);
 				 failedCount++;
			}
		}

		if (!headerProcessed && lines.filter(l => l.trim()).length > 0) {
			 simulationErrorDisplay.textContent = "TSV file for arena import seems to be missing the header 'q	r	type'.";
			 simulationErrorDisplay.classList.remove('hidden');
			 simState.cells.clear(); // Clear any partially imported cells
		}

		// New: Display the summary message
		if (statusDiv && (placedCount > 0 || failedCount > 0)) {
			let message = `Placed ${placedCount} cells.`;
			let messageColor = 'text-green-600';
			if (failedCount > 0) {
				message += ` (${failedCount} positions failed).`;
				messageColor = 'text-yellow-700';
			}
			statusDiv.textContent = message;
			statusDiv.className = `text-xs text-center mt-2 ${messageColor}`;
			setTimeout(() => { if (statusDiv) statusDiv.innerHTML = ''; }, 6000);
		}

		drawGrid();
		updateStats();
		updateButtonStatesAndUI(); // Crucial to update button states like 'Clear All' or 'Finalize'
		console.log("Arena state imported into manual placement mode.");
	}

	// New: Event listener for importing arena state in manual mode
	importManualArenaButton.addEventListener('click', () => {
		if (!simState.manualSetupActive) return;
		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.accept = '.tsv,text/tab-separated-values';
		fileInput.onchange = e => {
			const file = e.target.files[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = (event) => {
					try {
						importManualArenaFromTSV(event.target.result);
					} catch (error) {
						console.error("Error importing manual arena:", error);
						simulationErrorDisplay.textContent = `Error importing arena: ${error.message}`;
						simulationErrorDisplay.classList.remove('hidden');
					}
				};
				reader.onerror = (error) => {
					console.error("Error reading arena file:", error);
					simulationErrorDisplay.textContent = "Error reading arena file.";
					simulationErrorDisplay.classList.remove('hidden');
				};
				reader.readAsText(file);
			}
		};
		fileInput.click();
	});

	// New: Event listener for exporting current arena state in manual mode
	exportManualArenaButton.addEventListener('click', async () => {
		if (!simState.manualSetupActive || simState.cells.size === 0) return;
		const tsvContent = captureCurrentArenaStateTSV(simState.cells);
		const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
		const link = document.createElement("a");
		if (link.download !== undefined) {
			const url = URL.createObjectURL(blob);
			link.setAttribute("href", url);
			link.setAttribute("download", "manual_arena_layout.tsv");
			link.style.visibility = 'hidden';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		} else {
			await showInfoAlert("TSV download not supported by your browser.", "Download Not Supported");
		}
	});

	if (exportSettingsButtonMain) {
		exportSettingsButtonMain.addEventListener('click', downloadSettingsAsTSV);
	}

	if (renderFromHistoryButton) {
		renderFromHistoryButton.addEventListener('click', renderImagesFromHistory);
	}
	if (cancelRenderButton) {
		cancelRenderButton.addEventListener('click', () => {
			simState.renderCancelled = true;
			cancelRenderButton.disabled = true;
			cancelRenderButton.textContent = "Stopping...";
		});
	}

	resetSimulationButton.addEventListener('click', async () => {
		try {
			await showConfirmationModal("Are you sure you want to reset the simulation? This will generate a new random seed and clear the arena.", "Reset Simulation?", "Reset");
			
			const newSeed = generateNewSeed();
			simulationSeedInput.value = newSeed;
			
			simState.areCellsInSync = true; // A full reset always results in a synced state
			await resetSimulationState(); // This will call initializeSeedenRNG and update buttons

		} catch (e) {
			console.log("Arena reset cancelled by user.");
		}
	});

	newSeedButton.addEventListener('click', () => {
		const newSeed = generateNewSeed();
		simulationSeedInput.value = newSeed;
		simulationSeedInput.dispatchEvent(new Event('change'));
	});


	window.addEventListener('resize', () => {
		if (!simState.isRunning) { 
			const oldLogicalRadius = simState.config.hexGridActualRadius; 
			updateConfigFromUI(true); 
			if (simState.manualSetupActive) simState.config.hexGridActualRadius = oldLogicalRadius; 

			updateMainCanvasSizing();
			drawGrid();
		} else { 
			updateMainCanvasSizing();
			drawGrid();
		}
	});

	function formatCellProperty(label, value) {
		let displayValue = value;
		if (typeof value === 'boolean') {
			displayValue = value ? 'Yes' : 'No';
		} else if (typeof value === 'number' && !Number.isInteger(value)) {
			displayValue = value.toFixed(2);
		} else if (value === null || value === undefined) {
			displayValue = 'N/A';
		}
		return `<div><span class="font-medium">${label}:</span> ${displayValue}</div>`;
	}

function updateHoverInfoPanel(q_coord, r_coord, rawStateSource) {
    if (!hoverInfoPanel || !rawStateSource) return;

    const simpleKey = `${q_coord},${r_coord}`;
    let infoHtml = `<div class="font-bold mb-1">Hex (q: ${q_coord}, r: ${r_coord})</div>`;

    if (!isWithinHexBounds(q_coord, r_coord, simState.config.hexGridActualRadius)) {
        infoHtml += "<div>Out of bounds</div>";
        hoverInfoPanel.innerHTML = infoHtml;
        simState.lastHoveredHexKey = null;
        return;
    }

    simState.lastHoveredHexKey = simpleKey;

    // --- This part is robust and correct ---
    let attackerAiGrid, preyAiGrid, preyToxinNLGrid, preyToxinLGrid;
    const sourceForGrids = rawStateSource.state || rawStateSource;

    if (sourceForGrids.attackerAiGrid instanceof Map) {
        attackerAiGrid = sourceForGrids.attackerAiGrid;
    } else if (Array.isArray(sourceForGrids.attackerAiGrid)) {
        attackerAiGrid = new Map(sourceForGrids.attackerAiGrid);
    } else {
        attackerAiGrid = new Map(Object.entries(sourceForGrids.attackerAiGrid || {}));
    }
    if (sourceForGrids.preyAiGrid instanceof Map) {
        preyAiGrid = sourceForGrids.preyAiGrid;
    } else if (Array.isArray(sourceForGrids.preyAiGrid)) {
        preyAiGrid = new Map(sourceForGrids.preyAiGrid);
    } else {
        preyAiGrid = new Map(Object.entries(sourceForGrids.preyAiGrid || {}));
    }
    
    // Non-Lytic Toxin Grid
    const rawNL = sourceForGrids.preyToxinNLGrid || sourceForGrids.preyToxinGrid;
    if (rawNL instanceof Map) {
        preyToxinNLGrid = rawNL;
    } else if (Array.isArray(rawNL)) {
        preyToxinNLGrid = new Map(rawNL);
    } else {
        preyToxinNLGrid = new Map(Object.entries(rawNL || {}));
    }

    // Lytic Toxin Grid
    const rawL = sourceForGrids.preyToxinLGrid;
    if (rawL instanceof Map) {
        preyToxinLGrid = rawL;
    } else if (Array.isArray(rawL)) {
        preyToxinLGrid = new Map(rawL);
    } else {
        preyToxinLGrid = new Map(Object.entries(rawL || {}));
    }

    const attackerAiConc = attackerAiGrid.get(simpleKey) || 0;
    const preyAiConc = preyAiGrid.get(simpleKey) || 0;
    const preyToxinNLConc = preyToxinNLGrid.get(simpleKey) || 0;
    const preyToxinLConc = preyToxinLGrid.get(simpleKey) || 0;

    infoHtml += formatCellProperty("Attacker AI", attackerAiConc);
    infoHtml += formatCellProperty("Prey AI", preyAiConc);
    infoHtml += formatCellProperty("Prey NL Toxin", preyToxinNLConc);
    infoHtml += formatCellProperty("Prey L Toxin", preyToxinLConc);

    const cellsDataSource = rawStateSource.state ? rawStateSource.state.cells : rawStateSource.cells;
    let plainCellData = null;

    if (cellsDataSource instanceof Map) {
        plainCellData = cellsDataSource.get(simpleKey);
    } else if (Array.isArray(cellsDataSource)) {
        const cellSchema = rawStateSource.cell_schema || CELL_SCHEMA;
        const foundCellData = cellsDataSource.find(c => {
            if (Array.isArray(c)) {
                return c[cellSchema.indexOf('q')] === q_coord && c[cellSchema.indexOf('r')] === r_coord;
            } else { return c.q === q_coord && c.r === r_coord; }
        });
        if (foundCellData) {
            plainCellData = {};
            if (Array.isArray(foundCellData)) {
                cellSchema.forEach((key, index) => { plainCellData[key] = foundCellData[index]; });
            } else { plainCellData = foundCellData; }
        }
    }

    // --- Display Logic ---
    if (plainCellData) {
        const cell = plainCellData;
        const cellTypeStr = typeof cell.type === 'number' ? INT_TO_TYPE[cell.type] : cell.type; // This is the correct variable to use for checks
        const cellIdNum = cell.id_num !== undefined ? cell.id_num : (cell.id || 'err').split('-').pop();

        infoHtml += `<div class="mt-1.5 pt-0.5 border-t border-gray-200"></div>`;
        infoHtml += formatCellProperty("Cell ID", `${cellTypeStr}-${cellIdNum}`);
        infoHtml += formatCellProperty("Type", cellTypeStr);

        if (cellTypeStr !== 'barrier') {
            infoHtml += formatCellProperty("Dead", cell.isDead);
            infoHtml += formatCellProperty("Lysing", cell.isLysing);
            if (cell.isLysing) infoHtml += formatCellProperty("Lysis Timer", cell.lysisTimer);
            infoHtml += formatCellProperty("Eff. Gone", cell.isEffectivelyGone);
            infoHtml += formatCellProperty("Repl. CD", cell.replicationCooldown);
            infoHtml += formatCellProperty("Move CD", cell.movementCooldown);
            infoHtml += formatCellProperty("NL Toxins", cell.accumulatedNonLyticToxins);
            infoHtml += formatCellProperty("L Toxins", cell.accumulatedLyticToxins);
            infoHtml += formatCellProperty("Prey NL Toxins", (cell.accumulatedPreyToxinNL || 0).toFixed(2));
            infoHtml += formatCellProperty("Prey L Toxins", (cell.accumulatedPreyToxinL || 0).toFixed(2));
            
            // FIX: Use cellTypeStr in all following checks
            if (cellTypeStr === 'attacker' || cellTypeStr === 'defender') {
                infoHtml += formatCellProperty("Kills", cell.kills || 0);
                infoHtml += formatCellProperty("Lyses", cell.lyses || 0);
            }

            if (cellTypeStr === 'attacker') {
                infoHtml += formatCellProperty("T6SS Fire CD", cell.t6ssFireCooldownTimer);
                const qsConfig = simState.config.attacker.qs;
                const K_val = qsConfig.midpoint;
                const n_val = qsConfig.cooperativity;
                let p_active_hover = 0.0;
                if (K_val < 0) { p_active_hover = 1.0; } 
                else if (K_val === 0) { p_active_hover = (attackerAiConc > 0) ? 1.0 : 0.0; }
                else {
                    const K_pow_n = Math.pow(K_val, n_val);
                    const AI_pow_n = Math.pow(attackerAiConc, n_val);
                    if ((K_pow_n + AI_pow_n) !== 0) { p_active_hover = AI_pow_n / (K_pow_n + AI_pow_n); }
                }
                if (Number.isNaN(p_active_hover)) p_active_hover = 0.0;
                infoHtml += formatCellProperty("QS P(active)", p_active_hover.toFixed(3));

            } else if (cellTypeStr === 'defender') {
                infoHtml += formatCellProperty("Rand. Fire CD", cell.t6ssRandomFireCooldownTimer);
                infoHtml += formatCellProperty("Retaliating", cell.isRetaliating);
                if (cell.isRetaliating) {
                    infoHtml += formatCellProperty("Ret. Target", cell.retaliationTargetKey);
                    infoHtml += formatCellProperty("Ret. Left", cell.retaliationsRemainingThisBurst);
                }
                if (cell.sensedAttackFromKey) infoHtml += formatCellProperty("Sensed From", cell.sensedAttackFromKey);

            } else if (cellTypeStr === 'prey') {
                infoHtml += formatCellProperty("Capsule Layers", cell.capsuleLayers);
                if (cell.isFormingCapsule) {
                    infoHtml += formatCellProperty("Capsule CD", cell.capsuleCooldown);
                }
                const capsuleConfig = simState.config.prey.capsule;
                if (capsuleConfig.isEnabled) {
                    let p_synthesis_hover = 0.0;
                    const K_cap = capsuleConfig.midpoint;
                    const n_cap = capsuleConfig.cooperativity;
                    if (K_cap < 0) { p_synthesis_hover = 1.0; }
                    else if (K_cap === 0) { p_synthesis_hover = (preyAiConc > 0) ? 1.0 : 0.0; }
                    else {
                        const K_pow_n_cap = Math.pow(K_cap, n_cap);
                        const AI_pow_n_cap = Math.pow(preyAiConc, n_cap);
                        if ((K_pow_n_cap + AI_pow_n_cap) > 0) { p_synthesis_hover = AI_pow_n_cap / (K_pow_n_cap + AI_pow_n_cap); }
                    }
                    if (Number.isNaN(p_synthesis_hover)) p_synthesis_hover = 0.0;
                    infoHtml += formatCellProperty("Capsule P(Derepression)", p_synthesis_hover.toFixed(3));
                }
                const toxinQSConfig = simState.config.prey.toxinQS;
                if (toxinQSConfig && toxinQSConfig.isRegulated) {
                    let p_toxin_hover = 0.0;
                    const K_tox = toxinQSConfig.midpoint;
                    const n_tox = toxinQSConfig.cooperativity;
                    if (K_tox < 0) { p_toxin_hover = 1.0; }
                    else if (K_tox === 0) { p_toxin_hover = (preyAiConc > 0) ? 1.0 : 0.0; }
                    else {
                        const K_pow_n_tox = Math.pow(K_tox, n_tox);
                        const AI_pow_n_tox = Math.pow(preyAiConc, n_tox);
                        if ((K_pow_n_tox + AI_pow_n_tox) > 0) { p_toxin_hover = AI_pow_n_tox / (K_pow_n_tox + AI_pow_n_tox); }
                    }
                    if (Number.isNaN(p_toxin_hover)) p_toxin_hover = 0.0;
                    infoHtml += formatCellProperty("Toxin P(synthesis)", p_toxin_hover.toFixed(3));
                }
                infoHtml += formatCellProperty("Toxin Producer", cell.isPreyToxinProducer);
                if (cell.isPreyToxinProducer) {
                    if (simState.config.prey.releaseOnLysis) {
                        infoHtml += formatCellProperty("Internal NL Toxin", cell.internalPreyToxinNL || 0);
                        infoHtml += formatCellProperty("Internal L Toxin", cell.internalPreyToxinL || 0);
                        infoHtml += formatCellProperty("Lysis Threshold", cell.preyToxinLysisThreshold || 1000);
                    } else {
                        infoHtml += formatCellProperty("Toxin Produced", Math.round(cell.continuousToxinProduced || 0));
                        infoHtml += formatCellProperty("Max Production", cell.preyToxinLysisThreshold || 1000);
                    }
                }
            }
        }
    } else {
        infoHtml += "<div>(No cell)</div>";
    }
    hoverInfoPanel.innerHTML = infoHtml;
}

async function handleCanvasHover(event) {
    if ((!simState.isInitialized && !simState.manualSetupActive) || !hoverInfoPanel) {
        if (hoverInfoPanel) hoverInfoPanel.innerHTML = 'Initialize simulation first ...';
        simState.lastHoveredHexKey = null;
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    simState.lastMouseX = x;
    simState.lastMouseY = y;

    const { q, r } = pixelToAxial(x, y, simState.config.hexRadius, simState.offsetX, simState.offsetY);

    let stateSourceForInspector = simState; // Default to the live state

    // Determine the correct source of data for the inspector without rehydrating
    if (simState.isScrubbing) {
        const slider = document.getElementById('timeTravelSlider');
        const stepIndex = parseInt(slider.value);
        stateSourceForInspector = await getHistoryFrame(stepIndex);
    } else if (simState.isRunning && simState.optimizedHistoryFrames.size > 0) {
        const allKeys = [...simState.optimizedHistoryFrames.keys()];
        const lastStepKey = allKeys.length > 0 ? allKeys.reduce((a, b) => a > b ? a : b) : 0;
        stateSourceForInspector = await getHistoryFrame(lastStepKey);
    }
    
    // Pass the raw (or live) state source directly to the inspector
    if (stateSourceForInspector) {
        updateHoverInfoPanel(q, r, stateSourceForInspector);
    }
}

	canvas.addEventListener('mousemove', handleCanvasHover);

	// Ensure your mouseleave event is also clearing lastHoveredHexKey
	canvas.addEventListener('mouseleave', () => {
		if (hoverInfoPanel) {
			hoverInfoPanel.innerHTML = 'Mouse over the arena ...';
		}
		simState.lastHoveredHexKey = null; // Clear the stored key
		simState.lastMouseX = null;
		simState.lastMouseY = null;

	});

	// --- Keyboard Shortcuts for Simulation Control ---
    document.addEventListener('keydown', (event) => {
        // Do nothing if the user is typing in an input field.
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        // Do nothing if a modal is open.
        const isModalOpen = !reportModalOverlay.classList.contains('hidden') ||
                            !helpModalOverlay.classList.contains('hidden') ||
                            !literatureModalOverlay.classList.contains('hidden') ||
                            !graphModalOverlay.classList.contains('hidden') ||
                            !presetsModalOverlay.classList.contains('hidden');
        if (isModalOpen) {
            return;
        }
	    // Ignore shortcuts if Ctrl, Alt, or Meta (Cmd) keys are pressed.
		if (event.ctrlKey || event.metaKey || event.altKey) {
			return;
		}

        // Use toLowerCase() for letter keys to make them case-insensitive.
        // The .key property for arrow keys is "ArrowLeft", which becomes "arrowleft".
        switch (event.key.toLowerCase()) {
            case 's': // S for Start
                if (!startButton.disabled) {
                    event.preventDefault();
                    startButton.click();
                }
                break;

            case 'p': // P for Pause
                if (!pauseButton.disabled) {
                    event.preventDefault();
                    pauseButton.click();
                }
                break;
            
            case 'r': // R for Report (Stop & Report)
                if (!stopButton.disabled) {
                    event.preventDefault();
                    stopButton.click();
                }
                break;

            case 'o': // O for One Step Forward
                if (!stepButton.disabled) {
                    event.preventDefault();
                    stepButton.click();
                }
                break;

            // New shortcuts for Time-Travel controls
            case 'arrowleft':
                if (!historyStepBackButton.disabled) {
                    event.preventDefault();
                    historyStepBackButton.click();
                }
                break;

            case 'arrowright':
                if (!historyStepForwardButton.disabled) {
                    event.preventDefault();
                    historyStepForwardButton.click();
                }
                break;
        }
    });
	function setupTooltips() {
		const controlPanel = document.querySelector('.control-panel');
		if (!controlPanel) return;

		document.querySelectorAll('.tooltip-trigger').forEach(trigger => {
			const tooltip = trigger.querySelector('.tooltip-content');
			if (!tooltip) return;

			trigger.addEventListener('mouseenter', () => {
				// Get the positions of the trigger text and the scrolling panel
				const triggerRect = trigger.getBoundingClientRect();
				const panelRect = controlPanel.getBoundingClientRect();
				
				// Calculate the 'top' position for the tooltip.
				// It's the trigger's top, minus the panel's top, plus the scroll amount,
				// minus the tooltip's own height, minus a 10px gap.
				const newTop = (triggerRect.top - panelRect.top) + controlPanel.scrollTop - tooltip.offsetHeight - 10;

				tooltip.style.top = `${newTop}px`;
			});
		});
	}

document.getElementById('saveAllArchivesButton').addEventListener('click', handleSaveAllData);

async function initializeSimulationCore() {
    // --- Step 1: Initial UI & State Setup ---
    setupTooltips();

	applySettingsObject(SIMULATION_DEFAULTS); // Apply master defaults to the UI
	updateConfigFromUI(true); // Sync simState.config to the UI
	
	// Event Listeners for the new buttons and seed input
	resetRngButton.addEventListener('click', () => {
		if (resetRngButton.disabled) return;
		console.log("RNG sequence reset for current seed.");
		initializeSeededRNG(simulationSeedInput.value);

		if (simState.cells.size > 0) {
			simState.areCellsInSync = false;
			updateSyncAndRngButtons();
		}
	});

	resyncCellsButton.addEventListener('click', () => {
		if (resyncCellsButton.disabled) return;
		reinitializeAllCellStates();
	});

	simulationSeedInput.addEventListener('change', (event) => {
		const newSeed = event.target.value;
		console.log(`Seed changed manually to: ${newSeed}`);
		initializeSeededRNG(newSeed);

		if (simState.cells.size > 0) {
			simState.areCellsInSync = false;
			updateSyncAndRngButtons();
		}
	});

	if (resetSettingsToDefaultsButton) {
		resetSettingsToDefaultsButton.addEventListener('click', async () => {
			if (simState.isRunning) return; // Don't allow while running

			try {
				// Ask for confirmation
				await showConfirmationModal(
					"This will reset all parameters to their default values. It will NOT clear the arena or change the current seed. Are you sure?",
					"Reset All Settings?",
					"Reset"
				);
			} catch (e) {
				console.log("Reset settings cancelled.");
				return; // User cancelled
			}

			// 1. Apply the default settings object to the UI
			applySettingsObject(SIMULATION_DEFAULTS);
			
			// 2. Read the new UI values back into simState.config
			updateConfigFromUI(true);

			// 3. Mark cells as out of sync
			//    This is crucial because parameters like replication/movement time
			//    have changed, so the cells' internal states are no longer valid.
			if (simState.cells.size > 0) {
				simState.areCellsInSync = false;
				updateSyncAndRngButtons();
			}
			
			// 4. Redraw the grid (in case arena radius changed) and update stats
			drawGrid();
			updateStats();

			// 5. Show a temporary confirmation message
			const importStatusMessage = document.getElementById('importStatusMessage');
			if (importStatusMessage) {
				importStatusMessage.textContent = 'All settings have been reset to default values.';
				importStatusMessage.className = 'text-xs text-center mt-2 text-green-600';
				setTimeout(() => { if (importStatusMessage) importStatusMessage.innerHTML = ''; }, 4000);
			}
		});
	}


    const initialSeed = generateNewSeed();
    simulationSeedInput.value = initialSeed;
    initializeSeededRNG(initialSeed);

    await initializeBlankSlate();
    simState.manualSetupActive = true;
    updateButtonStatesAndUI();

    // --- Step 2: Attach All Event Listeners ---
    // By attaching listeners here, they are always active regardless of URL params.
    const timeTravelSlider = document.getElementById('timeTravelSlider');
    const historyStepBackButton = document.getElementById('historyStepBackButton');
	const historyStepForwardButton = document.getElementById('historyStepForwardButton');
    if(timeTravelSlider) {
		timeTravelSlider.addEventListener('input', handleTimeTravelScrub);
	}

	if(historyStepBackButton) historyStepBackButton.addEventListener('click', () => {
		const currentValue = parseInt(timeTravelSlider.value, 10);
		const allKeys = [...simState.optimizedHistoryFrames.keys()].sort((a, b) => a - b);
		// Find the largest key that is less than currentValue
		const prevKey = allKeys.reverse().find(k => k < currentValue);
		if (prevKey !== undefined) {
			timeTravelSlider.value = prevKey;
			// Manually trigger the 'input' event to update everything
			timeTravelSlider.dispatchEvent(new Event('input', { bubbles: true }));
		}
	});

	if(historyStepForwardButton) historyStepForwardButton.addEventListener('click', () => {
		const currentValue = parseInt(timeTravelSlider.value, 10);
		const allKeys = [...simState.optimizedHistoryFrames.keys()].sort((a, b) => a - b);
		// Find the smallest key that is greater than currentValue
		const nextKey = allKeys.find(k => k > currentValue);
		if (nextKey !== undefined) {
			timeTravelSlider.value = nextKey;
			// Manually trigger the 'input' event to update everything
			timeTravelSlider.dispatchEvent(new Event('input', { bubbles: true }));
		}
	});

	const exportStepButton = document.getElementById('exportCurrentStepStateButton');
	if (exportStepButton) {
		exportStepButton.addEventListener('click', exportCurrentStepState);
	}
	const importStepButton = document.getElementById('importStepStateButton');
	if (importStepButton) {
		importStepButton.addEventListener('click', importStepStateFromFile);
	}
	
	const resumeButton = document.getElementById('resumeFromStateButton');
	if(resumeButton) resumeButton.addEventListener('click', restoreStateForResume);
	const saveSessionButton = document.getElementById('saveSessionButton');
	if(saveSessionButton) saveSessionButton.addEventListener('click', saveFullSimulationToFile);
	const loadSessionButton = document.getElementById('loadSessionButton');
	if(loadSessionButton) {
		loadSessionButton.addEventListener('click', () => {
			const fileInput = document.createElement('input');
			fileInput.type = 'file';
			fileInput.accept = '.bft6,application/octet-stream';
			fileInput.onchange = e => {
				const file = e.target.files[0];
				if(file) {
					loadFullSimulationFromFile(file);
				}
			};
			fileInput.click();
		});
	}
	if (cancelImportSessionButton) {
		cancelImportSessionButton.addEventListener('click', () => {
			simState.importSessionCancelled = true;
			cancelImportSessionButton.disabled = true;
			cancelImportSessionButton.textContent = "Stopping...";
		});
	}

	const playHistoryButton = document.getElementById('playHistoryButton');
	const stopHistoryButton = document.getElementById('stopHistoryButton');
	if (playHistoryButton) {
		playHistoryButton.addEventListener('click', playHistory);
	}
	if (stopHistoryButton) {
		stopHistoryButton.addEventListener('click', stopHistory);
	}

    // --- Step 3: URL Parameter Processing ---
    const urlParams = new URLSearchParams(window.location.search);
    const sessionURL = urlParams.get('sessionFileURL');

    if (sessionURL) {
        // High priority: Load session and then stop.
        console.log(`High priority: Loading session from URL: ${sessionURL}`);
        const fileContent = await fetchFileContent(sessionURL, "Session (.bft6)", 'arrayBuffer');
        if (fileContent) {
            loadFullSimulationFromFile(fileContent);
        }
    } else {
        // Standard parameter processing (only if no sessionFileURL)
        console.log("No sessionFileURL found, processing other URL parameters...");
        let configModifiedByUrl = false;
        let hasExplicitCellCounts = false;
		
        urlParams.forEach((value, key) => {
            if (key === 'preset') {
                applyPresetByName(value);
                configModifiedByUrl = true;
            } else {
                const elementId = parameterToElementIdMap[key];
                if (elementId) {
                    updateInputElement(elementId, value, true);
                    configModifiedByUrl = true;
                    if (key.includes('Initial_Count')) hasExplicitCellCounts = true;
                } else if (key === 'settingsFileURL' || key === 'arenaFileURL' || key === 'cellsData') {
                     // These will be handled below to ensure order, but mark as modified
                     configModifiedByUrl = true;
                }
            }
        });

        if (urlParams.has('settingsFileURL')) {
            const fileContent = await fetchFileContent(urlParams.get('settingsFileURL'), 'settingsFileURL', 'text');
            if (fileContent) importSettingsFromTSV(fileContent);
        }
        if (urlParams.has('arenaFileURL')) {
            const fileContent = await fetchFileContent(urlParams.get('arenaFileURL'), 'arenaFileURL', 'text');
            if (fileContent) {
                 simState.manualSetupActive = true;
                 importManualArenaFromTSV(fileContent);
                 simState.manualSetupActive = false;
            }
        }
        if (urlParams.has('cellsData')) {
            const value = urlParams.get('cellsData');
            if (value) {
                updateConfigFromUI(true);
                const { operations } = parseQrCellString(value);
                operations.forEach(op => {
                    if (isWithinHexBounds(op.q, op.r, simState.config.hexGridActualRadius)) {
                        const key = `${op.q},${op.r}`;
                        if (op.action === 'remove') {
                            simState.cells.delete(key);
                        } else {
                            simState.cells.set(key, new Cell(op.q, op.r, op.type, `${op.type}-qrurl-${simState.nextCellId++}`));
                        }
                    }
                });
            }
        }

        if (configModifiedByUrl) {
            console.log("Finalizing UI state after processing URL parameters.");

            if (!hasExplicitCellCounts && simState.activePresetConfig && simState.activePresetConfig.group && simState.activePresetConfig.group !== 'custom') {
                const currentRadius = parseInt(arenaGridRadiusInput.value, 10);
                if (!isNaN(currentRadius)) {
                    // Update the active preset config to use the final parsed radius
                    simState.activePresetConfig.brArenaRadius = currentRadius;
                    simState.activePresetConfig.densityArenaRadius = currentRadius;
                    simState.activePresetConfig.defenseArenaRadius = currentRadius;
                    simState.activePresetConfig.movementArenaRadius = currentRadius;
                    simState.activePresetConfig.preyToxinArenaRadius = currentRadius;
                    simState.activePresetConfig.titfortatArenaRadius = currentRadius;
                    simState.activePresetConfig.contactKinArenaRadius = currentRadius;
                    simState.activePresetConfig.capsuleArenaRadius = currentRadius;
                    simState.activePresetConfig.sensitivityArenaRadius = currentRadius;
                    simState.activePresetConfig.attackerQSArenaRadius = currentRadius;
                    simState.activePresetConfig.predationArenaRadius = currentRadius;
                }
                const presetLogicHandler = AppConfig.presetLogic[simState.activePresetConfig.group]?.handler;
                if (presetLogicHandler) {
                    // Re-run handler math to adjust cell counts to the new radius without overwriting other URL params
                    presetLogicHandler(simState.activePresetConfig);
                }
            }
            updateConfigFromUI(true);
			simState.remainingCPRGSubstrate = simState.config.cprg.initialSubstrate;

		if (simState.cells.size === 0) {
				// Check if we should populate
				const totalRequested = simState.config.attacker.initialCount + 
									   simState.config.prey.initialCount + 
									   simState.config.defender.initialCount;
				
				if (totalRequested > 0) {
					// Apply the seed from the URL or the preset default
					initializeSeededRNG(simulationSeedInput.value);
					ensureDataStructuresSize();
					populateCellsRandomly();
					simState.isInitialized = true;
				}
			}			

            drawGrid();
            updateStats();
            updateButtonStatesAndUI();
        }
    }

	const shareButton = document.getElementById('shareConfigurationButton');
	if (shareButton) {
		shareButton.addEventListener('click', generateShareableLink);
	}



    // --- Step 4: Final UI Polish ---
    switchCellParamsTab('attacker');
    setActivePresetGroup(`presetGroup${simState.activePresetConfig.group.charAt(0).toUpperCase() + simState.activePresetConfig.group.slice(1)}`);
    window.dispatchEvent(new Event('resize'));
}

document.addEventListener('DOMContentLoaded', initializeSimulationCore);
