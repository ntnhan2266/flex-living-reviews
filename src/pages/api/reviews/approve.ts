import type { NextApiRequest, NextApiResponse } from 'next';
import { setStatus } from '@/lib/server/approvals';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { reviewId } = req.body ?? {};
  if (typeof reviewId !== 'string' || !reviewId.trim()) {
    return res.status(400).json({ error: 'Invalid reviewId' });
  }

  try {
    await setStatus(reviewId, 'approved');
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('POST /reviews/approve error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
