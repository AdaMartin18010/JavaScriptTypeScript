import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Post, PaginatedResponse, PaginationParams } from '@types';
import { get, post, put, del } from '@utils/api';

const POSTS_QUERY_KEY = 'posts';

interface PostsFilters {
  tag?: string;
  search?: string;
  authorId?: string;
}

export function usePosts(filters: PostsFilters = {}) {
  return useInfiniteQuery<PaginatedResponse<Post>>({
    queryKey: [POSTS_QUERY_KEY, filters],
    queryFn: async ({ pageParam = 1 }) => {
      const params: PaginationParams & PostsFilters = {
        page: pageParam as number,
        limit: 20,
        ...filters,
      };
      return get<PaginatedResponse<Post>>('/posts', params);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

export function usePost(postId: string) {
  return useInfiniteQuery<Post>({
    queryKey: [POSTS_QUERY_KEY, postId],
    queryFn: async () => get<Post>(`/posts/${postId}`),
    getNextPageParam: () => undefined,
    initialPageParam: 1,
    enabled: !!postId,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string; body: string; tags?: string[] }) =>
      post<Post>('/posts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [POSTS_QUERY_KEY] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Post> }) =>
      put<Post>(`/posts/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [POSTS_QUERY_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [POSTS_QUERY_KEY] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => del(`/posts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [POSTS_QUERY_KEY] });
    },
  });
}
