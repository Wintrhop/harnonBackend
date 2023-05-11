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
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Max-Age": "*",
    };
    try {
      const { pathname } = new URL(request.url);
      //   const req = await request.json();
      //   console.log(req);

      if (pathname === "/api/users") {
        const { results } = await env.DB.prepare("SELECT * FROM Users").all();
        return new Response(JSON.stringify(results), { headers: corsHeaders });
      }

      if (pathname === "/api/login") {
        const { email, password }: Body = await request.json();
        const userDb: any = await env.DB.prepare(
          "SELECT * FROM Users WHERE email = ?"
        )
          .bind(email)
          .first();
        const userDbPass = userDb.userPassword;
        if (password === userDbPass) {
          const userfound = JSON.stringify({
            message: "successfuly login",
            ...userDb,
          });
          return new Response(userfound, { headers: corsHeaders });
        } else {
          throw new Error("User could not be login");
        }
      }

      if (pathname === "/api/signup") {
        const { email, password, userName, age, role }: Body =
          await request.json();
        const userDbPrev: any = await env.DB.prepare(
          "SELECT * FROM Users WHERE email = ?"
        )
          .bind(email)
          .first();
        if (userDbPrev) throw new Error("Email already exist");

        const { success }: any = await env.DB.prepare(
          "INSERT INTO Users (email, userPassword, userName, age, userRole) VALUES (?1, ?2, ?3, ?4, ?5)"
        )
          .bind(email, password, userName, age, role)
          .run();

        if (!success) {
          throw new Error("User could not be Created");
        }

        const userDb: any = await env.DB.prepare(
          "SELECT * FROM Users WHERE email = ?"
        )
          .bind(email)
          .first();

        const userfound = JSON.stringify({
          message: "User created successfully",
          ...userDb,
        });
        return new Response(userfound, { status: 201, headers: corsHeaders });
      }
      return new Response("Call /api/users to see everyone");
    } catch (err: any) {
      return new Response(err, { status: 400 });
    }
  },
};
