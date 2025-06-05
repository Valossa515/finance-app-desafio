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
import { useState, useEffect } from 'react'

import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const clientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  status: z.boolean(),
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

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      status: true,
    },
  })

  useEffect(() => {
    if (editingClient) {
      setValue('name', editingClient.name)
      setValue('email', editingClient.email)
      setValue('status', editingClient.status)
    } else {
      reset({
        name: '',
        email: '',
        status: true,
      })
    }
  }, [editingClient, setValue, reset])


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
      reset({
        name: '',
        email: '',
        status: true,
      })
      toast.success("Client created successfully!")
    },
    onError: (error) => {
      console.error("Error creating client:", error);
      toast.error("Failed to create client.");
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; clientData: z.infer<typeof clientSchema> }) =>
      axios.put(`http://localhost:3001/clients/${data.id}`, data.clientData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      setEditingClient(null)
      reset({
        name: '',
        email: '',
        status: true,
      })
      toast.success("Client updated successfully!")
    },
    onError: (error) => {
      console.error("Error updating client:", error);
      toast.error("Failed to update client.");
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => axios.delete(`http://localhost:3001/clients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success("Client deleted successfully!")
    },
    onError: (error) => {
      console.error("Error deleting client:", error);
      toast.error("Failed to delete client.");
    }
  })

  const onSubmit = (data: z.infer<typeof clientSchema>) => {
    const clientDataToSend = {
      ...data,
      status: data.status,
    };

    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, clientData: clientDataToSend });
    } else {
      createMutation.mutate(clientDataToSend);
    }
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setValue('name', client.name)
    setValue('email', client.email)
    setValue('status', client.status)
  }

  const handleCancel = () => {
    setEditingClient(null)
    reset({
      name: '',
      email: '',
      status: true,
    })
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="space-y-8">
      {}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

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
            <input
              type="checkbox"
              id="status"
              {...register('status')}
              className="w-4 h-4"
            />
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