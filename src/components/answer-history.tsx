
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Trash2, ClipboardCopy, Loader2 } from "lucide-react";
import { translations, Language } from "@/lib/translations";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export interface AnswerRecord {
  question: string;
  answer: string;
  timestamp: string;
}

interface AnswerHistoryProps {
  history: AnswerRecord[];
  lang: Language;
  onClear: () => void;
  onDeleteItem: (index: number) => void;
  isLoading: boolean;
}

export function AnswerHistory({ history, lang, onClear, onDeleteItem, isLoading }: AnswerHistoryProps) {
  const t = translations[lang];
  const { toast } = useToast();
  const [openItem, setOpenItem] = useState<string | undefined>();

  useEffect(() => {
    // Automatically open the first item (the newest one) when history updates and it's not loading
    if (!isLoading && history.length > 0) {
      setOpenItem("item-0");
    } else if (history.length === 0) {
      setOpenItem(undefined);
    }
  }, [history, isLoading]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t.history.copied,
    });
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2">
            <History className="text-primary" />
            {t.history.title}
          </CardTitle>
          <CardDescription>{t.history.description}</CardDescription>
        </div>
        {history.length > 0 && (
            <Button variant="outline" size="sm" onClick={onClear}>
                <Trash2 className="me-2 h-4 w-4" />
                {t.history.clear}
            </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
             <div className="text-center text-muted-foreground py-8 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary me-3"/>
                <p>Loading History...</p>
            </div>
        ) : history.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>{t.history.empty}</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <Accordion 
              type="single" 
              collapsible 
              className="w-full"
              value={openItem}
              onValueChange={setOpenItem}
            >
              {history.map((item, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger>
                    <div className="flex-1 text-start truncate">
                      <p className="font-semibold">{item.question}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true, locale: lang === 'ar' ? ar : undefined })}
                      </p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap rounded-md border bg-muted/30 p-4">
                        <p className="text-muted-foreground">{item.answer}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleCopy(item.answer)}>
                        <ClipboardCopy className="me-2 h-4 w-4" />
                        {t.history.copy}
                      </Button>
                      <Button variant="ghost" size="sm" className="hover:text-destructive" onClick={() => onDeleteItem(index)}>
                        <Trash2 className="me-2 h-4 w-4" />
                        {t.history.deleteQuestion}
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
