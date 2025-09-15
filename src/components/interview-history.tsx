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
                <Tabs defaultValue="answer">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="answer">Anonymized Answer</TabsTrigger>
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  </TabsList>
                  <TabsContent value="answer">
                    <div className="space-y-4 mt-4">
                      <div>
                        <p className="text-muted-foreground p-4 bg-gray-50 rounded-md border">
                          {entry.anonymizedAnswer}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="analysis">
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
