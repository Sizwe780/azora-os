"use client";

import { AppLayout, GradientText, Button, AIFamilyChat } from "@azora/shared-design";
import { Database, BarChart, Table, Play, Save, Upload } from "lucide-react";
import { useState } from "react";

export default function DataForge() {
    const [activeTab, setActiveTab] = useState("data");

    return (
        <AppLayout appName="Data Forge" userName="Data Scientist">
            <div className="h-[calc(100vh-4rem)] flex flex-col">
                {/* Toolbar */}
                <div className="bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold">
                            <GradientText>Data Forge</GradientText>
                        </h1>
                        <div className="flex bg-gray-800 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab("data")}
                                className={`px-3 py-1.5 rounded-md text-sm transition-all ${activeTab === "data" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"}`}
                            >
                                Data
                            </button>
                            <button
                                onClick={() => setActiveTab("viz")}
                                className={`px-3 py-1.5 rounded-md text-sm transition-all ${activeTab === "viz" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"}`}
                            >
                                Visualize
                            </button>
                            <button
                                onClick={() => setActiveTab("model")}
                                className={`px-3 py-1.5 rounded-md text-sm transition-all ${activeTab === "model" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"}`}
                            >
                                Model
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Import
                        </Button>
                        <Button variant="outline" size="sm">
                            <Save className="w-4 h-4 mr-2" />
                            Save
                        </Button>
                        <Button variant="primary" size="sm">
                            <Play className="w-4 h-4 mr-2" />
                            Run Analysis
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Workspace */}
                    <div className="flex-1 bg-gray-950 p-6 overflow-auto">
                        {activeTab === "data" && (
                            <div className="space-y-6">
                                <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <Table className="w-5 h-5 text-blue-500" />
                                        Active Dataset: student_performance.csv
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left text-gray-400">
                                            <thead className="text-xs text-gray-200 uppercase bg-gray-800">
                                                <tr>
                                                    <th className="px-6 py-3">Student ID</th>
                                                    <th className="px-6 py-3">Course</th>
                                                    <th className="px-6 py-3">Score</th>
                                                    <th className="px-6 py-3">Hours Studied</th>
                                                    <th className="px-6 py-3">Attendance</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="bg-gray-900 border-b border-gray-800">
                                                    <td className="px-6 py-4">STD-001</td>
                                                    <td className="px-6 py-4">Math 101</td>
                                                    <td className="px-6 py-4">85</td>
                                                    <td className="px-6 py-4">12</td>
                                                    <td className="px-6 py-4">95%</td>
                                                </tr>
                                                <tr className="bg-gray-900 border-b border-gray-800">
                                                    <td className="px-6 py-4">STD-002</td>
                                                    <td className="px-6 py-4">Science 202</td>
                                                    <td className="px-6 py-4">92</td>
                                                    <td className="px-6 py-4">15</td>
                                                    <td className="px-6 py-4">98%</td>
                                                </tr>
                                                <tr className="bg-gray-900 border-b border-gray-800">
                                                    <td className="px-6 py-4">STD-003</td>
                                                    <td className="px-6 py-4">History 101</td>
                                                    <td className="px-6 py-4">78</td>
                                                    <td className="px-6 py-4">8</td>
                                                    <td className="px-6 py-4">88%</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "viz" && (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <div className="text-center">
                                    <BarChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p>Visualization Engine Ready</p>
                                    <p className="text-sm">Select columns to generate charts</p>
                                </div>
                            </div>
                        )}

                        {activeTab === "model" && (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <div className="text-center">
                                    <Database className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p>Model Training Pipeline</p>
                                    <p className="text-sm">Configure model parameters to start training</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="w-96 bg-gray-900 flex flex-col border-l border-gray-800">
                        {/* Data Sources */}
                        <div className="border-b border-gray-800 p-4">
                            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                                <Database className="w-4 h-4" />
                                Data Sources
                            </h3>
                            <div className="space-y-1 text-sm">
                                <div className="p-2 hover:bg-gray-800 rounded cursor-pointer text-primary flex justify-between">
                                    <span>student_performance.csv</span>
                                    <span className="text-xs text-gray-500">24KB</span>
                                </div>
                                <div className="p-2 hover:bg-gray-800 rounded cursor-pointer text-gray-400 flex justify-between">
                                    <span>course_metrics.json</span>
                                    <span className="text-xs text-gray-500">12KB</span>
                                </div>
                            </div>
                        </div>

                        {/* NIA AI Assistant */}
                        <div className="flex-1 flex flex-col">
                            <div className="p-4 border-b border-gray-800">
                                <h3 className="font-bold">NIA - Data Scientist</h3>
                                <p className="text-xs text-gray-400">Your AI analytics partner</p>
                            </div>
                            <div className="flex-1">
                                <AIFamilyChat
                                    defaultAgent="nia"
                                    availableAgents={['nia', 'elara', 'zuri']}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
