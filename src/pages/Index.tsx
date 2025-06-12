
import React, { useState } from 'react';
import { Brain, FileSearch, Lightbulb } from 'lucide-react';
import DocumentUpload from '../components/DocumentUpload';
import ChatInterface from '../components/ChatInterface';
import { geminiService } from '../services/geminiService';

const Index = () => {
  const [documents, setDocuments] = useState<any[]>([]);

  const handleQuery = async (query: string) => {
    console.log('Processing enhanced query:', query);
    return await geminiService.queryDocuments(query, documents);
  };

  const handleSummarizeDocuments = async (docs: any[]) => {
    console.log('Generating document summaries...');
    const summaries = [];
    
    for (const doc of docs) {
      try {
        const summary = await geminiService.summarizeDocument(doc);
        summaries.push(summary);
      } catch (error) {
        console.error(`Error summarizing ${doc.name}:`, error);
      }
    }
    
    return summaries;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Document Research Assistant
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your documents and let AI-powered analysis help you discover insights, 
            extract key information, and identify themes across your research materials.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <FileSearch className="h-6 w-6 text-blue-600" />
              <h3 className="font-semibold">Smart Document Search</h3>
            </div>
            <p className="text-sm text-gray-600">
              Upload PDFs, text files, and images. Our AI extracts and searches through content intelligently.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="h-6 w-6 text-green-600" />
              <h3 className="font-semibold">AI-Powered Analysis</h3>
            </div>
            <p className="text-sm text-gray-600">
              Get accurate answers with citations and confidence scores using Google Gemini's advanced capabilities.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <Lightbulb className="h-6 w-6 text-yellow-600" />
              <h3 className="font-semibold">Theme Identification</h3>
            </div>
            <p className="text-sm text-gray-600">
              Discover patterns and themes across multiple documents with automated synthesis and insights.
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <DocumentUpload onDocumentsChange={setDocuments} />
          </div>
          
          {/* Right Column */}
          <div className="lg:sticky lg:top-8">
            <ChatInterface 
              documents={documents}
              onQuery={handleQuery}
              onSummarize={handleSummarizeDocuments}
            />
          </div>
        </div>

        {/* Stats */}
        {documents.length > 0 && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Document Statistics</h3>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{documents.length}</div>
                <div className="text-sm text-gray-600">Total Documents</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {documents.filter(d => d.status === 'ready').length}
                </div>
                <div className="text-sm text-gray-600">Ready for Search</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {documents.filter(d => d.status === 'processing').length}
                </div>
                <div className="text-sm text-gray-600">Processing</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {documents.reduce((acc, doc) => acc + (doc.size || 0), 0) > 1024 ? 
                    Math.round(documents.reduce((acc, doc) => acc + (doc.size || 0), 0) / 1024 / 1024 * 100) / 100 + ' MB' :
                    Math.round(documents.reduce((acc, doc) => acc + (doc.size || 0), 0) / 1024 * 100) / 100 + ' KB'
                  }
                </div>
                <div className="text-sm text-gray-600">Total Size</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
