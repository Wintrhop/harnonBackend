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
  DB: D1Database;
}
type Body = {
  email: string;
  password: string;
  age: string;
  userName: string;
  role: string;
};
export default {
  async fetch(request: Request, env: Env) {
    try {
      const { pathname } = new URL(request.url);
      //   const req = await request.json();
      //   console.log(req);

      if (pathname === "/api/users") {
        const { results } = await env.DB.prepare("SELECT * FROM Users").all();
        return Response.json(results);
      }

      if (pathname === "/api/login") {
        const { email, password }: Body = await request.json();
        const userDb: any = await env.DB.prepare(
          "SELECT * FROM Users WHERE email = ?"
        )
          .bind(email)
          .first();
        const userDbPass = userDb.UserPassword;
        if (password === userDbPass){
          return Response.json(userDb);
        } else{
          throw new Error("user could not be login");
        }
      }

      return new Response("Call /api/users to see everyone");
    } catch (err: any) {
      return new Response(err)
    }
  },
};
