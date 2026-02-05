import { useInfiniteQuery } from "@tanstack/react-query";

import { getQuotationsByUser } from "@/api/quotations";

const KANBAN_PAGE_SIZE = 15;

export function useKanbanColumn(status: string, searchTerm: string) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["kanban-quotations", status, searchTerm],
    queryFn: ({ pageParam }) =>
      getQuotationsByUser(searchTerm, pageParam, KANBAN_PAGE_SIZE, status),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentPage =
        typeof lastPage.pageNumber === "string"
          ? parseInt(lastPage.pageNumber)
          : lastPage.pageNumber;

      if (lastPage.last || currentPage >= lastPage.totalPages) {
        return undefined;
      }

      return currentPage + 1;
    },
  });

  const quotations = data?.pages.flatMap((page) => page.content) ?? [];
  const totalElements = data?.pages[0]?.totalElements ?? 0;

  return {
    quotations,
    totalElements,
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    isLoading,
    isError,
  };
}
