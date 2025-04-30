import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import FixResetTokensButton from "@/components/fix-reset-tokens-button"

export default function ResetTokenDiagnosticsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Password Reset System Diagnostics</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fix Reset Tokens Table</CardTitle>
            <CardDescription>
              This will recreate the password_reset_tokens table with the correct structure. Use this if you're
              experiencing issues with the password reset functionality.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FixResetTokensButton />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual Steps</CardTitle>
            <CardDescription>If the automatic fix doesn't work, try these manual steps:</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Check database connection settings in your environment variables</li>
              <li>Verify that the database user has sufficient permissions</li>
              <li>
                Run the following SQL query directly in your database:
                <pre className="bg-gray-800 p-3 rounded mt-2 overflow-x-auto">
                  {`DROP TABLE IF EXISTS password_reset_tokens;
                  
CREATE TABLE password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_valid BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);`}
                </pre>
              </li>
              <li>Restart your application server</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
