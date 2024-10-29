import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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