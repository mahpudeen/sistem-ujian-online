import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";

export default function Pagination({ currentPage, pageCount, onPageChange, data }) {
  const pages = []
  const itemsPerPage = 10

  const start = Math.max(2, currentPage - 1)
  const end = Math.min(pageCount - 1, currentPage + 1)

  pages.push(1)
  if (start > 2) pages.push('...')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < pageCount - 1) pages.push('...')
  if (pageCount > 1) pages.push(pageCount)

  return (
    <Flex justify="space-between" borderTop="1px solid gray" pt={4}>
      <Box textAlign="left" fontSize="sm" color="gray.600">
        {(() => {
          const start = (currentPage - 1) * itemsPerPage + 1
          const end = Math.min(currentPage * itemsPerPage, data.length)
          return `${start}-${end} of ${data.length} items`
        })()}
      </Box>

      <Stack direction="row" spacing={1} align="center" justify="between">
        <Button
          size="sm"
          onClick={() => onPageChange(1)}
          isDisabled={currentPage === 1}
          variant="outline"
        >
          First
        </Button>

        {pages.map((p, i) =>
          p === '...' ? (
            <Box key={`dots-${i}`} px={2}>
              ...
            </Box>
          ) : (
            <Button
              key={p}
              size="sm"
              onClick={() => onPageChange(p)}
              variant={currentPage === p ? 'solid' : 'outline'}
              colorScheme={currentPage === p ? 'blue' : 'gray'}
            >
              {p}
            </Button>
          )
        )}

        <Button
          size="sm"
          onClick={() => onPageChange(pageCount)}
          isDisabled={currentPage === pageCount}
          variant="outline"
        >
          Last
        </Button>

      </Stack>
    </Flex>
  )
}
