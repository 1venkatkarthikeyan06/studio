import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InterviewEntry } from './video-interview-client';
import { formatDistanceToNow } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from './ui/badge';
import { Lightbulb, BookCheck, Clock } from 'lucide-react';

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
                <div className="flex justify-between items-center w-full pr-4">
                  <div className='flex flex-col text-left'>
                    <Badge variant="secondary" className='w-fit mb-1'>{entry.role}</Badge>
                    <span>{entry.question}</span>
                  </div>
                  <span className="text-sm text-muted-foreground ml-4 shrink-0">
                    {formatDistanceToNow(new Date(entry.date), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Tabs defaultValue="analysis">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="analysis">Feedback</TabsTrigger>
                    <TabsTrigger value="answer">Anonymized Answer</TabsTrigger>
                    <TabsTrigger value="pii">PII Analysis</TabsTrigger>
                  </TabsList>
                  <TabsContent value="analysis">
                    <div className="space-y-4 mt-4">
                      {entry.analysis ? (
                        <div className='space-y-4'>
                           <div className="flex items-start gap-4 p-4 bg-blue-50/50 border border-blue-200 rounded-lg">
                              <Lightbulb className="h-5 w-5 text-blue-600 mt-1 shrink-0" />
                              <div>
                                <h4 className="font-semibold text-blue-800">Clarity & Conciseness</h4>
                                <p className="text-sm text-gray-700">{entry.analysis.feedback.clarity}</p>
                              </div>
                            </div>
                             <div className="flex items-start gap-4 p-4 bg-green-50/50 border border-green-200 rounded-lg">
                              <BookCheck className="h-5 w-5 text-green-600 mt-1 shrink-0" />
                              <div>
                                <h4 className="font-semibold text-green-800">Relevance</h4>
                                <p className="text-sm text-gray-700">{entry.analysis.feedback.relevance}</p>
                              </div>
                            </div>
                           {entry.inputType === 'voice' && <div className="flex items-start gap-4 p-4 bg-yellow-50/50 border border-yellow-200 rounded-lg">
                              <Clock className="h-5 w-5 text-yellow-600 mt-1 shrink-0" />
                              <div>
                                <h4 className="font-semibold text-yellow-800">Speech Pace</h4>
                                <p className="text-sm text-gray-700">{entry.analysis.feedback.speechPace}</p>
                              </div>
                            </div>}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground">No analysis available.</p>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="answer">
                    <div className="space-y-4 mt-4">
                      <div>
                        <p className="text-muted-foreground p-4 bg-gray-50 rounded-md border">
                          {entry.anonymizedAnswer}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="pii">
                    <div className="space-y-4 mt-4">
                      <p className="text-sm text-muted-foreground">
                        The following sensitive information was identified and
                        replaced.
                      </p>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Original</TableHead>
                            <TableHead>Anonymized</TableHead>
                            <TableHead>Type</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {entry.entityMap && entry.entityMap.length > 0 ? (
                            entry.entityMap.map((entity, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">
                                  {entity.original}
                                </TableCell>
                                <TableCell>{entity.anonymized}</TableCell>
                                <TableCell>{entity.type}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={3}
                                className="text-center text-muted-foreground"
                              >
                                No sensitive data detected.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
