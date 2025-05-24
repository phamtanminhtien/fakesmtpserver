import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SafeEmailRenderer } from "@/components/SafeEmailRenderer";
import { useEmails } from "@/hooks/useEmails";
import { useSMTPInfo } from "@/hooks/useSMTPInfo";
import { Separator } from "@radix-ui/react-separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import {
  AlertCircle,
  Copy,
  Mail,
  Pause,
  Play,
  RefreshCw,
  Server,
  Trash2,
  Users,
  X,
} from "lucide-react";

function App() {
  const {
    emails,
    selectedEmail,
    loading: emailsLoading,
    error: emailsError,
    isPolling,
    clearEmails,
    deleteEmail,
    refreshEmails,
    selectEmail,
    togglePolling,
  } = useEmails();

  const {
    connectionInfo,
    error: smtpError,
    refreshConnectionInfo,
  } = useSMTPInfo();

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const serverInfo = connectionInfo
    ? `${connectionInfo.host}:${connectionInfo.port}`
    : "Loading...";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Fake SMTP Server</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="default">
                <Server className="h-3 w-3 mr-1" />
                Running
              </Badge>
              {connectionInfo && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {serverInfo}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(serverInfo)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <Button
                onClick={togglePolling}
                variant={isPolling ? "destructive" : "default"}
                className={!isPolling ? "text-red-500" : "text-green-500"}
                size="sm"
              >
                {isPolling ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    <span>Pause Updates</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    <span>Resume Updates</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Error Display */}
        {(emailsError || smtpError) && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span className="text-destructive font-medium">
                {emailsError || smtpError}
              </span>
            </div>
          </div>
        )}

        <Tabs defaultValue="emails" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="emails">Email Inbox</TabsTrigger>
            <TabsTrigger value="settings">Server Settings</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="emails" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">Email Inbox</h2>
              <div className="flex items-center space-x-2">
                <Badge
                  variant="outline"
                  className="flex items-center space-x-1"
                >
                  <div
                    className={`h-2 w-2 rounded-full ${
                      isPolling ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  <span>{isPolling ? "Auto-refresh" : "Paused"}</span>
                </Badge>
                <Button
                  onClick={refreshEmails}
                  variant="outline"
                  size="sm"
                  disabled={emailsLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      emailsLoading ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>
                <Button
                  onClick={clearEmails}
                  variant="destructive"
                  size="sm"
                  disabled={emailsLoading || emails.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Email List */}
              <Card>
                <CardHeader>
                  <CardTitle>Received Emails ({emails.length})</CardTitle>
                  <CardDescription>
                    Click on an email to view its details
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-y-auto">
                    {emailsLoading && emails.length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground">
                        <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-20 animate-spin" />
                        <p>Loading emails...</p>
                      </div>
                    ) : emails.length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground">
                        <Mail className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No emails received yet</p>
                        <p className="text-sm">
                          Send an email to the SMTP server to see it here
                        </p>
                      </div>
                    ) : (
                      emails.map((email, index) => (
                        <div key={email.id}>
                          <div
                            className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                              selectedEmail?.id === email.id ? "bg-muted" : ""
                            }`}
                            onClick={() => selectEmail(email)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {email.subject || "(No Subject)"}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  From: {email.from}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2 ml-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(email.receivedAt)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteEmail(email.id);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  {email.to.length} recipient
                                  {email.to.length !== 1 ? "s" : ""}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatBytes(email.size)}
                                </span>
                              </div>
                            </div>
                          </div>
                          {index < emails.length - 1 && <Separator />}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Email Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Email Details</CardTitle>
                  <CardDescription>
                    {selectedEmail
                      ? "Viewing selected email"
                      : "Select an email to view details"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedEmail ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">From:</label>
                          <p className="text-sm text-muted-foreground">
                            {selectedEmail.from}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Date:</label>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(selectedEmail.receivedAt)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">To:</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedEmail.to.map((recipient, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                            >
                              {recipient}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Subject:</label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedEmail.subject || "(No Subject)"}
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <label className="text-sm font-medium mb-3 block">
                          Content:
                        </label>
                        <Tabs defaultValue="rendered" className="w-full">
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="rendered">Rendered</TabsTrigger>
                            <TabsTrigger value="html">HTML</TabsTrigger>
                            <TabsTrigger value="text">Text</TabsTrigger>
                            <TabsTrigger value="raw">Raw</TabsTrigger>
                          </TabsList>

                          <TabsContent value="rendered" className="mt-4">
                            <div className="border rounded-lg">
                              <div className="p-3 bg-muted/50 border-b text-xs font-medium text-muted-foreground">
                                RENDERED VIEW
                              </div>
                              <div className="p-4 bg-white min-h-[200px] max-h-[400px] overflow-auto">
                                {selectedEmail.html ? (
                                  <SafeEmailRenderer
                                    htmlContent={selectedEmail.html}
                                  />
                                ) : selectedEmail.text ? (
                                  <pre className="text-sm whitespace-pre-wrap font-sans">
                                    {selectedEmail.text}
                                  </pre>
                                ) : (
                                  <p className="text-sm text-muted-foreground italic">
                                    No content available
                                  </p>
                                )}
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="html" className="mt-4">
                            <div className="border rounded-lg">
                              <div className="flex items-center justify-between p-3 bg-muted/50 border-b">
                                <span className="text-xs font-medium text-muted-foreground">
                                  HTML SOURCE
                                </span>
                                {selectedEmail.html && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      copyToClipboard(selectedEmail.html!)
                                    }
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                              <div className="p-4 bg-muted min-h-[200px] max-h-[400px] overflow-auto">
                                {selectedEmail.html ? (
                                  <pre className="text-xs font-mono whitespace-pre-wrap">
                                    {selectedEmail.html}
                                  </pre>
                                ) : (
                                  <p className="text-sm text-muted-foreground italic">
                                    No HTML content available
                                  </p>
                                )}
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="text" className="mt-4">
                            <div className="border rounded-lg">
                              <div className="flex items-center justify-between p-3 bg-muted/50 border-b">
                                <span className="text-xs font-medium text-muted-foreground">
                                  PLAIN TEXT
                                </span>
                                {selectedEmail.text && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      copyToClipboard(selectedEmail.text!)
                                    }
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                              <div className="p-4 bg-muted min-h-[200px] max-h-[400px] overflow-auto">
                                {selectedEmail.text ? (
                                  <pre className="text-sm whitespace-pre-wrap">
                                    {selectedEmail.text}
                                  </pre>
                                ) : (
                                  <p className="text-sm text-muted-foreground italic">
                                    No text content available
                                  </p>
                                )}
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="raw" className="mt-4">
                            <div className="border rounded-lg">
                              <div className="flex items-center justify-between p-3 bg-muted/50 border-b">
                                <span className="text-xs font-medium text-muted-foreground">
                                  RAW EMAIL SOURCE
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    copyToClipboard(selectedEmail.raw)
                                  }
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="p-4 bg-muted min-h-[200px] max-h-[400px] overflow-auto">
                                <pre className="text-xs font-mono whitespace-pre-wrap">
                                  {selectedEmail.raw}
                                </pre>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Mail className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>Select an email from the list to view its details</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-6">
                Server Information
              </h2>

              <Card>
                <CardHeader>
                  <CardTitle>SMTP Server Details</CardTitle>
                  <CardDescription>
                    Complete server configuration and connection information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Server Status Section */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Status & Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <span className="text-sm font-medium">
                            Server Status
                          </span>
                          <div className="mt-1">
                            <Badge variant="default">Running</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <span className="text-sm font-medium">Protocol</span>
                          <div className="mt-1">
                            <span className="text-sm text-muted-foreground">
                              SMTP
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <span className="text-sm font-medium">
                            Auto-refresh
                          </span>
                          <div className="mt-1">
                            <Badge
                              variant={isPolling ? "default" : "secondary"}
                            >
                              {isPolling ? "Active" : "Paused"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <span className="text-sm font-medium">
                            Refresh Interval
                          </span>
                          <div className="mt-1">
                            <span className="text-sm text-muted-foreground">
                              {parseInt(
                                import.meta.env.VITE_REFRESH_INTERVAL || "2000",
                                10
                              ) / 1000}
                              s
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Connection Details Section */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Connection Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <span className="text-sm font-medium">
                            Host Address
                          </span>
                          <div className="mt-1">
                            <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                              {connectionInfo?.host || "Loading..."}
                            </span>
                          </div>
                        </div>
                        {connectionInfo?.host && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(connectionInfo.host)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <span className="text-sm font-medium">
                            Port Number
                          </span>
                          <div className="mt-1">
                            <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                              {connectionInfo?.port || "Loading..."}
                            </span>
                          </div>
                        </div>
                        {connectionInfo?.port && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(connectionInfo.port.toString())
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <span className="text-sm font-medium">
                            Full Server Address
                          </span>
                          <div className="mt-1">
                            <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                              {connectionInfo
                                ? `${connectionInfo.host}:${connectionInfo.port}`
                                : "Loading..."}
                            </span>
                          </div>
                        </div>
                        {connectionInfo && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(
                                `${connectionInfo.host}:${connectionInfo.port}`
                              )
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <span className="text-sm font-medium">
                            Secure Connection
                          </span>
                          <div className="mt-1">
                            <Badge
                              variant={
                                connectionInfo?.secure ? "default" : "secondary"
                              }
                            >
                              {connectionInfo?.secure
                                ? "TLS/SSL Enabled"
                                : "Not Encrypted"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Authentication Section */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Authentication</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <span className="text-sm font-medium">
                            Authentication Status
                          </span>
                          <div className="mt-1">
                            <Badge
                              variant={
                                connectionInfo?.requiresAuth
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {connectionInfo?.requiresAuth
                                ? "Authentication Required"
                                : "No Authentication"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {connectionInfo?.requiresAuth && connectionInfo.auth && (
                        <>
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <span className="text-sm font-medium">
                                Username
                              </span>
                              <div className="mt-1">
                                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                  {connectionInfo.auth.user}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(connectionInfo.auth!.user)
                              }
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <span className="text-sm font-medium">
                                Password
                              </span>
                              <div className="mt-1">
                                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                  {connectionInfo.auth.pass}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(connectionInfo.auth!.pass)
                              }
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Configuration Examples Section */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Configuration Examples
                    </h3>
                    <div className="space-y-4">
                      {connectionInfo && (
                        <>
                          <div className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">
                                Node.js (nodemailer)
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  copyToClipboard(`{
  host: '${connectionInfo.host}',
  port: ${connectionInfo.port},
  secure: ${connectionInfo.secure}${
    connectionInfo.requiresAuth && connectionInfo.auth
      ? `,
  auth: {
    user: '${connectionInfo.auth.user}',
    pass: '${connectionInfo.auth.pass}'
  }`
      : ""
  }
}`)
                                }
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                              {`{
  host: '${connectionInfo.host}',
  port: ${connectionInfo.port},
  secure: ${connectionInfo.secure}${
    connectionInfo.requiresAuth && connectionInfo.auth
      ? `,
  auth: {
    user: '${connectionInfo.auth.user}',
    pass: '${connectionInfo.auth.pass}'
  }`
      : ""
  }
}`}
                            </pre>
                          </div>

                          <div className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">
                                SMTP URL
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  copyToClipboard(
                                    `smtp${connectionInfo.secure ? "s" : ""}://${connectionInfo.requiresAuth && connectionInfo.auth ? `${connectionInfo.auth.user}:${connectionInfo.auth.pass}@` : ""}${connectionInfo.host}:${connectionInfo.port}`
                                  )
                                }
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                              {`smtp${connectionInfo.secure ? "s" : ""}://${connectionInfo.requiresAuth && connectionInfo.auth ? `${connectionInfo.auth.user}:${connectionInfo.auth.pass}@` : ""}${connectionInfo.host}:${connectionInfo.port}`}
                            </pre>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-4 pt-4 border-t">
                    <Button onClick={refreshConnectionInfo} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Info
                    </Button>
                    {connectionInfo && (
                      <Button
                        onClick={() =>
                          copyToClipboard(
                            JSON.stringify(connectionInfo, null, 2)
                          )
                        }
                        variant="outline"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy All Config
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-6">
                Statistics
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Emails
                    </CardTitle>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{emails.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Received emails
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Unique Senders
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {new Set(emails.map((e) => e.from)).size}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Different email addresses
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Size
                    </CardTitle>
                    <Server className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatBytes(
                        emails.reduce((sum, email) => sum + email.size, 0)
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Storage used
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
