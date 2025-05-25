import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTLS } from "@/hooks/useTLS";
import {
  Upload,
  Shield,
  ShieldCheck,
  Trash2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export function TLSCertificateUpload() {
  const {
    certificateInfo,
    loading,
    uploading,
    deleting,
    error,
    uploadCertificate,
    deleteCertificate,
  } = useTLS();

  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const handleCertificateFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null;
    setCertificateFile(file);
    setUploadSuccess(null);
  };

  const handleKeyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setKeyFile(file);
    setUploadSuccess(null);
  };

  const handleUpload = async () => {
    if (!certificateFile || !keyFile) {
      return;
    }

    try {
      const result = await uploadCertificate(certificateFile, keyFile);
      setUploadSuccess(result.message);
      setCertificateFile(null);
      setKeyFile(null);
      // Reset file inputs
      const certInput = document.getElementById(
        "certificate-file"
      ) as HTMLInputElement;
      const keyInput = document.getElementById("key-file") as HTMLInputElement;
      if (certInput) certInput.value = "";
      if (keyInput) keyInput.value = "";
    } catch {
      // Error is handled by the hook
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCertificate();
      setUploadSuccess(null);
    } catch {
      // Error is handled by the hook
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const isUploadDisabled = !certificateFile || !keyFile || uploading;

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload TLS Certificate</span>
          </CardTitle>
          <CardDescription>
            Upload a TLS certificate and private key to enable HTTPS/TLS support
            for the SMTP server. Both files are required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Success Message */}
          {uploadSuccess && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-green-800 text-sm">{uploadSuccess}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="certificate-file" className="text-sm font-medium">
                Certificate File (.crt, .pem)
              </label>
              <Input
                id="certificate-file"
                type="file"
                accept=".crt,.pem,.cert"
                onChange={handleCertificateFileChange}
                disabled={uploading}
              />
              {certificateFile && (
                <p className="text-xs text-muted-foreground">
                  Selected: {certificateFile.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="key-file" className="text-sm font-medium">
                Private Key File (.key, .pem)
              </label>
              <Input
                id="key-file"
                type="file"
                accept=".key,.pem"
                onChange={handleKeyFileChange}
                disabled={uploading}
              />
              {keyFile && (
                <p className="text-xs text-muted-foreground">
                  Selected: {keyFile.name}
                </p>
              )}
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={isUploadDisabled}
            className="w-full text-black"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Certificate
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Certificate Info Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {certificateInfo?.hasActive ? (
              <ShieldCheck className="h-5 w-5 text-green-600" />
            ) : (
              <Shield className="h-5 w-5 text-gray-400" />
            )}
            <span>Current Certificate Status</span>
          </CardTitle>
          <CardDescription>
            Information about the currently active TLS certificate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
              <span>Loading certificate information...</span>
            </div>
          ) : certificateInfo?.hasActive ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge
                  variant="default"
                  className="bg-green-100 text-green-800"
                >
                  Active Certificate
                </Badge>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </>
                  )}
                </Button>
              </div>

              {certificateInfo.error ? (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-800 text-sm">
                    Certificate loaded but details could not be parsed:{" "}
                    {certificateInfo.error}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {certificateInfo.uploadedAt && (
                    <div>
                      <span className="font-medium">Uploaded:</span>
                      <p className="text-muted-foreground">
                        {formatDate(certificateInfo.uploadedAt)}
                      </p>
                    </div>
                  )}
                  {certificateInfo.subject && (
                    <div>
                      <span className="font-medium">Subject:</span>
                      <p className="text-muted-foreground break-all">
                        {certificateInfo.subject}
                      </p>
                    </div>
                  )}
                  {certificateInfo.issuer && (
                    <div>
                      <span className="font-medium">Issuer:</span>
                      <p className="text-muted-foreground break-all">
                        {certificateInfo.issuer}
                      </p>
                    </div>
                  )}
                  {certificateInfo.validFrom && (
                    <div>
                      <span className="font-medium">Valid From:</span>
                      <p className="text-muted-foreground">
                        {formatDate(certificateInfo.validFrom)}
                      </p>
                    </div>
                  )}
                  {certificateInfo.validTo && (
                    <div>
                      <span className="font-medium">Valid To:</span>
                      <p className="text-muted-foreground">
                        {formatDate(certificateInfo.validTo)}
                      </p>
                    </div>
                  )}
                  {certificateInfo.fingerprint && (
                    <div className="md:col-span-2">
                      <span className="font-medium">Fingerprint:</span>
                      <p className="text-muted-foreground font-mono text-xs break-all">
                        {certificateInfo.fingerprint}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">
                No TLS certificate is currently active.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload a certificate above to enable TLS support.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
