export type LCUChallengeData = {
	[id: number]: {
		availableIds: number[];
		capstoneGroupName: string;
		completedIds: number[];
		currentLevel: string;
		currentValue: number;
		description: string;
		id: number;
		levelToIconPath: {
			[level: string]: string;
		}
		name: string;
		thresholds: {
			[level: string]: {
				value: number;
			}
		};
	}
};

export type ChallengeSummary = {
	challenges: {
		[id: number]: {
			name: string;
			description: string;
			levelToIconPath: {
				[level: string]: string;
			}
		}
	}
};

export type RiotChallengeData = {
	totalPoints: {
		current: number;
		level: string;
		max: number;
		position: number;
	},
	playerPreferences: {
		challengeIds: number[];
	},
	challenges: {
		challengeId: number;
		level: string;
		value: number;
	}[]
};

export const default_riot_challenge_data: RiotChallengeData = {
	totalPoints: {
		current: 0,
		level: "CHALLENGER",
		max: 0,
		position: 0
	},
	playerPreferences: {
		challengeIds: []
	},
	challenges: []
};

export type MasteryData = {
	championId: number;
	championLevel: number;
	championPoints: number;
	championPointsSinceLastLevel: number;
	championPointsUntilNextLevel: number;
	markRequiredForNextLevel: number;
	milestoneGrades: string[];
	nextSeasonMilestone: {
		requireGradeCounts: {
			[grade: string]: number;
		}
	},
	tokensEarned: number;
}[];

export type SummonerData = {
	gameName: string;
	tagLine: string;
};

export type ChampionSummaryItem = {
	id: number;
	name: string;
	squarePortraitPath: string;
	roles: string[];
};

export type ChampionSummary = ChampionSummaryItem[];