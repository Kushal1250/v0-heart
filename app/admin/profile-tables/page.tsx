import CreateProfileTables from "@/scripts/create-profile-tables"

export default function ProfileTablesPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Profile Tables Setup</h1>
        <p className="mb-6 text-gray-600">
          This page allows you to create the necessary database tables for the profile functionality.
        </p>

        <CreateProfileTables />
      </div>
    </div>
  )
}
