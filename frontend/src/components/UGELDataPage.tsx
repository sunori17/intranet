import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from '../lib/auth-context';
import { toast } from 'sonner';
import { Upload, Send, Download, FileSpreadsheet, CheckCircle2, Clock } from 'lucide-react';

interface UGELDataPageProps {
  selectedBimester: string;
}

interface UploadedFile {
  id: string;
  name: string;
  uploadedAt: string;
  status: 'pending' | 'sent';
}

export function UGELDataPage({ selectedBimester }: UGELDataPageProps) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      id: '1',
      name: 'UGEL_Bimestre_I_2024.xlsx',
      uploadedAt: '2024-03-15',
      status: 'sent'
    },
    {
      id: '2',
      name: 'UGEL_Bimestre_II_2024.xlsx',
      uploadedAt: '2024-05-20',
      status: 'sent'
    }
  ]);

  const isTutor = user?.role === 'tutor';
  const isPrincipal = user?.role === 'principal';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast.error('Seleccione un archivo primero');
      return;
    }

    const newFile: UploadedFile = {
      id: Date.now().toString(),
      name: file.name,
      uploadedAt: new Date().toISOString().split('T')[0],
      status: isTutor ? 'pending' : 'sent'
    };

    setUploadedFiles(prev => [...prev, newFile]);
    setFile(null);
    
    if (isTutor) {
      toast.success('Archivo subido. Envíelo a la directora para que lo procese.');
    } else {
      toast.success('Archivo UGEL subido exitosamente');
    }
  };

  const handleSendToPrincipal = (fileId: string) => {
    setUploadedFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'sent' as const } : f
    ));
    toast.success('Archivo enviado a la directora');
  };

  const handleDownload = (file: UploadedFile) => {
    toast.success(`Descargando ${file.name}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Gestión UGEL</h1>
        <p className="text-gray-600 mt-1">
          {isTutor && 'Suba y envíe archivos Excel a la directora'}
          {isPrincipal && 'Gestione los archivos UGEL recibidos de los tutores'}
        </p>
      </div>

      {/* Upload Section - Only for Tutors */}
      {isTutor && (
        <Card>
          <CardHeader>
            <CardTitle>Subir Archivo Excel</CardTitle>
            <CardDescription>
              Cargue el archivo de datos para enviar a la directora
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Seleccionar Archivo (.xlsx, .xls)</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                <Button onClick={handleUpload} disabled={!file}>
                  <Upload className="h-4 w-4 mr-2" />
                  Subir
                </Button>
              </div>
              {file && (
                <p className="text-sm text-gray-600">
                  Archivo seleccionado: {file.name}
                </p>
              )}
            </div>

            <Alert>
              <FileSpreadsheet className="h-4 w-4" />
              <AlertDescription>
                Una vez subido, deberá enviar el archivo a la directora para que ella lo procese.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isTutor ? 'Mis Archivos Subidos' : 'Archivos Recibidos'}
          </CardTitle>
          <CardDescription>
            {isTutor 
              ? 'Gestione los archivos que ha subido para la UGEL'
              : 'Descargue los archivos enviados por los tutores'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {uploadedFiles.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No hay archivos disponibles
              </p>
            ) : (
              uploadedFiles.map(file => (
                <div 
                  key={file.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <FileSpreadsheet className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-600">
                        Subido el {file.uploadedAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {file.status === 'sent' ? (
                      <Badge className="bg-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {isTutor ? 'Enviado' : 'Recibido'}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[#ff8000] border-[#ff8000]">
                        <Clock className="h-3 w-3 mr-1" />
                        Pendiente
                      </Badge>
                    )}

                    {isPrincipal && (
                      <Button size="sm" variant="outline" onClick={() => handleDownload(file)}>
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                    )}

                    {isTutor && file.status === 'pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleSendToPrincipal(file.id)}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Enviar a Directora
                      </Button>
                    )}

                    {isTutor && file.status === 'sent' && (
                      <Button size="sm" variant="outline" onClick={() => handleDownload(file)}>
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Instrucciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isTutor ? (
            <>
              <p className="text-sm text-blue-800">
                1. Prepare el archivo Excel con los datos requeridos por UGEL
              </p>
              <p className="text-sm text-blue-800">
                2. Suba el archivo usando el formulario anterior
              </p>
              <p className="text-sm text-blue-800">
                3. Envíe el archivo a la directora haciendo clic en "Enviar a Directora"
              </p>
              <p className="text-sm text-blue-800">
                4. La directora procesará y gestionará el envío final a UGEL
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-blue-800">
                1. Revise los archivos recibidos de los tutores
              </p>
              <p className="text-sm text-blue-800">
                2. Descargue los archivos necesarios
              </p>
              <p className="text-sm text-blue-800">
                3. Procese y consolide la información según los requerimientos de UGEL
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
