import React, { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '../hooks/use-toast';
import { Settings as SettingsIcon, Webhook, Save } from 'lucide-react';

const Settings = () => {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState('https://your-n8n-instance.com/webhook/generate-memory');

  const handleSave = () => {
    // In a real app, you'd save this to localStorage or a backend
    localStorage.setItem('n8n-webhook-url', webhookUrl);
    toast({
      title: "Settings saved",
      description: "Your N8N webhook URL has been updated.",
    });
  };

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center gap-4 border-b sticky top-0 z-10 bg-white px-6 py-4">
        <SidebarTrigger />
        <div className="flex items-center gap-3">
          <SettingsIcon size={24} />
          <div>
            <h1 className="text-2xl font-semibold">Settings</h1>
            <p className="text-sm text-muted-foreground">Configure your AI Timeline Creator</p>
          </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook size={20} />
                N8N Integration
              </CardTitle>
              <CardDescription>
                Configure your N8N webhook URL for AI memory generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-n8n-instance.com/webhook/generate-memory"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  This URL will receive POST requests with memory generation prompts
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Expected Response Format:</h4>
                <pre className="text-sm text-gray-600 overflow-x-auto">
{`{
  "title": "Generated title",
  "description": "Generated description",
  "category": "Generated category", 
  "tags": ["tag1", "tag2"],
  "date": "2024-01-01"
}`}
                </pre>
              </div>
              
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save size={16} />
                Save Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
              <CardDescription>
                AI Timeline Creator - Organize your memories with AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                This app helps you create and organize timelines of your memories. 
                Use the AI integration to automatically generate detailed memories from simple prompts.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;