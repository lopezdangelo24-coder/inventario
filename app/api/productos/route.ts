import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);
  const response = await sql`SELECT * FROM productos ORDER BY id DESC;`;
  return NextResponse.json(response);
}

export async function POST(request: Request) {
  const sql = neon(process.env.DATABASE_URL!);
  const { nombre, sku, cantidad } = await request.json();
  const response = await sql`
    INSERT INTO productos (nombre, sku, cantidad)
    VALUES (${nombre}, ${sku}, ${cantidad})
    RETURNING *;
  `;
  return NextResponse.json(response[0]);
}
