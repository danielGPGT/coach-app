'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { updateUnitPreference } from '@/actions/settings'
import type { UserSettings } from '@/actions/settings'

type PreferencesCardProps = {
  settings: UserSettings
}

export function PreferencesCard({ settings }: PreferencesCardProps) {
  const [unit, setUnit] = useState<'kg' | 'lb'>(settings.unit_preference)
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateUnitPreference(unit)
        toast.success('Preferences saved')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Could not save preferences')
      }
    })
  }

  return (
    <Card className='rounded-2xl border-border'>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
      </CardHeader>
      <CardContent className='space-y-5'>
        <div className='space-y-2'>
          <Label htmlFor='unit-pref'>Units</Label>
          <Select value={unit} onValueChange={(val) => setUnit(val as 'kg' | 'lb')}>
            <SelectTrigger id='unit-pref' className='w-44'>
              <SelectValue placeholder='Select units' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='kg'>Kilograms (kg)</SelectItem>
              <SelectItem value='lb'>Pounds (lb)</SelectItem>
            </SelectContent>
          </Select>
          <p className='text-xs text-muted-foreground'>
            Controls how weights are displayed in workouts and logs.
          </p>
        </div>

        <div className='flex items-center justify-between gap-4'>
          <div>
            <p className='text-sm font-medium text-foreground'>Notifications</p>
            <p className='text-xs text-muted-foreground'>
              Notifications are planned, but not built yet.
            </p>
          </div>
          <Switch disabled aria-label='Notifications (coming soon)' />
        </div>

        <Button
          variant='outline'
          size='sm'
          className='rounded-xl'
          onClick={handleSave}
          disabled={isPending}
        >
          {isPending ? 'Saving…' : 'Save preferences'}
        </Button>
      </CardContent>
    </Card>
  )
}
