
import React, { useState, useEffect } from 'react';
import { Settings, Key, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GeminiSettingsProps {
  onApiKeyChange: (apiKey: string) => void;
}

const GeminiSettings: React.FC<GeminiSettingsProps> = ({ onApiKeyChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      onApiKeyChange(savedApiKey);
      validateApiKey(savedApiKey);
    }
  }, [onApiKeyChange]);

  const validateApiKey = async (key: string) => {
    if (!key || key.length < 10) {
      setIsValid(false);
      return;
    }

    setIsValidating(true);
    try {
      // Test the API key with a simple request to Gemini
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Hello, this is a test message.'
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 10,
          },
        }),
      });

      if (response.ok) {
        setIsValid(true);
      } else {
        setIsValid(false);
        console.error('API key validation failed:', response.statusText);
      }
    } catch (error) {
      setIsValid(false);
      console.error('API key validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    setIsValid(null);
    
    if (value) {
      localStorage.setItem('gemini_api_key', value);
      onApiKeyChange(value);
    } else {
      localStorage.removeItem('gemini_api_key');
      onApiKeyChange('');
    }
  };

  const handleValidate = () => {
    validateApiKey(apiKey);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Gemini API Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-key">Google Gemini API Key</Label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                placeholder="Enter your Gemini API key..."
                className="pl-10"
              />
            </div>
            <Button 
              onClick={handleValidate} 
              disabled={!apiKey || isValidating}
              variant="outline"
            >
              {isValidating ? 'Validating...' : 'Test'}
            </Button>
          </div>
        </div>

        {isValid === true && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              API key is valid and ready to use!
            </AlertDescription>
          </Alert>
        )}

        {isValid === false && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Invalid API key. Please check your key and try again.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-gray-600 space-y-2">
          <p>
            <strong>How to get your Gemini API key:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>Go to <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a></li>
            <li>Sign in with your Google account</li>
            <li>Click "Create API Key"</li>
            <li>Copy the generated key and paste it above</li>
          </ol>
          <p className="text-xs text-gray-500 mt-2">
            Your API key is stored locally in your browser and never sent to our servers.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeminiSettings;
