'use client';

import { useActionState, use } from 'react';
import { useFormStatus } from 'react-dom';
import { useEffect, useRef, useState, useTransition } from 'react';
import { getQuestionAction, State } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Video, Mic, RefreshCw, AlertCircle, Type } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import {
  analyzeAnswer,
  AnalyzeAnswerOutput,
} from '@/ai/flows/anonymize-transcript';
import InterviewHistory from './interview-history';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

const initialState: State = {
  message: null,
  question: null,
  questionIndex: -1,
  role: 'Software Engineer'
};

function StartInterviewButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      size="lg"
      className="px-8 py-6 text-lg"
    >
      {pending ? (
        <Loader2 className="animate-spin mr-2" />
      ) : (
        <Video className="mr-2" />
      )}
      Start Interview
    </Button>
  );
}

function NextQuestionButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} variant="outline">
      {pending ? (
        <Loader2 className="animate-spin mr-2" />
      ) : (
        <RefreshCw className="mr-2" />
      )}
      Next Question
    </Button>
  );
}

interface IWindow extends Window {
  webkitSpeechRecognition: any;
}
const { webkitSpeechRecognition }: IWindow =
  typeof window !== 'undefined' ? (window as IWindow) : ({} as IWindow);

export type InterviewEntry = {
  question: string;
  answer: string;
  anonymizedAnswer: string;
  entityMap: AnalyzeAnswerOutput['entityMap'];
  analysis: AnalyzeAnswerOutput | null;
  date: string;
  role: string;
  inputType: 'voice' | 'text';
};

export default function VideoInterviewClient() {
  const [state, formAction] = useActionState(getQuestionAction, initialState);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewHistory, setInterviewHistory] = useState<InterviewEntry[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Software Engineer');
  const [inputType, setInputType] = useState<'voice' | 'text'>('voice');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    const storedHistory = localStorage.getItem('interviewHistory');
    if (storedHistory) {
      setInterviewHistory(JSON.parse(storedHistory));
    }
    // Eagerly get first question on load
    const formData = new FormData();
    formData.set('role', selectedRole);
    startTransition(() => {
      formAction(formData);
    });
  }, []);

  useEffect(() => {
    if (state.message) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    }
  }, [state, toast]);

  useEffect(() => {
    if (!interviewStarted || inputType === 'text') return;

    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
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
          description:
            'Please enable camera/mic permissions in your browser settings for voice input.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [interviewStarted, inputType, toast]);

  useEffect(() => {
    if (typeof webkitSpeechRecognition === 'undefined' || inputType === 'text') {
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscriptRef.current + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'aborted') {
        return;
      }
      console.error('Speech recognition error', event.error);
      toast({
        variant: 'destructive',
        title: 'Speech Recognition Error',
        description: `An error occurred: ${event.error}. Please try again.`,
      });
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }, [toast, inputType]);

  const saveToHistory = (
    question: string,
    answer: string,
    analysisResult: AnalyzeAnswerOutput | null
  ) => {
    const newEntry: InterviewEntry = {
      question,
      answer,
      anonymizedAnswer:
        analysisResult?.anonymizedAnswer || '[Analysis failed]',
      entityMap: analysisResult?.entityMap || [],
      analysis: analysisResult,
      date: new Date().toISOString(),
      role: state.role!,
      inputType,
    };
    const updatedHistory = [newEntry, ...interviewHistory];
    setInterviewHistory(updatedHistory);
    localStorage.setItem('interviewHistory', JSON.stringify(updatedHistory));
  };

  const handleAnswer = async () => {
    let finalAnswer = '';

    if (inputType === 'voice') {
      if (isRecording) {
        recognitionRef.current?.stop();
        setIsRecording(false);
        finalAnswer = finalTranscriptRef.current.trim();
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
        finalTranscriptRef.current = '';
        recognitionRef.current?.start();
        setIsRecording(true);
        return; // Return early, analysis happens on stop
      }
    } else { // inputType === 'text'
      finalAnswer = transcript.trim();
    }

    if (finalAnswer && state.question && state.role) {
      setIsAnalyzing(true);
      try {
        const result = await analyzeAnswer({ question: state.question, answer: finalAnswer, role: state.role });
        saveToHistory(state.question, finalAnswer, result);
      } catch (error) {
        console.error('Failed to analyze answer:', error);
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: 'An unexpected error occurred during analysis.',
        });
        saveToHistory(state.question, finalAnswer, null);
      } finally {
        setIsAnalyzing(false);
        setTranscript('');
        finalTranscriptRef.current = '';
      }
    }
  };
  
  const handleNextQuestion = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }
    setTranscript('');
    finalTranscriptRef.current = '';
    const formData = new FormData();
    formData.set('role', state.role!);
    startTransition(() => {
      formAction(formData);
    });
  };

  const startInterview = (formData: FormData) => {
    setInterviewStarted(true);
    startTransition(() => formAction(formData));
  }

  if (interviewStarted) {
    return (
      <div className="flex flex-col items-center min-h-screen p-4 sm:p-6 md:p-8 bg-gray-50">
        <header className="w-full max-w-5xl mb-8 text-center">
          <div className="flex justify-center items-center gap-4 mb-4">
            <Logo className="w-12 h-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-headline font-bold">
              AI Interview Practice
            </h1>
          </div>
        </header>

        <main className="w-full max-w-4xl">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-semibold">
                  Current Question
                </CardTitle>
                 <CardDescription className='text-center'>For the role of: <span className='font-bold text-primary'>{state.role}</span></CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-xl text-muted-foreground mb-6 min-h-[6rem] flex items-center justify-center">
                  {state.question || <Loader2 className="animate-spin" />}
                </p>
                {inputType === 'voice' && <div className="relative aspect-video rounded-lg overflow-hidden border bg-black">
                  <video
                    ref={videoRef}
                    className="w-full h-full"
                    autoPlay
                    playsInline
                    muted
                  />
                  {hasCameraPermission === false && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <Alert variant="destructive" className="w-auto">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Device Access Required</AlertTitle>
                        <AlertDescription>
                          Please allow camera & mic access.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white bg-black/50 p-2 rounded-lg">
                    <Video
                      className={`h-5 w-5 ${
                        hasCameraPermission ? 'text-green-500' : 'text-red-500'
                      }`}
                    />
                    <Mic
                      className={`h-5 w-5 ${
                        hasCameraPermission ? 'text-green-500' : 'text-red-500'
                      }`}
                    />
                  </div>
                </div>}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">
                  Your Answer
                </CardTitle>
                <CardDescription>
                  {inputType === 'voice' 
                    ? (isRecording ? "Your microphone is on. Start speaking." : "Click 'Start Recording' to answer.")
                    : "Type your answer below and click 'Submit'."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="min-h-[200px] mb-4">
                  {inputType === 'voice' ? (
                     <div className="p-4 border rounded-md bg-gray-50 h-full">
                      <p className="text-muted-foreground">
                        {transcript || 'Your transcript will appear here...'}
                      </p>
                    </div>
                  ) : (
                    <Textarea 
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      placeholder="Type your answer here..."
                      className="h-full text-base"
                      rows={8}
                    />
                  )}
                   {isAnalyzing && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                      <Loader2 className="animate-spin h-4 w-4" />
                      <span>Analyzing and saving...</span>
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleAnswer}
                  className="w-full"
                  variant={isRecording ? 'destructive' : 'default'}
                  disabled={isAnalyzing}
                >
                  {inputType === 'voice' ? (
                    <>
                      <Mic className="mr-2" />
                      {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </>
                  ) : (
                    <>
                     <Type className="mr-2" />
                     Submit Answer
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNextQuestion();
            }}
            className="mt-6 flex justify-center"
          >
            <NextQuestionButton />
          </form>

          <InterviewHistory history={interviewHistory} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-3xl mb-8 text-center">
        <div className="flex justify-center items-center gap-4 mb-4">
          <Logo className="w-12 h-12 text-primary" />
          <h1 className="text-4xl md:text-5xl font-headline font-bold">
            AI Interview Bot
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Practice for your next interview and get instant, private feedback.
        </p>
      </header>

      <main className="w-full max-w-xl text-center">
        <form action={startInterview} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div>
                <Label htmlFor="role-select">Select a Role</Label>
                <Select name="role" value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger id="role-select">
                    <SelectValue placeholder="Select a role..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                    <SelectItem value="Product Manager">Product Manager</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            <div>
              <Label htmlFor="input-type-select">Input Method</Label>
              <Select name="inputType" value={inputType} onValueChange={(v: 'voice' | 'text') => setInputType(v)}>
                  <SelectTrigger id="input-type-select">
                    <SelectValue placeholder="Select input type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="voice">Voice (Speech-to-Text)</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                  </SelectContent>
                </Select>
            </div>
          </div>
          <StartInterviewButton />
        </form>
        <InterviewHistory history={interviewHistory} />
      </main>

      <footer className="w-full max-w-5xl mt-16 text-center text-sm text-muted-foreground absolute bottom-8">
        <p>
          &copy; {new Date().getFullYear()} AI Interview Bot. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
