export const dynamic = 'force-dynamic';

export function GET() {
  return new Response(
    JSON.stringify({ ok: true, service: 'stella-resale', time: new Date().toISOString() }),
    { status: 200, headers: { 'content-type': 'application/json' } }
  );
}
