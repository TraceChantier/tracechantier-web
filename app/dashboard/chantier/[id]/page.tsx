import { redirect } from 'next/navigation'

export default async function ChantierIndex({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/dashboard/chantier/${id}/photos`)
}
