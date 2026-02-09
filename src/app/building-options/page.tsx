// src/app/building-options/page.tsx

import BuildingOptions from '@/features/buildingOptions/components/BuildingOptions'
import { getGlobalSubtitle } from '@/lib/global-subtitle'

export default async function BuildingOptionsPage() {
  const subtitle = await getGlobalSubtitle()
  
  return <BuildingOptions subtitle={subtitle} />
}
