type Props = { params: Promise<{ id: string }> }

export default async function AssignProgramPage({ params }: Props) {
  const { id } = await params
  return (
    <div>
      <h1 className='text-2xl font-semibold'>Assign program</h1>
      <p className='text-muted-foreground'>Assign program to client (LIFTKIT-SPEC Phase 4). Program ID: {id}</p>
    </div>
  )
}
