export async function GET() {
  return Response.json({ status: 'OK', message: 'Minimal test API çalışıyor' });
}

export async function POST() {
  return Response.json({ status: 'OK', message: 'Minimal test POST çalışıyor' });
}
