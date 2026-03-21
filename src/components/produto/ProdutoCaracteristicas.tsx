import { Box, Text } from '@chakra-ui/react'

type Props = {
  descricao: string | null
}

export const ProdutoCaracteristicas = ({ descricao }: Props) => {
  if (!descricao) return null

  return (
    <Box py={10}>
      <Text fontSize="lg" fontWeight="700" color="#1a1616" mb={4}>
        Descrição
      </Text>
      <Text fontSize="sm" color="gray.700" lineHeight="1.8" whiteSpace="pre-wrap">
        {descricao}
      </Text>
    </Box>
  )
}
