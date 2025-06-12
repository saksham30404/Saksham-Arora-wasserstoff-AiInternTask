import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, FileText, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface QueryResult {
  documentId: string;
  documentName: string;
  answer: string;
  citations: Citation[];
  confidence: number;
  summary?: string;
}

interface Citation {
  page?: number;
  paragraph: number;
  text: string;
}

interface Theme {
  title: string;
  summary: string;
  supportingDocuments: string[];
  confidence: number;
}

interface DocumentSummary {
  documentId: string;
  documentName: string;
  summary: string;
  keyPoints: string[];
  wordCount: number;
  topics: string[];
  confidence: number;
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  results?: QueryResult[];
  themes?: Theme[];
  summaries?: DocumentSummary[];
}

interface ChatInterfaceProps {
  documents: any[];
  onQuery: (query: string) => Promise<{ results: QueryResult[]; themes: Theme[] }>;
  onSummarize?: (documents: any[]) => Promise<DocumentSummary[]>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ documents, onQuery, onSummarize }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your enhanced research assistant. Upload documents and I can help you analyze them, answer questions, or provide comprehensive summaries.',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSummarizeDocuments = async () => {
    if (!onSummarize || isLoading) return;

    const readyDocuments = documents.filter(d => d.status === 'ready');
    if (readyDocuments.length === 0) return;

    setIsLoading(true);

    try {
      const summaries = await onSummarize(readyDocuments);
      
      const summaryMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: `I've generated comprehensive summaries for ${summaries.length} documents. Here are the key insights and summaries:`,
        timestamp: new Date(),
        summaries,
      };

      setMessages(prev => [...prev, summaryMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: 'Sorry, I encountered an error while generating document summaries. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { results, themes } = await onQuery(input);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `I found ${results.length} relevant responses across your documents. Here are the detailed results and key themes I identified:`,
        timestamp: new Date(),
        results,
        themes,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Sorry, I encountered an error while processing your query. Please make sure your documents are properly processed.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Enhanced Research Assistant
          <Badge variant="secondary" className="ml-auto">
            {documents.filter(d => d.status === 'ready').length} documents ready
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-96">
          {messages.map(message => (
            <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : ''}`}>
              {message.type === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
              )}
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                <div className={`p-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white ml-auto' 
                    : 'bg-gray-100'
                }`}>
                  <p className="text-sm">{message.content}</p>
                </div>
                
                {message.summaries && (
                  <div className="mt-3 space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Document Summaries:
                    </h4>
                    {message.summaries.map((summary, idx) => (
                      <div key={idx} className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-sm text-green-800 flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {summary.documentName}
                          </h5>
                          <Badge variant="outline" className="text-xs">
                            {summary.wordCount} words
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{summary.summary}</p>
                        
                        <div className="mb-3">
                          <h6 className="font-medium text-xs text-gray-600 mb-1">Key Points:</h6>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {summary.keyPoints.map((point, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-green-600 mt-1">•</span>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {summary.topics.map((topic, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(summary.confidence * 100)}% confident
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {message.results && (
                  <div className="mt-3 space-y-3">
                    <h4 className="font-semibold text-sm">Document Results:</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border border-gray-200 rounded">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="p-2 text-left border-b">Document</th>
                            <th className="p-2 text-left border-b">Answer</th>
                            <th className="p-2 text-left border-b">Citations</th>
                            <th className="p-2 text-left border-b">Confidence</th>
                          </tr>
                        </thead>
                        <tbody>
                          {message.results.map((result, idx) => (
                            <tr key={idx} className="border-b">
                              <td className="p-2">
                                <div className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  <span className="truncate max-w-[100px]">{result.documentName}</span>
                                </div>
                              </td>
                              <td className="p-2">{result.answer}</td>
                              <td className="p-2">
                                {result.citations.map((cite, i) => (
                                  <span key={i} className="text-blue-600 text-xs">
                                    P{cite.page || '?'}:{cite.paragraph}{i < result.citations.length - 1 ? ', ' : ''}
                                  </span>
                                ))}
                              </td>
                              <td className="p-2">
                                <Badge variant={result.confidence > 0.8 ? 'default' : 'secondary'} className="text-xs">
                                  {Math.round(result.confidence * 100)}%
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {message.themes && (
                  <div className="mt-3 space-y-2">
                    <h4 className="font-semibold text-sm">Key Themes Identified:</h4>
                    {message.themes.map((theme, idx) => (
                      <div key={idx} className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                        <h5 className="font-medium text-sm text-blue-800">{theme.title}</h5>
                        <p className="text-xs text-gray-700 mt-1">{theme.summary}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">
                            Found in: {theme.supportingDocuments.join(', ')}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(theme.confidence * 100)}% confident
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
              {message.type === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Bot className="h-4 w-4 text-blue-600" />
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <span className="text-sm text-gray-600 ml-2">Analyzing documents...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="space-y-2">
          {documents.filter(d => d.status === 'ready').length > 0 && onSummarize && (
            <Button 
              onClick={handleSummarizeDocuments}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Generate Document Summaries
            </Button>
          )}
          
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your documents..."
              disabled={isLoading || documents.filter(d => d.status === 'ready').length === 0}
              className="flex-1"
            />
            <Button 
              onClick={handleSend} 
              disabled={isLoading || !input.trim() || documents.filter(d => d.status === 'ready').length === 0}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {documents.filter(d => d.status === 'ready').length === 0 && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Upload and process documents before asking questions
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
