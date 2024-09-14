export type LCUChallengeData = {
	[id: number]: {
		availableIds: number[];
		capstoneGroupNames: string;
		currentValue: number;
		description: string;
		name: string;
	}
};

export type RiotChallengeData = {
	totalPoints: {
		current: number;
		level: string;
		max: number;
		position: number;
	},
	challenges: {
		challengeId: number;
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
	challenges: []
};

export type MasteryData = {
	championId: number;
	championLevel: number;
	championPoints: number;
	markRequiredForNextLevel: number;
	milestoneGrades: string[];
	nextSeasonMilestone: {
		requiredGradeCounts: {
			[grade: string]: number;
		}
	}
}[];

export type SummonerData = {
	gameName: string;
	tagLine: string;
};