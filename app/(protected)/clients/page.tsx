import { getClientsForCoach } from '@/actions/clients'
import { ClientsPageContent } from '@/components/clients/clients-page-content'

type Props = { searchParams: Promise<{ invite?: string }> }

export default async function ClientsPage({ searchParams }: Props) {
  const clients = await getClientsForCoach()
  const params = await searchParams
  const openInvite = params.invite === '1'

  return (
    <div className='space-y-8'>
      <ClientsPageContent clients={clients} openInviteOnMount={openInvite} />
    </div>
  )
}
