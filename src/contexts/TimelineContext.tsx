import React, { createContext, useContext, useState } from 'react';

export interface Memory {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  aiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Timeline {
  id: string;
  title: string;
  description: string;
  color: string;
  memories: Memory[];
  createdAt: Date;
  updatedAt: Date;
}

interface TimelineContextType {
  timelines: Timeline[];
  addTimeline: (timeline: Omit<Timeline, 'id' | 'createdAt' | 'updatedAt' | 'memories'>) => void;
  updateTimeline: (id: string, updates: Partial<Timeline>) => void;
  deleteTimeline: (id: string) => void;
  addMemory: (timelineId: string, memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMemory: (timelineId: string, memoryId: string, updates: Partial<Memory>) => void;
  deleteMemory: (timelineId: string, memoryId: string) => void;
  getTimeline: (id: string) => Timeline | undefined;
}

const TimelineContext = createContext<TimelineContextType | null>(null);

export const TimelineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timelines, setTimelines] = useState<Timeline[]>([
    {
      id: '1',
      title: 'My Life Journey',
      description: 'Important moments and milestones in my life',
      color: '#3B82F6',
      memories: [
        {
          id: '1',
          title: 'Started College',
          description: 'Began my computer science degree at university',
          date: '2020-09-01',
          category: 'Education',
          tags: ['college', 'education', 'milestone'],
          aiGenerated: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '2',
      title: 'Travel Adventures',
      description: 'Places I\'ve visited and experiences I\'ve had',
      color: '#10B981',
      memories: [],
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02')
    }
  ]);

  const addTimeline = (timelineData: Omit<Timeline, 'id' | 'createdAt' | 'updatedAt' | 'memories'>) => {
    const newTimeline: Timeline = {
      ...timelineData,
      id: Date.now().toString(),
      memories: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTimelines(prev => [newTimeline, ...prev]);
  };

  const updateTimeline = (id: string, updates: Partial<Timeline>) => {
    setTimelines(prev => prev.map(timeline => 
      timeline.id === id 
        ? { ...timeline, ...updates, updatedAt: new Date() }
        : timeline
    ));
  };

  const deleteTimeline = (id: string) => {
    setTimelines(prev => prev.filter(timeline => timeline.id !== id));
  };

  const addMemory = (timelineId: string, memoryData: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMemory: Memory = {
      ...memoryData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setTimelines(prev => prev.map(timeline => 
      timeline.id === timelineId
        ? { 
            ...timeline, 
            memories: [newMemory, ...timeline.memories],
            updatedAt: new Date()
          }
        : timeline
    ));
  };

  const updateMemory = (timelineId: string, memoryId: string, updates: Partial<Memory>) => {
    setTimelines(prev => prev.map(timeline => 
      timeline.id === timelineId
        ? {
            ...timeline,
            memories: timeline.memories.map(memory =>
              memory.id === memoryId
                ? { ...memory, ...updates, updatedAt: new Date() }
                : memory
            ),
            updatedAt: new Date()
          }
        : timeline
    ));
  };

  const deleteMemory = (timelineId: string, memoryId: string) => {
    setTimelines(prev => prev.map(timeline => 
      timeline.id === timelineId
        ? {
            ...timeline,
            memories: timeline.memories.filter(memory => memory.id !== memoryId),
            updatedAt: new Date()
          }
        : timeline
    ));
  };

  const getTimeline = (id: string) => {
    return timelines.find(timeline => timeline.id === id);
  };

  return (
    <TimelineContext.Provider value={{
      timelines,
      addTimeline,
      updateTimeline,
      deleteTimeline,
      addMemory,
      updateMemory,
      deleteMemory,
      getTimeline
    }}>
      {children}
    </TimelineContext.Provider>
  );
};

export const useTimelines = () => {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimelines must be used within TimelineProvider');
  }
  return context;
};