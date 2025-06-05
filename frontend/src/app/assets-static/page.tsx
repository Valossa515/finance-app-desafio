'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Card } from '@/components/ui/card'
import { Table } from '@/components/ui/table'
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type Asset = {
  name: string
  value: number
}

export default function AssetsPage() {
  const { data: assets, isLoading } = useQuery<Asset[]>({
    queryKey: ['assets'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3001/assets-static')
      return response.data
    },
  })
  
  if (isLoading) return <div>Loading...</div>
  
  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-6">Financial Assets</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset Name</TableHead>
            <TableHead>Current Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets?.map((asset, index) => (
            <TableRow key={index}>
              <TableCell>{asset.name}</TableCell>
              <TableCell>${asset.value.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}