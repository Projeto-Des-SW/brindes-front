import { useState } from 'react'
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { StarRating } from './StarRating'
import type { ProdutoDetalhe } from './produtoData'
import { useCart } from '../../context/useCart'

type Props = {
  produto: ProdutoDetalhe
}

export const ProdutoInfo = ({ produto }: Props) => {
  const [quantidade, setQuantidade] = useState(produto.minimoUnidades)
  const { addToCart } = useCart()
  const navigate = useNavigate()

  const total = (produto.preco * quantidade).toFixed(2).replace('.', ',')
  const precoFormatado = produto.preco.toFixed(2).replace('.', ',')

  const decrementar = () => {
    if (quantidade > produto.minimoUnidades) setQuantidade((q) => q - 1)
  }
  const incrementar = () => setQuantidade((q) => q + 1)

  const handleAdicionarAoCarrinho = () => {
    addToCart({
      produtoId: produto.id,
      nome: produto.nome,
      categoria: produto.categoria,
      preco: produto.preco,
      cor: '',
      impressao: '',
      quantidade,
      imagem: produto.imagens[0],
      minimoUnidades: produto.minimoUnidades,
    })
    navigate('/carrinho')
  }

  return (
    <VStack align="start" gap={5}>
      {/* Categoria */}
      <Text fontSize="sm" color="gray.500" fontWeight="500">
        {produto.categoria}
      </Text>

      {/* Nome */}
      <Text fontSize="2xl" fontWeight="700" color="#1a1616" lineHeight="1.2">
        {produto.nome}
      </Text>

      {/* Avaliação */}
      <HStack gap={2}>
        <StarRating value={produto.estrelas} size={18} />
        <Text fontSize="sm" color="gray.500">({produto.totalAvaliacoes} avaliações)</Text>
      </HStack>

      {/* Preço */}
      <HStack gap={2} align="baseline">
        <Text fontSize="2xl" fontWeight="700" color="#1a1616">
          R$ {precoFormatado}
        </Text>
        <Text fontSize="sm" color="gray.500">/ unidade</Text>
      </HStack>

      {/* Descrição */}
      <Text fontSize="sm" color="gray.600" lineHeight="1.7">
        {produto.descricao}
      </Text>

      <Box w="full" borderTop="1px solid" borderColor="gray.100" />

      {/* Quantidade */}
      <VStack align="start" gap={2} w="full">
        <Text fontSize="sm" fontWeight="600" color="#1a1616">
          Quantidade{' '}
          <Text as="span" fontWeight="400" color="gray.500">
            (mínimo {produto.minimoUnidades} unidades)
          </Text>
        </Text>
        <HStack gap={4}>
          <HStack
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            overflow="hidden"
          >
            <Box
              as="button"
              px={4}
              py={2}
              fontSize="lg"
              color="gray.600"
              _hover={{ bg: 'gray.50' }}
              onClick={decrementar}
            >
              −
            </Box>
            <Text px={4} fontWeight="600" fontSize="sm" minW="40px" textAlign="center">
              {quantidade}
            </Text>
            <Box
              as="button"
              px={4}
              py={2}
              fontSize="lg"
              color="gray.600"
              _hover={{ bg: 'gray.50' }}
              onClick={incrementar}
            >
              +
            </Box>
          </HStack>
          <Text fontSize="sm" color="gray.600">
            Total:{' '}
            <Text as="span" fontWeight="700" color="#1a1616">
              R$ {total}
            </Text>
          </Text>
        </HStack>
      </VStack>

      {/* Botão principal + ações */}
      <HStack w="full" gap={3}>
        <Button
          flex={1}
          bg="#000000"
          color="white"
          fontWeight="600"
          fontSize="sm"
          py={6}
          borderRadius="md"
          _hover={{ bg: '#111111' }}
          onClick={handleAdicionarAoCarrinho}
        >
          🛒&nbsp; Solicitar Orçamento
        </Button>
        {/* Favoritar */}
        <Box
          as="button"
          p={3}
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          color="gray.500"
          _hover={{ borderColor: '#1a1616', color: '#1a1616' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </Box>
        {/* Compartilhar */}
        <Box
          as="button"
          p={3}
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          color="gray.500"
          _hover={{ borderColor: '#1a1616', color: '#1a1616' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </Box>
      </HStack>

      {/* Entrega + Garantia */}
      <HStack
        w="full"
        gap={4}
        p={4}
        border="1px solid"
        borderColor="gray.100"
        borderRadius="md"
        bg="gray.50"
      >
        <HStack gap={2} flex={1}>
          <Box color="gray.500">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="3" width="15" height="13" rx="1" />
              <path d="M16 8h4l3 4v5h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </Box>
          <VStack align="start" gap={0}>
            <Text fontSize="xs" fontWeight="600" color="#1a1616">Entrega Rápida</Text>
            <Text fontSize="xs" color="gray.500">Em até 15 dias úteis</Text>
          </VStack>
        </HStack>
        <Box w="1px" h="32px" bg="gray.200" />
        <HStack gap={2} flex={1}>
          <Box color="gray.500">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </Box>
          <VStack align="start" gap={0}>
            <Text fontSize="xs" fontWeight="600" color="#1a1616">Garantia de Qualidade</Text>
            <Text fontSize="xs" color="gray.500">100% satisfação</Text>
          </VStack>
        </HStack>
      </HStack>

      {/* Precisa de Ajuda? */}
      <Box w="full" border="1px solid" borderColor="gray.100" borderRadius="md" p={5}>
        <Text fontWeight="700" fontSize="sm" color="#1a1616" mb={1}>
          Precisa de Ajuda?
        </Text>
        <Text fontSize="xs" color="gray.500" mb={4} lineHeight="1.6">
          Nossa equipe está pronta para criar o orçamento perfeito para sua empresa.
        </Text>
        <VStack gap={2}>
          <Button
            w="full"
            variant="outline"
            borderColor="gray.200"
            color="#1a1616"
            fontWeight="500"
            fontSize="sm"
            borderRadius="md"
            _hover={{ bg: 'gray.50' }}
          >
            Falar com Consultor
          </Button>
          <Button
            w="full"
            variant="outline"
            borderColor="gray.200"
            color="#1a1616"
            fontWeight="500"
            fontSize="sm"
            borderRadius="md"
            _hover={{ bg: 'gray.50' }}
          >
            Baixar Catálogo
          </Button>
        </VStack>
      </Box>
    </VStack>
  )
}
