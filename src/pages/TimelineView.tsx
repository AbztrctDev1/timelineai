import React, { useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useTimelines } from '../contexts/TimelineContext';
import { useToast } from '../hooks/use-toast';
import { ArrowLeft, Plus, Calendar } from 'lucide-react';
import { TimelineItem } from './TimelineItem';

//================================================
// Types (You can move this to a types.ts file)
//================================================
export type Memory = {
    id: string;
    title: string;
    date: string;
    description: string;
    category: string;
    tags: string[];
    aiGenerated?: boolean;
};

//================================================
// Main Component: TimelineView
//================================================
const TimelineView = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getTimeline, deleteMemory } = useTimelines();
    const { toast } = useToast();

    const timeline = getTimeline(id!);
    const constraintsRef = useRef<HTMLDivElement>(null);

    const sortedMemories = useMemo(() => (
        timeline
            ? [...timeline.memories].sort(
                (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            )
            : []
    ), [timeline]);

    const { positions, lines, yearHeaders, canvasSize } = useMemo(() => {
        if (sortedMemories.length === 0) {
            return { positions: [], lines: [], yearHeaders: [], canvasSize: { width: 0, height: 0 } };
        }

        const groupedByYear = sortedMemories.reduce((acc, memory) => {
            const year = new Date(memory.date).getFullYear().toString();
            if (!acc[year]) acc[year] = [];
            acc[year].push(memory);
            return acc;
        }, {} as Record<string, Memory[]>);

        // --- Spacing Adjustments ---
        const PADDING = 300;
        const GRID_SPACING_X = 550;
        const GRID_SPACING_Y = 320;      // Increased to prevent card overlap
        const YEAR_SPACING_BUFFER = 100; // New constant to add space between years
        const YEAR_HEADER_OFFSET = 150;
        const JITTER_AMOUNT = 100;
        const initialCanvasWidth = 1200;

        const calculatedPositions: { x: number; y: number }[] = [];
        const calculatedLines: string[] = [];
        const calculatedYearHeaders: { year: string; x: number; y: number }[] = [];

        let globalIndex = 0;
        let currentY = PADDING; // Use a running total for the Y position

        Object.keys(groupedByYear).sort((a, b) => Number(a) - Number(b)).forEach((year, yearIndex) => {
            const memoriesInYear = groupedByYear[year];

            if (yearIndex > 0) {
                currentY += YEAR_SPACING_BUFFER;
            }

            calculatedYearHeaders.push({
                year,
                x: initialCanvasWidth / 2,
                y: currentY - YEAR_HEADER_OFFSET
            });

            memoriesInYear.forEach(() => {
                const side = globalIndex % 2 === 0 ? 1 : -1;
                const x = (initialCanvasWidth / 2) + (side * (GRID_SPACING_X / 2)) + ((Math.random() - 0.5) * JITTER_AMOUNT);
                const y = currentY;
                calculatedPositions.push({ x, y });

                if (globalIndex > 0) {
                    const prevPos = calculatedPositions[globalIndex - 1];
                    const controlPoint1X = prevPos.x + (Math.random() - 0.5) * 300;
                    const controlPoint1Y = prevPos.y + (y - prevPos.y) * 0.5;
                    const controlPoint2X = x - (Math.random() - 0.5) * 300;
                    const controlPoint2Y = y - (y - prevPos.y) * 0.5;
                    const pathData = `M ${prevPos.x},${prevPos.y} C ${controlPoint1X},${controlPoint1Y} ${controlPoint2X},${controlPoint2Y} ${x},${y}`;
                    calculatedLines.push(pathData);
                }

                currentY += GRID_SPACING_Y;
                globalIndex++;
            });
        });

        const finalWidth = Math.max(initialCanvasWidth, ...calculatedPositions.map(p => p.x)) + PADDING + 300;
        const finalHeight = currentY;

        return {
            positions: calculatedPositions,
            lines: calculatedLines,
            yearHeaders: calculatedYearHeaders,
            canvasSize: { width: finalWidth, height: finalHeight }
        };
    }, [sortedMemories]);


    if (!timeline) {
        return (
            <div className="flex flex-col h-full w-full">
                <header className="flex items-center sticky top-0 z-10 gap-4 border-b bg-white px-6 py-4">
                    <SidebarTrigger />
                    <h1 className="text-2xl font-semibold">Timeline Not Found</h1>
                </header>
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-600 mb-4">The timeline you are looking for does not exist.</p>
                        <Button asChild>
                            <Link to="/">Back to Dashboard</Link>
                        </Button>
                    </div>
                </main>
            </div>
        );
    }

    const handleEditMemory = (memoryId: string) => {
        navigate(`/edit-memory/${timeline.id}/${memoryId}`);
    };

    const handleDeleteMemory = (memoryId: string, memoryTitle: string) => {
        if (window.confirm(`Are you sure you want to delete "${memoryTitle}"?`)) {
            deleteMemory(timeline.id, memoryId);
            toast({ title: "Memory deleted" });
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-background text-foreground overflow-hidden">
            <header className="flex items-center justify-between sticky top-0 z-30 gap-4 border-b bg-background/80 backdrop-blur-sm px-6 py-4">
                <div className="flex items-center gap-4">
                    <SidebarTrigger />
                    <Button variant="ghost" onClick={() => navigate('/')} className="flex items-center gap-2">
                        <ArrowLeft size={16} />
                        Back
                    </Button>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: timeline.color }}
                        />
                        <div>
                            <h1 className="text-2xl font-semibold">{timeline.title}</h1>
                            <p className="text-sm text-muted-foreground">{timeline.description}</p>
                        </div>
                    </div>
                </div>
                <Button asChild className="flex items-center gap-2">
                    <Link to={`/create-memory/${timeline.id}`}>
                        <Plus size={16} />
                        Add Memory
                    </Link>
                </Button>
            </header>

            <main ref={constraintsRef} className="flex-1 relative overflow-hidden">
                {sortedMemories.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12 absolute inset-0 flex flex-col items-center justify-center"
                    >
                        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">No memories yet</h2>
                        <p className="text-gray-600 mb-6">Start building this timeline by adding your first memory.</p>
                        <Button asChild className="flex items-center gap-2">
                            <Link to={`/create-memory/${timeline.id}`}>
                                <Plus size={16} />
                                Add First Memory
                            </Link>
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        drag
                        dragConstraints={constraintsRef}
                        className="absolute cursor-grab active:cursor-grabbing"
                        style={{ width: canvasSize.width, height: canvasSize.height }}
                    >
                        <svg width="100%" height="100%" className="absolute top-0 left-0 pointer-events-none">
                            {lines.map((pathData, index) => (
                                <motion.path
                                    key={`line-${index}`}
                                    d={pathData}
                                    fill="none"
                                    stroke={timeline.color}
                                    strokeWidth="2"
                                    strokeOpacity="0.4"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.2, delay: (index + 1) * 0.1, ease: "circOut" }}
                                />
                            ))}
                        </svg>

                        {yearHeaders.map(({ year, x, y }) => (
                            <motion.div
                                key={year}
                                className="absolute -translate-x-1/2 -translate-y-1/2"
                                style={{ left: x, top: y }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <h2 className="text-5xl font-bold text-muted-foreground/20 select-none">{year}</h2>
                            </motion.div>
                        ))}

                        {sortedMemories.map((memory, index) => (
                            <motion.div
                                key={memory.id}
                                className="absolute"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                style={{
                                    left: positions[index].x,
                                    top: positions[index].y,
                                    transform: 'translate(-50%, -50%)',
                                }}
                            >
                                <TimelineItem
                                    memory={memory}
                                    timelineColor={timeline.color}
                                    onEdit={() => handleEditMemory(memory.id)}
                                    onDelete={() => handleDeleteMemory(memory.id, memory.title)}
                                    isLeft={index % 2 !== 0}
                                    isOldest={index === 0}
                                    isNewest={index === sortedMemories.length - 1}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </main>
        </div>
    );
};

export default TimelineView;