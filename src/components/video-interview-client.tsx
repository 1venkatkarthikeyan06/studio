'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { getQuestionAction, State } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Video, Mic, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';

const initialState: State = {
  message: null,
  question: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  const text = pending ? 'Generating...' : 'Start Interview';
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="animate-spin mr-2" /> : <Video className="mr-2" />}
      {text}
    </Button>
  );
}

function NextQuestionButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} variant="outline">
      {pending ? <Loader2 className="animate-spin mr-2" /> : <RefreshCw className="mr-2" />}
      Next Question
    </Button>
  );
}

export default function VideoInterviewClient() {
  const [state, formAction] = useFormState(getQuestionAction, initialState);
  const { toast } = useToast();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

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
    const getCameraPermission = async () => {
      if (!state.question) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    getCameraPermission();
  }, [state.question, toast]);

  if (state.question) {
    return (
      <div className="flex flex-col items-center min-h-screen p-4 sm:p-6 md:p-8 bg-gray-50">
        <header className="w-full max-w-5xl mb-8 text-center">
            <div className="flex justify-center items-center gap-4 mb-4">
            <Logo className="w-12 h-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-headline font-bold">Video Interview Practice</h1>
            </div>
        </header>

        <main className="w-full max-w-4xl">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-semibold">Current Question</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-xl text-muted-foreground mb-6">{state.question}</p>
                    <div className="relative aspect-video rounded-lg overflow-hidden border bg-black">
                        <video ref={videoRef} className="w-full h-full" autoPlay muted playsInline />
                        {hasCameraPermission === false && (
                             <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                <Alert variant="destructive" className="w-auto">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Camera Access Required</AlertTitle>
                                    <AlertDescription>
                                        Please allow camera access to use this feature.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}
                         <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white bg-black/50 p-2 rounded-lg">
                            <Video className={`h-5 w-5 ${hasCameraPermission ? 'text-green-500' : 'text-red-500'}`} />
                            <Mic className={`h-5 w-5 ${hasCameraPermission ? 'text-green-500' : 'text-red-500'}`} />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <form action={formAction} className="mt-6 flex justify-center">
                <input type="hidden" name="jobTitle" value={state.jobDetails?.jobTitle} />
                <input type="hidden" name="jobDescription" value={state.jobDetails?.jobDescription} />
                <NextQuestionButton />
            </form>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-3xl mb-8 text-center">
        <div className="flex justify-center items-center gap-4 mb-4">
          <Logo className="w-12 h-12 text-primary" />
          <h1 className="text-4xl md:text-5xl font-headline font-bold">AI Video Interviewer</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Practice your interview skills. Tell us about the job you're applying for, and our AI will ask you relevant questions.
        </p>
      </header>

      <main className="w-full max-w-xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>
              Provide the job title and description to start the interview.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="jobTitle" className="font-semibold">Job Title</Label>
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  placeholder="e.g., Senior Software Engineer"
                  required
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="jobDescription" className="font-semibold">Job Description</Label>
                <Textarea
                  id="jobDescription"
                  name="jobDescription"
                  placeholder="Paste the job description here..."
                  rows={8}
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
      </main>
      
      <footer className="w-full max-w-5xl mt-16 text-center text-sm text-muted-foreground absolute bottom-8">
        <p>&copy; {new Date().getFullYear()} AI Video Interviewer. All rights reserved.</p>
      </footer>
    </div>
  );
}
