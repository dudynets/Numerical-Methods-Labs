import { Lab, LABS } from '@lab/lab';

export function getLabById(labId: string): Lab | null {
  return LABS.find((lab) => lab.clientUrl === labId) || null;
}
