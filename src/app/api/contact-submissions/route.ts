let submissionCount = 0;
let baseline: number | null = null;

export async function POST() {
  submissionCount++;
  if (baseline === null) baseline = submissionCount;
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

export async function GET() {
  const target: number | null = baseline ? Math.ceil(baseline * 1.1) : null;
  const progress =
    baseline && target ? (submissionCount / target) * 100 : 0;
  return new Response(
    JSON.stringify({ submissionCount, baseline, target, progress }),
    { status: 200 }
  );
} 