import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';
import { MonacoBinding } from 'y-monaco';
import { editor } from 'monaco-editor';

export function useBuildspaceSync(roomId: string, editorInstance: editor.IStandaloneCodeEditor | null, user?: { name: string, color: string }) {
    const [provider, setProvider] = useState<WebsocketProvider | null>(null);
    const [isSynced, setIsSynced] = useState(false);
    const [awareness, setAwareness] = useState<any>(null);

    useEffect(() => {
        if (!roomId || !editorInstance) return;

        // 1. Initialize Yjs Document
        const ydoc = new Y.Doc();

        // 2. Local Persistence (Offline First)
        const indexeddbProvider = new IndexeddbPersistence(roomId, ydoc);

        // 3. Connect to Websocket Provider (Real-time Sync)
        const wsProvider = new WebsocketProvider(
            'ws://localhost:1234',
            roomId,
            ydoc
        );

        // 4. Configure Awareness (Cursors)
        if (user) {
            wsProvider.awareness.setLocalStateField('user', {
                name: user.name,
                color: user.color
            });
        }

        // 5. Bind to Monaco Editor
        const type = ydoc.getText('monaco');
        const binding = new MonacoBinding(
            type,
            editorInstance.getModel()!,
            new Set([editorInstance]),
            wsProvider.awareness
        );

        setProvider(wsProvider);
        setAwareness(wsProvider.awareness);

        wsProvider.on('status', (event: any) => {
            setIsSynced(event.status === 'connected');
        });

        indexeddbProvider.on('synced', () => {
            console.log('Content loaded from local database (IndexedDB)');
        });

        return () => {
            wsProvider.destroy();
            indexeddbProvider.destroy();
            binding.destroy();
            ydoc.destroy();
        };
    }, [roomId, editorInstance, user]);

    return { provider, isSynced, awareness };
}
