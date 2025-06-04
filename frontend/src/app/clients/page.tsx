'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { useState } from 'react'

const clientSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  status: z.boolean().default(true),
})

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
}

export default function ClientsPage() {
  const queryClient = useQueryClient()
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(clientSchema),
  })
  
  const { data: clients, isLoading } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3001/clients')
      return response.data
    },
  })
  
  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof clientSchema>) => axios.post('http://localhost:3001/clients', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      reset()
    },
  })
  
  const updateMutation = useMutation({
    mutationFn: (data: { id: number; clientData: z.infer<typeof clientSchema> }) => 
      axios.put(`http://localhost:3001/clients/${data.id}`, data.clientData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      reset()
      setEditingClient(null)
    },
  })
  
  const deleteMutation = useMutation({
    mutationFn: (id: number) => axios.delete(`http://localhost:3001/clients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })

  const onSubmit = (data: z.infer<typeof clientSchema>) => {
    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, clientData: data })
    } else {
      createMutation.mutate(data)
    }
  }
  
  const handleEdit = (client: Client) => {
    setEditingClient(client)
    reset({
      name: client.name,
      email: client.email,
      status: client.status,
    })
  }
  
  const handleCancel = () => {
    setEditingClient(null)
    reset()
  }
  
  if (isLoading) return <div>Loading...</div>
  
  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">
          {editingClient ? 'Edit Client' : 'Add New Client'}
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-red-500">{errors.name.message as string}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-red-500">{errors.email.message as string}</p>}
          </div>
          
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="status" {...register('status')} className="w-4 h-4" />
            <Label htmlFor="status">Active</Label>
          </div>
          
          <div className="flex space-x-2">
            <Button type="submit">
              {editingClient ? 'Update' : 'Create'}
            </Button>
            {editingClient && (
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Clients List</h2>
        <Table>
          <TableCaption>A list of your clients.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assets Count</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients?.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.status ? 'Active' : 'Inactive'}</TableCell>
                <TableCell>{client.assets.length}</TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" onClick={() => handleEdit(client)}>
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(client.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}