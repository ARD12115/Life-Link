// hospital_web/src/lib/__tests__/queryClient.test.js
import { useQuery, useMutation } from '../useQueryClient';

// Mock Supabase
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 1, name: 'Test' }, error: null }),
      insert: jest.fn().mockResolvedValue({ data: [{ id: 1, name: 'Test' }], error: null }),
    }),
  },
}));

describe('useQuery hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns data when query succeeds', async () => {
    const { result } = renderHook(() =>
      useQuery(['test'], () => supabase.from('test').select('*'))
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => !result.current.isLoading);
    expect(result.current.data).toEqual({ id: 1, name: 'Test' });
    expect(result.current.error).toBeNull();
  });

  test('handles query error', async () => {
    // Mock error
    supabase.from().select().single.mockResolvedValueOnce({
      data: null,
      error: { message: 'Database error' },
    });

    const { result } = renderHook(() =>
      useQuery(['test'], () => supabase.from('test').select('*'))
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => !result.current.isLoading);
    expect(result.current.error).toMatch(/Database error/);
  });
});

describe('useMutation hook', () => {
  test('mutates data successfully', async () => {
    const { result } = renderHook(() =>
      useMutation((vars) => supabase.from('test').insert([vars]))
    );

    expect(result.current.isLoading).toBe(false);
    await act(async () => {
      result.current.mutate({ name: 'Test' });
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => !result.current.isLoading);
    expect(result.current.data).toEqual([{ id: 1, name: 'Test' }]);
    expect(result.current.error).toBeNull();
  });
});