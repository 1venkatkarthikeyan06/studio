import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InterviewEntry } from './video-interview-client';
import { formatDistanceToNow } from 'date-fns';

type InterviewHistoryProps = {
  history: InterviewEntry[];
};

export default function InterviewHistory({ history }: InterviewHistoryProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <Card className="mt-8 w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center">
          Interview History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {history.map((entry, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger>
                <div className="flex justify-between w-full pr-4">
                  <span>{entry.question}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(entry.date), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Your Answer (Anonymized)</h4>
                    <p className="text-muted-foreground p-4 bg-gray-50 rounded-md border">
                      {entry.anonymizedAnswer}
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
