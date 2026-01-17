import GenerateBRD from '@/components/brd/GenerateBRD'

export default function GenerateBRDPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Generate BRD</h1>
        <p className="text-muted-foreground">
          Create a comprehensive Business Requirements Document from your uploaded
          files
        </p>
      </div>

      <GenerateBRD />
    </div>
  )
}
