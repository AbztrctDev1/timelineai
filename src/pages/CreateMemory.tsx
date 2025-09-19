import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useTimelines } from '../contexts/TimelineContext';
import { useToast } from '../hooks/use-toast';
import { ArrowLeft, Sparkles, Plus, X, Loader2 } from 'lucide-react';

const CreateMemory = () => {
    const { timelineId } = useParams();
    const navigate = useNavigate();
    const { timelines, addMemory } = useTimelines();
    const { toast } = useToast();

    const [selectedTimelineId, setSelectedTimelineId] = useState(timelineId || '');
    const [isAiMode, setIsAiMode] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
        tags: [] as string[]
    });
    const [tagInput, setTagInput] = useState('');

    // NEW: State to manage the uploaded image file and its preview URL
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const categories = [
        'Personal', 'Work', 'Education', 'Travel', 'Family', 'Health', 'Hobbies', 'Achievement', 'Other'
    ];

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({
                ...formData,
                tags: [...formData.tags, tagInput.trim()]
            });
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(tag => tag !== tagToRemove)
        });
    };

    // NEW: Updated function to handle both image and text prompts
    const handleAiGenerate = async () => {
        // Allow generation if there's either a prompt or an image
        if (!aiPrompt.trim() && !imageFile) {
            toast({
                title: "Input required",
                description: "Please enter a prompt or upload an image for AI generation.",
                variant: "destructive"
            });
            return;
        }

        setIsGenerating(true);

        try {
            const webhookUrl = 'https://agencia360.app.n8n.cloud/webhook/1d4c422e-b9df-4fdd-815a-f52de28cdf91';

            // Use FormData to send both text and file data
            const data = new FormData();
            data.append('prompt', aiPrompt);

            // Append context data as a stringified JSON
            data.append('context', JSON.stringify({
                timelineId: selectedTimelineId,
                timelineTitle: timelines.find(t => t.id === selectedTimelineId)?.title
            }));

            // Append the image file if it exists
            if (imageFile) {
                data.append('image', imageFile);
            }

            const response = await fetch(webhookUrl, {
                method: 'POST',
                // IMPORTANT: Do NOT set the 'Content-Type' header.
                // The browser automatically sets it to 'multipart/form-data' with the correct boundary.
                body: data
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to generate memory: ${errorText}`);
            }

            const aiResult = await response.json();

            setFormData({
                title: aiResult.title || '',
                description: aiResult.description || '',
                date: aiResult.date || new Date().toISOString().split('T')[0],
                category: aiResult.category || 'Personal',
                tags: aiResult.tags || []
            });

            toast({
                title: "Memory generated!",
                description: "AI has created a memory based on your prompt. You can edit it before saving.",
            });

        } catch (error) {
            console.error('AI generation error:', error);
            toast({
                title: "Generation failed",
                description: "Failed to generate memory with AI. Please try again or create manually.",
                variant: "destructive"
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedTimelineId) {
            toast({
                title: "Error",
                description: "Please select a timeline.",
                variant: "destructive"
            });
            return;
        }

        if (!formData.title.trim() || !formData.description.trim()) {
            toast({
                title: "Error",
                description: "Please fill in title and description.",
                variant: "destructive"
            });
            return;
        }

        addMemory(selectedTimelineId, {
            ...formData,
            aiGenerated: isAiMode
        });

        toast({
            title: "Memory created!",
            description: "Your memory has been added to the timeline.",
        });

        navigate(`/timeline/${selectedTimelineId}`);
    };

    return (
        <div className="flex flex-col h-full w-full">
            <header className="flex items-center gap-4 border-b sticky top-0 z-10 bg-white px-6 py-4">
                <SidebarTrigger />
                <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
                    <ArrowLeft size={16} />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-semibold">Create Memory</h1>
                    <p className="text-sm text-muted-foreground">Add a new memory to your timeline</p>
                </div>
            </header>

            <main className="flex-1 overflow-auto p-6">
                <div className="max-w-2xl mx-auto space-y-6">

                    {/* AI Mode Toggle */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="text-yellow-500" size={20} />
                                AI Memory Generation
                            </CardTitle>
                            <CardDescription>
                                Use AI to generate a memory from a simple prompt or an image
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2 mb-4">
                                <Button
                                    variant={!isAiMode ? "default" : "outline"}
                                    onClick={() => setIsAiMode(false)}
                                    className="flex-1"
                                >
                                    Manual Creation
                                </Button>
                                <Button
                                    variant={isAiMode ? "default" : "outline"}
                                    onClick={() => setIsAiMode(true)}
                                    className="flex-1 flex items-center gap-2"
                                >
                                    <Sparkles size={16} />
                                    AI Generation
                                </Button>
                            </div>

                            {isAiMode && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-4"
                                >
                                    {/* NEW: JSX for image upload and preview */}
                                    <div>
                                        <Label htmlFor="image-upload">Upload an Image (Optional)</Label>
                                        <Input
                                            id="image-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setImageFile(file);
                                                    setImagePreview(URL.createObjectURL(file));
                                                } else {
                                                    setImageFile(null);
                                                    setImagePreview(null);
                                                }
                                            }}
                                            className="mt-1"
                                        />
                                        {imagePreview && (
                                            <div className="mt-4 relative w-48 h-48">
                                                <img src={imagePreview} alt="Image preview" className="rounded-md object-cover w-full h-full" />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                                    onClick={() => {
                                                        setImageFile(null);
                                                        setImagePreview(null);
                                                        const input = document.getElementById('image-upload') as HTMLInputElement;
                                                        if (input) input.value = '';
                                                    }}
                                                >
                                                    <X size={12} />
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="ai-prompt">Describe your memory (or what's in the image)</Label>
                                        <Textarea
                                            id="ai-prompt"
                                            value={aiPrompt}
                                            onChange={(e) => setAiPrompt(e.target.value)}
                                            placeholder="e.g., 'Trip to the beach with family in the summer of '22.'"
                                            rows={3}
                                        />
                                    </div>
                                    <Button
                                        onClick={handleAiGenerate}
                                        // NEW: Disable button only if both prompt and image are missing
                                        disabled={isGenerating || (!aiPrompt.trim() && !imageFile)}
                                        className="w-full flex items-center gap-2"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={16} />
                                                Generate Memory
                                            </>
                                        )}
                                    </Button>
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Memory Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Memory Details</CardTitle>
                            <CardDescription>
                                {isAiMode ? 'Review and edit the AI-generated memory' : 'Fill in the memory details'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="timeline">Timeline</Label>
                                    <Select value={selectedTimelineId} onValueChange={setSelectedTimelineId} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a timeline" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {timelines.map((timeline) => (
                                                <SelectItem key={timeline.id} value={timeline.id}>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: timeline.color }}
                                                        />
                                                        {timeline.title}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Enter memory title"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe your memory in detail"
                                        rows={4}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="date">Date</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="category">Category</Label>
                                        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category} value={category}>
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="tags">Tags</Label>
                                    <div className="flex gap-2 mb-2">
                                        <Input
                                            id="tags"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            placeholder="Add a tag"
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                        />
                                        <Button type="button" onClick={handleAddTag} size="sm">
                                            <Plus size={16} />
                                        </Button>
                                    </div>
                                    {formData.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {formData.tags.map((tag, index) => (
                                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="ml-1 hover:text-red-500"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <Button type="submit" className="flex-1">
                                        Create Memory
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default CreateMemory;