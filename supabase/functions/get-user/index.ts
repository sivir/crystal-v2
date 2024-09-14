import { cors_headers, get_user, update_riot_data, riot_api_key } from '../_shared/update_db.ts';

Deno.serve(async (req) => {
	// allow calling from browser
	if (req.method === 'OPTIONS') {
		return new Response('ok', {
			headers: cors_headers
		});
	}

	// extract id from request
	const x = await req.json();
	const { riot_id } = x;
	try {
		// check if user exists in db
		const id = riot_id.split("#");
		console.log("id", id);
		const summoner_response = await fetch(`https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${id[0]}/${id[1]}?api_key=${riot_api_key}`);
		const summoner_data = await summoner_response.json();
		const puuid = summoner_data.puuid;
		console.log("summoner_data", summoner_data);
		const res = await get_user(puuid);
		console.log("res", res);
		// if not, update db with riot data
		if (res.length === 0) {
			const data = await update_riot_data(puuid);
			// return Response.json({
			// 	riot_data: data["challenge"],
			// 	mastery_data: data["mastery"],
			// 	lcu_data: {}
			// }, {
			// 	headers: cors_headers
			// });
			return new Response(JSON.stringify({
				riot_data: data["challenge"],
				mastery_data: data["mastery"],
				lcu_data: {}
			}), {
				headers: cors_headers
			});
		} else {
			// check when riot data was last updated
			const last_updated = new Date(res[0].last_update_riot);
			const now = new Date();
			const diff = now.getTime() - last_updated.getTime();
			// if it's been 10 minutes, update it
			if (diff > 10 * 60 * 1000) {
				const data = await update_riot_data(puuid);
				return new Response(JSON.stringify({
					riot_data: data["challenge"],
					mastery_data: data["mastery"],
					lcu_data: res[0].lcu_data
				}), {
					headers: cors_headers
				});
			} else {
				// otherwise, return it
				return new Response(JSON.stringify({
					riot_data: res[0].riot_data,
					mastery_data: res[0].mastery_data,
					lcu_data: res[0].lcu_data
				}), {
					headers: cors_headers
				});
			}
		}
	} catch (err) {
		console.error(err);
		return new Response(String(err?.message ?? err), {
			status: 500,
			headers: cors_headers
		});
	}
});
