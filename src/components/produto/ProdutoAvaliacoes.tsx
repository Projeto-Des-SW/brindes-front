import { Box, Grid, HStack, Text, VStack } from '@chakra-ui/react'
import { StarRating } from './StarRating'
import type { AvaliacaoResponse } from '../../services/produtoService'

type Props = {
  avaliacoes: AvaliacaoResponse[]
  mediaAvaliacao: number
}

const AvaliacaoCard = ({ avaliacao }: { avaliacao: AvaliacaoResponse }) => (
  <Box border="1px solid" borderColor="gray.100" borderRadius="md" p={5} flexShrink={0}>
    <StarRating value={avaliacao.nota} size={15} />
    {avaliacao.comentario && (
      <Text fontSize="sm" color="gray.700" mt={3} mb={4} lineHeight="1.6">
        {avaliacao.comentario}
      </Text>
    )}
    <HStack justify="space-between" align="end" mt={avaliacao.comentario ? 0 : 3}>
      <Text fontSize="xs" fontWeight="600" color="#1a1616">{avaliacao.nomeCliente}</Text>
      <Text fontSize="xs" color="gray.400">{avaliacao.criadoEm}</Text>
    </HStack>
  </Box>
)

export const ProdutoAvaliacoes = ({ avaliacoes, mediaAvaliacao }: Props) => {
  if (avaliacoes.length === 0) return null

  return (
    <Box py={10} borderTop="1px solid" borderColor="gray.100">
      <HStack justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <Text fontSize="lg" fontWeight="700" color="#1a1616">
          Avaliações dos Clientes
        </Text>
        {mediaAvaliacao > 0 && (
          <HStack gap={2}>
            <StarRating value={mediaAvaliacao} size={18} />
            <Text fontSize="sm" color="gray.500" fontWeight="600">
              {mediaAvaliacao.toFixed(1)} de 5
            </Text>
            <Text fontSize="sm" color="gray.400">
              ({avaliacoes.length} {avaliacoes.length === 1 ? 'avaliação' : 'avaliações'})
            </Text>
          </HStack>
        )}
      </HStack>

      {avaliacoes.length <= 4 ? (
        <Grid columns={{ base: 1, md: 2 }} gap={4} templateColumns={{ base: '1fr', md: '1fr 1fr' }}>
          {avaliacoes.map((av) => (
            <AvaliacaoCard key={av.id} avaliacao={av} />
          ))}
        </Grid>
      ) : (
        <Box
          overflowY="auto"
          maxH="480px"
          pr={2}
          css={{
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: '4px' },
            '&::-webkit-scrollbar-thumb': { background: '#d1d5db', borderRadius: '4px' },
          }}
        >
          <VStack align="stretch" gap={4}>
            {avaliacoes.map((av) => (
              <AvaliacaoCard key={av.id} avaliacao={av} />
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  )
}
