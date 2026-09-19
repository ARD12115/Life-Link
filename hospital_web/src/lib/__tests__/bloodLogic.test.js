// hospital_web/src/lib/__tests__/bloodLogic.test.js
import { COMPATIBILITY_MAP, getCompatibleDonorGroups } from '../bloodLogic';

describe('bloodLogic compatibility', () => {
  test('returns correct compatible groups for each blood type', () => {
    expect(getCompatibleDonorGroups('A+')).toEqual(['A+', 'A-', 'O+', 'O-']);
    expect(getCompatibleDonorGroups('A-')).toEqual(['A-', 'O-']);
    expect(getCompatibleDonorGroups('B+')).toEqual(['B+', 'B-', 'O+', 'O-']);
    expect(getCompatibleDonorGroups('B-')).toEqual(['B-', 'O-']);
    expect(getCompatibleDonorGroups('AB+')).toEqual(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']);
    expect(getCompatibleDonorGroups('AB-')).toEqual(['AB-', 'A-', 'B-', 'O-']);
    expect(getCompatibleDonorGroups('O+')).toEqual(['O+', 'O-']);
    expect(getCompatibleDonorGroups('O-')).toEqual(['O-']);
  });

  test('returns input group for unknown blood type', () => {
    expect(getCompatibleDonorGroups('XXX')).toEqual(['XXX']);
  });
});