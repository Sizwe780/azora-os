"use client"

import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Replace, ChevronDown, FileCode } from "lucide-react"
import { useFileSystem } from "@/lib/stores/file-system"

interface SearchResult {
    fileId: string
    fileName: string
    filePath: string
    line: number
    content: string
    matchStart: number
    matchEnd: number
}

export function SearchView() {
    const [searchQuery, setSearchQuery] = useState("")
    const [replaceQuery, setReplaceQuery] = useState("")
    const [results, setResults] = useState<SearchResult[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [showReplace, setShowReplace] = useState(false)
    const { fileMap, readFile, openFile, writeFile } = useFileSystem()

    const handleSearch = useCallback(() => {
        if (!searchQuery.trim()) {
            setResults([])
            return
        }
        setIsSearching(true)
        const matches: SearchResult[] = []
        const query = searchQuery.toLowerCase()

        Object.values(fileMap).forEach((file) => {
            if (file.type !== "file") return
            const content = readFile(file.id)
            if (!content) return
            const lines = content.split("\n")
            lines.forEach((line, lineIdx) => {
                const lowerLine = line.toLowerCase()
                let start = lowerLine.indexOf(query)
                while (start !== -1) {
                    matches.push({
                        fileId: file.id,
                        fileName: file.name,
                        filePath: file.path,
                        line: lineIdx + 1,
                        content: line.trim(),
                        matchStart: start,
                        matchEnd: start + query.length,
                    })
                    start = lowerLine.indexOf(query, start + 1)
                }
            })
        })

        setResults(matches.slice(0, 100)) // Cap at 100 results
        setIsSearching(false)
    }, [searchQuery, fileMap, readFile])

    const handleReplaceAll = useCallback(() => {
        if (!searchQuery.trim() || !replaceQuery.trim()) return
        const affectedFiles = new Set(results.map((r) => r.fileId))
        affectedFiles.forEach((fileId) => {
            const content = readFile(fileId)
            if (content) {
                // Use case-insensitive regex to match the same results found during search
                const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
                const updated = content.replace(regex, replaceQuery)
                writeFile(fileId, updated)
            }
        })
        handleSearch()
    }, [searchQuery, replaceQuery, results, readFile, writeFile, handleSearch])

    return (
        <div className="flex flex-col h-full">
            {/* Search inputs */}
            <div className="p-3 space-y-2 border-b border-border">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between mb-2">
                    <span>Search</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 text-muted-foreground"
                        onClick={() => setShowReplace(!showReplace)}
                        title="Toggle replace"
                    >
                        <Replace className="w-3.5 h-3.5" />
                    </Button>
                </div>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Search in files..."
                        className="pl-8 h-8 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                </div>
                {showReplace && (
                    <div className="flex gap-1">
                        <Input
                            placeholder="Replace with..."
                            className="h-8 text-sm flex-1"
                            value={replaceQuery}
                            onChange={(e) => setReplaceQuery(e.target.value)}
                        />
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-xs shrink-0"
                            onClick={handleReplaceAll}
                            disabled={!searchQuery || results.length === 0}
                        >
                            All
                        </Button>
                    </div>
                )}
            </div>

            {/* Results */}
            <div className="flex-1 overflow-auto">
                {results.length > 0 ? (
                    <div className="py-2">
                        {(() => {
                            const uniqueFiles = new Set(results.map(r => r.fileId)).size
                            return (
                                <p className="text-xs text-muted-foreground px-3 pb-2">
                                    {results.length} result{results.length !== 1 ? "s" : ""} in {uniqueFiles} file{uniqueFiles !== 1 ? "s" : ""}
                                </p>
                            )
                        })()}
                        {results.map((result, idx) => (
                            <div
                                key={`${result.fileId}-${result.line}-${idx}`}
                                className="px-3 py-1.5 hover:bg-muted/50 cursor-pointer group"
                                onClick={() => openFile(result.fileId)}
                            >
                                <div className="flex items-center gap-1.5 text-xs text-primary mb-0.5">
                                    <FileCode className="w-3 h-3" />
                                    <span className="truncate">{result.fileName}</span>
                                    <span className="text-muted-foreground shrink-0">:{result.line}</span>
                                </div>
                                <div className="text-xs text-muted-foreground font-mono truncate pl-4">
                                    {result.content.slice(0, 80)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : searchQuery && !isSearching ? (
                    <p className="text-xs text-muted-foreground text-center py-8">No results found.</p>
                ) : !searchQuery ? (
                    <p className="text-xs text-muted-foreground text-center py-8">
                        Type to search across all files
                    </p>
                ) : null}
            </div>
        </div>
    )
}
