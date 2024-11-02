import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { LCUChallengeData } from "@/lib/types.ts";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export const rank_order= ["CHALLENGER", "GRANDMASTER", "MASTER", "DIAMOND", "PLATINUM", "GOLD", "SILVER", "BRONZE", "IRON"];
export const rank_index = (rank: string) => rank_order.indexOf(rank);

export function format_number(num: number) {
	return Intl.NumberFormat('en-US', {
		notation: "compact",
		maximumFractionDigits: 1
	}).format(num);
}

export function format_number_comma(num: number) {
	return Intl.NumberFormat('en-US').format(num);
}

export function challenge_icon(lcu_challenge_data: LCUChallengeData, id: number, level: string | undefined = undefined) {
	if (id < 10 || lcu_challenge_data[id] === undefined || lcu_challenge_data[id].currentLevel === "NONE") {
		return "https://placehold.co/32?text=" + id;
	}
	return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/challenges/${lcu_challenge_data[id]?.levelToIconPath[level ?? lcu_challenge_data[id].currentLevel].substring(40).toLowerCase()}`;
}