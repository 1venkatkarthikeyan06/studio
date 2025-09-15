'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { getQuestionAction, State } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    <Button type="submit" disabled={pending} size="lg" className="px-8 py-6 text-lg">
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

// Add at the top of the file
interface IWindow extends Window {
  webkitSpeechRecognition: any;
}
const { webkitSpeechRecognition }: IWindow =
  typeof window !== 'undefined' ? (window as IWindow) : ({} as IWindow);

export default function VideoInterviewClient() {
  const [state, formAction] = useActionState(getQuestionAction, initialState);
  const { toast } = useToast();
  const [interviewStarted, setInterviewStarted] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

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
    if (!interviewStarted) return;
  
    const getCameraPermission = async () => {
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
  
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [interviewStarted, toast]);

  useEffect(() => {
    if (typeof webkitSpeechRecognition === 'undefined') {
      // Silently fail if not supported
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(transcript + finalTranscript + interimTranscript);
    };
    
    recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        toast({
            variant: "destructive",
            title: "Speech Recognition Error",
            description: `An error occurred: ${event.error}. Please try again.`
        });
        setIsRecording(false);
    }
    
    recognitionRef.current = recognition;

  }, [toast, transcript]);

  const handleStart = (formData: FormData) => {
    setInterviewStarted(true);
    formAction(formData);
  }

  const handleAnswer = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (typeof webkitSpeechRecognition === 'undefined') {
        toast({
          variant: 'destructive',
          title: 'Browser Not Supported',
          description:
            'Speech recognition is not supported in your browser. Please use Google Chrome.',
        });
        return;
      }
      setTranscript(''); 
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  }
  
  const handleNextQuestion = (formData: FormData) => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }
    setTranscript('');
    formAction(formData);
  }

  if (interviewStarted) {
    return (
      <div className="flex flex-col items-center min-h-screen p-4 sm:p-6 md:p-8 bg-gray-50">
        <header className="w-full max-w-5xl mb-8 text-center">
            <div className="flex justify-center items-center gap-4 mb-4">
            <Logo className="w-12 h-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-headline font-bold">Video Interview Practice</h1>
            </div>
        </header>

        <main className="w-full max-w-4xl">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                  <CardHeader>
                      <CardTitle className="text-center text-2xl font-semibold">Current Question</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                      <p className="text-xl text-muted-foreground mb-6 min-h-[6rem] flex items-center justify-center">
                          {state.question || <Loader2 className="animate-spin" />}
                      </p>
                      <div className="relative aspect-video rounded-lg overflow-hidden border bg-black">
                          <video ref={videoRef} className="w-full h-full" autoPlay playsInline muted />
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

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">Your Answer</CardTitle>
                  <CardDescription>
                    {isRecording ? "Your microphone is on. Start speaking." : "Click 'Answer' to start recording your response."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[200px] p-4 border rounded-md bg-gray-50 mb-4">
                    <p className="text-muted-foreground">{transcript || "Your transcript will appear here..."}</p>
                  </div>
                  <Button onClick={handleAnswer} className="w-full" variant={isRecording ? "destructive" : "default"}>
                    <Mic className="mr-2" />
                    {isRecording ? 'Stop Answering' : 'Answer Question'}
                  </Button>
                </CardContent>
              </Card>
            </div>
            <form action={handleNextQuestion} className="mt-6 flex justify-center">
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
          Practice your interview skills. The AI will ask you relevant HR questions.
        </p>
      </header>

      <main className="w-full max-w-xl text-center">
        <form action={handleStart}>
          <SubmitButton />
        </form>
      </main>
      
      <footer className="w-full max-w-5xl mt-16 text-center text-sm text-muted-foreground absolute bottom-8">
        <p>&copy; {new Date().getFullYear()} AI Video Interviewer. All rights reserved.</p>
      </footer>
    </div>
  );
}
