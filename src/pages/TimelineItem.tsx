import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Pencil, Sparkles, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Memory } from './TimelineView';

interface TimelineItemProps {
    memory: Memory;
    timelineColor: string;
    onEdit: () => void;
    onDelete: () => void;
    isLeft: boolean;
    isNewest?: boolean;
    isOldest?: boolean;
}

export const TimelineItem = ({ memory, timelineColor, onEdit, onDelete, isLeft, isNewest, isOldest }: TimelineItemProps) => {
    const cardAlignment = isLeft ? 'right-full mr-6' : 'left-full ml-6';

    return (
        <motion.div
            className="group relative h-5 w-5 rounded-full border-4 border-background z-20"
            style={{ backgroundColor: timelineColor }}
            whileHover={{ scale: 1.4 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
            {(isNewest || isOldest) && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4">
                    <Badge variant="secondary" className="flex items-center gap-1 whitespace-nowrap">
                        {isNewest && <><ArrowUp size={12} /> Newest</>}
                        {isOldest && <><ArrowDown size={12} /> Oldest</>}
                    </Badge>
                </div>
            )}

            <div className={`absolute top-1/2 -translate-y-1/2 w-64 ${cardAlignment} transition-opacity duration-300 group-hover:opacity-20`}>
                <Card className="bg-background/80 backdrop-blur-sm border-dashed opacity-70">
                    <CardHeader className="p-3">
                        <CardTitle className="text-sm truncate">{memory.title}</CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(memory.date).toLocaleDateString()}
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>

            <div
                className={`absolute top-1/2 -translate-y-1/2 w-80 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto ${cardAlignment} group-hover:scale-100 scale-95`}
            >
                <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-background">
                    <CardHeader className="pb-3 flex-row items-start justify-between">
                        <div>
                            <CardTitle className="text-lg">{memory.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1 text-xs">
                                <Calendar size={14} />
                                {new Date(memory.date).toLocaleDateString()}
                            </CardDescription>
                        </div>
                        <div className="flex shrink-0">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
                                <Pencil size={16} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete}>
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4 max-h-40 overflow-y-auto">
                            {memory.description}
                        </p>
                        <div className="flex items-center flex-wrap gap-2">
                            {memory.aiGenerated && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    <Sparkles size={12} /> AI Generated
                                </Badge>
                            )}
                            {memory.tags.length > 0 &&
                                memory.tags.map((tag, tagIndex) => (
                                    <Badge key={tagIndex} variant="outline">{tag}</Badge>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    );
};