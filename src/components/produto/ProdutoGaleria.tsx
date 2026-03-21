import { useState } from 'react'
import { Box, Grid, GridItem } from '@chakra-ui/react'
import type { ProdutoImagemResponse } from '../../services/produtoService'

type Props = {
  imagens: ProdutoImagemResponse[]
  nomeProduto: string
}

export const ProdutoGaleria = ({ imagens, nomeProduto }: Props) => {
  const sorted = [...imagens].sort((a, b) => a.ordem - b.ordem)
  const [imagemPrincipal, setImagemPrincipal] = useState(sorted[0]?.url ?? '')

  if (sorted.length === 0) {
    return (
      <Box
        borderRadius="md"
        overflow="hidden"
        border="1px solid"
        borderColor="gray.100"
        h={{ base: '320px', md: '500px' }}
        bg="gray.100"
        display="flex"
        alignItems="center"
        justifyContent="center"
      />
    )
  }

  if (sorted.length === 1) {
    return (
      <Box
        borderRadius="md"
        overflow="hidden"
        border="1px solid"
        borderColor="gray.100"
        h={{ base: '320px', md: '500px' }}
      >
        <img
          src={sorted[0].url}
          alt={nomeProduto}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Box>
    )
  }

  return (
    <Grid templateColumns="1fr auto" gap={3} alignItems="stretch">
      {/* Imagem principal */}
      <GridItem>
        <Box
          borderRadius="md"
          overflow="hidden"
          border="1px solid"
          borderColor="gray.100"
          h={{ base: '320px', md: '500px' }}
        >
          <img
            src={imagemPrincipal}
            alt={nomeProduto}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
      </GridItem>

      {/* Miniaturas — todas as imagens, incluindo a principal */}
      <GridItem>
        <Box display="flex" flexDirection="column" gap={3} h="full">
          {sorted.map((img) => (
            <Box
              key={img.id}
              w={{ base: '72px', md: '132px' }}
              h={{ base: '72px', md: '116px' }}
              borderRadius="md"
              overflow="hidden"
              border="2px solid"
              borderColor={imagemPrincipal === img.url ? '#1a1616' : 'gray.100'}
              cursor="pointer"
              flexShrink={0}
              _hover={{ borderColor: '#1a1616' }}
              transition="border-color 0.15s"
              onClick={() => setImagemPrincipal(img.url)}
            >
              <img
                src={img.url}
                alt={`${nomeProduto} — imagem ${img.ordem + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          ))}
        </Box>
      </GridItem>
    </Grid>
  )
}
