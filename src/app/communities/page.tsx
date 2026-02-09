// Server Component Wrapper
import CommunitiesPageClient from './communities-client'
import { getGlobalSubtitle } from '@/lib/global-subtitle'

export default async function CommunitiesPage() {
  const subtitle = await getGlobalSubtitle()
  
  return <CommunitiesPageClient subtitle={subtitle} />
}
