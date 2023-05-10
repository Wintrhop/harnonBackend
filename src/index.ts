/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	harnonDb: D1Database;
  }
  
  export default {
	async fetch(request: Request, env: Env) {
	  const { pathname } = new URL(request.url);
  
	  if (pathname === "/api/users") {
		const { results } = await env.harnonDb.prepare(
		  "SELECT * FROM Users WHERE CompanyName = ?"
		)
		  .bind("Bs Beverages")
		  .all();
		return Response.json(results);
	  }
  
	  return new Response(
		"Call /api/beverages to see everyone who works at Bs Beverages"
	  );
	},
  };