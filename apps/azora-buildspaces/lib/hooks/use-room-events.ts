/**
 * useRoomEvents — React hook for cross-room communication
 * 
 * Any room can:
 *   1. Emit events when something happens (task completed, code committed, etc.)
 *   2. Listen for events from other rooms
 *   3. Track achievements automatically
 * 
 * Usage:
 *   const { emit, useEvent } = useRoomEvents('code-chamber')
 *   emit(ROOM_EVENTS.CODE_COMMIT, { files: ['index.ts'] })
 */

'use client'

import { useCallback, useEffect, useRef } from 'react'
import { roomEventBus, RoomEvent, ROOM_EVENTS } from '@/lib/events/room-event-bus'

export function useRoomEvents(roomName: string) {
  const roomRef = useRef(roomName)
  roomRef.current = roomName

  const emit = useCallback(
    (eventType: string, data?: any) => {
      const event: RoomEvent = {
        type: eventType,
        room: roomRef.current,
        timestamp: new Date().toISOString(),
        data,
      }
      roomEventBus.emit(event)

      // Fire achievement check in background
      fetch('/api/collectibles/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: eventType, room: roomRef.current, data }),
      }).catch(() => {
        /* silent — achievement tracking is non-critical */
      })
    },
    []
  )

  const useEvent = useCallback(
    (eventType: string, handler: (event: RoomEvent) => void) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(() => {
        return roomEventBus.on(eventType, handler)
      }, [eventType, handler])
    },
    []
  )

  const onEvent = useCallback(
    (eventType: string, handler: (event: RoomEvent) => void) => {
      return roomEventBus.on(eventType, handler)
    },
    []
  )

  return { emit, useEvent, onEvent, ROOM_EVENTS, getEventLog: () => roomEventBus.getLog() }
}
