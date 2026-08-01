import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const res = await pool.query(
  "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename"
);
console.log("Tables:", res.rows.map((r) => r.tablename).join("\n  "));

const needed = [
  "notifications",
  "presences_utilisateurs",
  "pieces_jointes",
  "reactions_messages",
  "mentions_messages",
];
for (const t of needed) {
  console.log(t, res.rows.some((r) => r.tablename === t) ? "OK" : "MISSING");
}

const mig = await pool.query('SELECT migration_name, finished_at FROM "_prisma_migrations" ORDER BY finished_at');
console.log("Migrations:", mig.rows);

await pool.end();
