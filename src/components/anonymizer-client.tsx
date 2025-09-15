'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useRef } from 'react';
import { anonymizeAction, State } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Loader2, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';

const initialState: State = {
  message: null,
  data: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2" />}
      Anonymize Transcript
    </Button>
  );
}

export default function AnonymizerClient() {
  const [state, formAction] = useFormState(anonymizeAction, initialState);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    }
  }, [state.message, toast]);

  useEffect(() => {
    if (state.data) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [state.data]);

  const handleDownload = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  };
  
  const exampleTranscript = `Interview with John Doe on April 15, 2024. John is 32 years old and lives in New York. He previously worked at Acme Corp. His email is john.doe@example.com and phone is 123-456-7890.`;

  return (
    <div className="flex flex-col items-center min-h-screen p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-5xl mb-8 text-center">
        <div className="flex justify-center items-center gap-4 mb-4">
          <Logo className="w-12 h-12 text-primary" />
          <h1 className="text-4xl md:text-5xl font-headline font-bold">Interview Anonymizer</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Paste an interview transcript below to automatically detect and anonymize sensitive personal information using AI.
        </p>
      </header>

      <main className="w-full max-w-5xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Submit Transcript</CardTitle>
            <CardDescription>
              Your data is processed securely and is not stored after the anonymization is complete.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="transcript" className="font-semibold">Interview Transcript</Label>
                <Textarea
                  id="transcript"
                  name="transcript"
                  placeholder={exampleTranscript}
                  rows={12}
                  className="font-code text-sm"
                  required
                />
              </div>
              <div className="flex justify-end">
                <SubmitButton />
              </div>
            </form>
          </CardContent>
        </Card>

        {state.data && (
          <div ref={resultsRef} className="mt-12 space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Original Transcript</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80 rounded-md border p-4 font-code text-sm">
                    <pre className="whitespace-pre-wrap break-words">{state.data.originalTranscript}</pre>
                  </ScrollArea>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle>Anonymized Transcript</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(state.data!.anonymizedTranscript, 'anonymized_transcript.txt', 'text/plain')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80 rounded-md border bg-primary/5 p-4 font-code text-sm">
                    <pre className="whitespace-pre-wrap break-words">{state.data.anonymizedTranscript}</pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Entity Mapping Table</CardTitle>
                  <CardDescription>For secure internal use only. Links PII to identifiers.</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(JSON.stringify(state.data!.entityMappingTable, null, 2), 'entity_mapping.json', 'application/json')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80 border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Original Information (PII)</TableHead>
                        <TableHead className="text-right">Anonymized Identifier</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(state.data.entityMappingTable).length > 0 ? (
                        Object.entries(state.data.entityMappingTable).map(([original, anonymized]) => (
                          <TableRow key={original}>
                            <TableCell className="font-medium">{original}</TableCell>
                            <TableCell className="text-right font-code">{anonymized}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center text-muted-foreground">
                            No sensitive information was detected.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      
      <footer className="w-full max-w-5xl mt-16 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Interview Anonymizer. All rights reserved.</p>
      </footer>
    </div>
  );
}
