import { CanActivateFn } from '@angular/router';
import { LABS } from '../../lab/lab';

export const canActivateLabGuard: CanActivateFn = (route) => {
  const labId = route.params['labId'];
  return LABS.some((lab) => lab.clientUrl === labId);
};
