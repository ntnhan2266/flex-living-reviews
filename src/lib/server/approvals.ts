import { prisma } from './prisma';

export type ReviewStatus =
  | 'awaiting'
  | 'pending'
  | 'scheduled'
  | 'submitted'
  | 'published'
  | 'expired'
  | 'approved'
  | 'public';

export async function setStatus(reviewId: string, status: ReviewStatus) {
  await prisma.reviewApproval.upsert({
    where: { reviewId },
    update: { status },
    create: { reviewId, status },
  });
}

export async function getStatusMap(reviewIds: string[]) {
  if (!reviewIds.length) return new Map<string, ReviewStatus>();
  const rows = await prisma.reviewApproval.findMany({
    where: { reviewId: { in: reviewIds } },
    select: { reviewId: true, status: true },
  });
  const m = new Map<string, ReviewStatus>();
  for (const r of rows) m.set(r.reviewId, r.status as ReviewStatus);
  return m;
}

export function attachStatus<T extends { id: string }>(
  items: T[],
  map: Map<string, ReviewStatus>,
): Array<T & { status: ReviewStatus }> {
  return items.map((i) => ({ ...i, status: map.get(i.id) ?? 'pending' }));
}
