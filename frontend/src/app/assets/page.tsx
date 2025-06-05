'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query' // Importe useMutation e useQueryClient
import axios from 'axios'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input' // Importe Input
import { Button } from '@/components/ui/button' // Importe Button
import { Label } from '@/components/ui/label' // Importe Label
import { useState } from 'react'

type Client = {
  id: number
  name: string
  email: string
  status: boolean
  assets: Asset[]
}

type Asset = {
  id: number
  name: string
  value: number
  clientId: number
}

export default function AssetsPage() {
  const queryClient = useQueryClient()
  const [selectedClientId, setSelectedClientId] = useState<string>('all')
  const [newAssetName, setNewAssetName] = useState<string>('')
  const [newAssetValue, setNewAssetValue] = useState<string>('')
  const [newAssetClientId, setNewAssetClientId] = useState<string>('')

  const { data: clients, isLoading: isLoadingClients } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3001/clients')
      return response.data
    },
  })

  const { data: assets, isLoading: isLoadingAssets } = useQuery<Asset[]>({
    queryKey: ['assets', selectedClientId],
    queryFn: async () => {
      let url = 'http://localhost:3001/assets'
      if (selectedClientId !== 'all') {
        url = `http://localhost:3001/clients/${selectedClientId}/assets`
      }
      const response = await axios.get(url)
      return response.data
    },
    enabled: !!clients,
  })

  const createAssetMutation = useMutation({
    mutationFn: async (newAssetData: { name: string; value: number; clientId: number }) => {
      const response = await axios.post('http://localhost:3001/assets', newAssetData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })

      setNewAssetName('')
      setNewAssetValue('')
      setNewAssetClientId('')
    },
    onError: (error) => {
      console.error('Erro ao cadastrar ativo:', error)
      alert('Erro ao cadastrar ativo. Verifique os dados.')
    },
  })

  const handleSubmitNewAsset = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAssetName || !newAssetValue || !newAssetClientId) {
      alert('Por favor, preencha todos os campos do ativo e selecione um cliente.')
      return
    }

    const valueParsed = parseFloat(newAssetValue)
    if (isNaN(valueParsed)) {
      alert('O valor do ativo deve ser um número válido.')
      return
    }

    createAssetMutation.mutate({
      name: newAssetName,
      value: valueParsed,
      clientId: Number(newAssetClientId),
    })
  }

  if (isLoadingClients || isLoadingAssets) return <div>Carregando...</div>

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-6">Ativos Financeiros</h1>

      <div className="mb-8 p-4 border rounded-md shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Cadastrar Novo Ativo</h2>
        <form onSubmit={handleSubmitNewAsset} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="assetName" className="mb-1 block">Nome do Ativo</Label>
            <Input
              id="assetName"
              placeholder="Ex: Ação XYZ"
              value={newAssetName}
              onChange={(e) => setNewAssetName(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="assetValue" className="mb-1 block">Valor Atual</Label>
            <Input
              id="assetValue"
              type="number"
              step="0.01"
              placeholder="Ex: 150.75"
              value={newAssetValue}
              onChange={(e) => setNewAssetValue(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="assetClient" className="mb-1 block">Associar ao Cliente</Label>
            <Select onValueChange={setNewAssetClientId} value={newAssetClientId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients?.map((client) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={createAssetMutation.isPending}>
              {createAssetMutation.isPending ? 'Cadastrando...' : 'Cadastrar Ativo'}
            </Button>
          </div>
        </form>
      </div>
      {/* Fim do Formulário de Cadastro de Ativos */}

      <h2 className="text-xl font-semibold mb-4">Visualizar Ativos</h2>
      <div className="mb-4">
        <Label htmlFor="client-select" className="block text-sm font-medium text-gray-700 mb-2">
          Filtrar por Cliente:
        </Label>
        <Select onValueChange={setSelectedClientId} value={selectedClientId}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Selecione um cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Clientes</SelectItem>
            {clients?.map((client) => (
              <SelectItem key={client.id} value={client.id.toString()}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome do Ativo</TableHead>
            <TableHead>Valor Atual</TableHead>
            {selectedClientId === 'all' && <TableHead>Cliente</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets?.map((asset) => (
            <TableRow key={asset.id}>
              <TableCell>{asset.name}</TableCell>
              <TableCell>${asset.value.toFixed(2)}</TableCell>
              {selectedClientId === 'all' && (
                <TableCell>
                  {clients?.find((c) => c.id === asset.clientId)?.name || 'Desconhecido'}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}