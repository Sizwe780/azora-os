"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MoreHorizontal, Calendar, MessageSquare, Paperclip, Users, CheckCircle, Clock, AlertCircle } from "lucide-react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

interface Task {
    id: string;
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    assignee: string;
    avatar: string;
    dueDate: string;
    comments: number;
    attachments: number;
    progress?: number;
    status: "todo" | "in-progress" | "review" | "done";
}

interface TaskBoardProps {
    ydoc: Y.Doc;
    provider: WebsocketProvider;
}

const COLUMNS = [
    { id: "todo", title: "To Do", color: "bg-slate-700" },
    { id: "in-progress", title: "In Progress", color: "bg-blue-700" },
    { id: "review", title: "Review", color: "bg-yellow-700" },
    { id: "done", title: "Done", color: "bg-green-700" }
];

export default function TaskBoard({ ydoc, provider }: TaskBoardProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const sharedTasks = ydoc.getMap<Task>("tasks-map");

    useEffect(() => {
        const updateTasks = () => {
            setTasks(Array.from(sharedTasks.values()));
        };

        sharedTasks.observe(updateTasks);
        updateTasks();

        // Tasks start empty - no mock data (Constitutional Compliance: No Mock Protocol)
        // Users can add tasks via the UI as needed

        return () => sharedTasks.unobserve(updateTasks);
    }, [ydoc]);

    const addTask = (status: Task["status"]) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newTask: Task = {
            id,
            title: "New Task",
            description: "Click to edit description",
            priority: "medium",
            assignee: "You",
            avatar: "Y",
            dueDate: "Soon",
            comments: 0,
            attachments: 0,
            status
        };
        sharedTasks.set(id, newTask);
    };

    const moveTask = (taskId: string, newStatus: Task["status"]) => {
        const task = sharedTasks.get(taskId);
        if (task) {
            sharedTasks.set(taskId, { ...task, status: newStatus });
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high": return "text-red-400 bg-red-400/10";
            case "medium": return "text-yellow-400 bg-yellow-400/10";
            case "low": return "text-green-400 bg-green-400/10";
            default: return "text-slate-400 bg-slate-400/10";
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case "high": return <AlertCircle className="w-3 h-3" />;
            case "medium": return <Clock className="w-3 h-3" />;
            case "low": return <CheckCircle className="w-3 h-3" />;
            default: return <Clock className="w-3 h-3" />;
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <h3 className="font-semibold text-white">Project Board</h3>
                    <Badge variant="secondary" className="bg-slate-700">
                        Sprint 2 - Week 3
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Users className="w-4 h-4 mr-2" />
                        Team
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" size="sm" onClick={() => addTask("todo")}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Task
                    </Button>
                </div>
            </div>

            {/* Board */}
            <div className="flex-1 flex gap-4 p-4 overflow-x-auto">
                {COLUMNS.map((column) => (
                    <div key={column.id} className="flex-1 min-w-[300px] flex flex-col bg-slate-800/30 rounded-xl border border-white/5">
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${column.color}`} />
                                <h4 className="font-medium text-white">{column.title}</h4>
                                <Badge variant="outline" className="bg-slate-800 border-white/5 text-slate-400">
                                    {tasks.filter(t => t.status === column.id).length}
                                </Badge>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4 text-slate-400" />
                            </Button>
                        </div>

                        <ScrollArea className="flex-1 px-4 pb-4">
                            <div className="space-y-3">
                                {tasks.filter(t => t.status === column.id).map((task) => (
                                    <Card 
                                        key={task.id} 
                                        className="bg-slate-800 border-white/5 hover:border-blue-500/50 transition-colors cursor-pointer group"
                                        onClick={() => {
                                            // Simple cycle status for demo
                                            const statuses: Task["status"][] = ["todo", "in-progress", "review", "done"];
                                            const nextIndex = (statuses.indexOf(task.status) + 1) % statuses.length;
                                            moveTask(task.id, statuses[nextIndex]);
                                        }}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <Badge className={`text-[10px] uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                                                    {getPriorityIcon(task.priority)}
                                                    <span className="ml-1">{task.priority}</span>
                                                </Badge>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreHorizontal className="w-3 h-3 text-slate-400" />
                                                </Button>
                                            </div>
                                            <h5 className="text-sm font-medium text-white mb-1">{task.title}</h5>
                                            <p className="text-xs text-slate-400 line-clamp-2 mb-3">{task.description}</p>
                                            
                                            {task.progress !== undefined && (
                                                <div className="mb-3">
                                                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                                        <span>Progress</span>
                                                        <span>{task.progress}%</span>
                                                    </div>
                                                    <Progress value={task.progress} className="h-1 bg-slate-700" />
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between">
                                                <div className="flex -space-x-2">
                                                    <Avatar className="w-6 h-6 border-2 border-slate-800">
                                                        <AvatarFallback className="text-[10px] bg-blue-600">{task.avatar}</AvatarFallback>
                                                    </Avatar>
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-500">
                                                    <div className="flex items-center gap-1">
                                                        <MessageSquare className="w-3 h-3" />
                                                        <span className="text-[10px]">{task.comments}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Paperclip className="w-3 h-3" />
                                                        <span className="text-[10px]">{task.attachments}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span className="text-[10px]">{task.dueDate}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                <Button 
                                    variant="ghost" 
                                    className="w-full border border-dashed border-white/5 text-slate-500 hover:text-white hover:bg-white/5 h-10"
                                    onClick={() => addTask(column.id as any)}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Task
                                </Button>
                            </div>
                        </ScrollArea>
                    </div>
                ))}
            </div>
        </div>
    );
}