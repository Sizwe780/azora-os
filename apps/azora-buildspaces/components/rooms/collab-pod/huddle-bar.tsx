"use client"

/**
 * Huddle Bar - Collaboration Status Bar
 * 
 * Constitutional Compliance:
 * - TRANSPARENCY: Always show who is in the room (no invisible observers)
 * - UBUNTU PHILOSOPHY: Individual success = Collective success
 * - FOLLOW MODE: See what collaborators see
 * 
 * Shows active users, follow mode, and WebRTC UI slots.
 */

import React, { useState, useEffect } from 'react'
import { usePresence, type UserPresence, isUserActive } from '@/lib/collaboration/presence'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Users,
  UserCheck,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Eye,
  EyeOff,
  UserX,
} from 'lucide-react'

interface HuddleBarProps {
  roomId: string
  onFollowUser?: (userId: string) => void
  onUnfollow?: () => void
}

export function HuddleBar({ roomId, onFollowUser, onUnfollow }: HuddleBarProps) {
  const {
    localUser,
    remoteUsers,
    followUser,
    unfollowUser,
  } = usePresence(roomId)

  const [micEnabled, setMicEnabled] = useState(false)
  const [videoEnabled, setVideoEnabled] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)

  const activeUsers = remoteUsers.filter(isUserActive)
  const totalUsers = activeUsers.length + 1 // +1 for local user

  const followedUser = localUser.isFollowing
    ? remoteUsers.find(u => u.userId === localUser.isFollowing)
    : null

  const handleFollowUser = (userId: string) => {
    followUser(userId)
    onFollowUser?.(userId)
  }

  const handleUnfollow = () => {
    unfollowUser()
    onUnfollow?.()
  }

  const toggleMic = () => {
    // WebRTC integration stub
    setMicEnabled(!micEnabled)
    console.log('[Huddle] Microphone:', !micEnabled ? 'enabled' : 'disabled')
  }

  const toggleVideo = () => {
    // WebRTC integration stub
    setVideoEnabled(!videoEnabled)
    console.log('[Huddle] Camera:', !videoEnabled ? 'enabled' : 'disabled')
  }

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          size="sm"
          className="rounded-full w-12 h-12 shadow-lg"
        >
          <Users className="w-5 h-5" />
        </Button>
      </div>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 p-4 w-80 shadow-2xl border-emerald-500/30 bg-background/95 backdrop-blur">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold">Collaboration Pod</span>
          <Badge variant="outline" className="text-xs">
            {totalUsers} active
          </Badge>
        </div>
        <Button
          onClick={() => setIsExpanded(false)}
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
        >
          <EyeOff className="w-3 h-3" />
        </Button>
      </div>

      {/* Follow Mode Status */}
      {followedUser && (
        <div className="mb-4 p-2 rounded bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-blue-400">
                Following {followedUser.userName}
              </span>
            </div>
            <Button
              onClick={handleUnfollow}
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-blue-400 hover:text-blue-300"
            >
              <UserX className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Active Users */}
      <div className="space-y-2 mb-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">
          Active Users
        </div>

        {/* Local User */}
        <div className="flex items-center gap-2 p-2 rounded bg-emerald-500/5 border border-emerald-500/20">
          <Avatar className="w-8 h-8" style={{ borderColor: localUser.userColor }}>
            <AvatarFallback style={{ backgroundColor: localUser.userColor + '30' }}>
              {localUser.userName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="text-sm font-medium">{localUser.userName} (You)</div>
            {localUser.currentFile && (
              <div className="text-xs text-muted-foreground truncate">
                {localUser.currentFile.split('/').pop()}
              </div>
            )}
          </div>
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        </div>

        {/* Remote Users */}
        {activeUsers.map((user) => (
          <div
            key={user.userId}
            className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors"
          >
            <Avatar className="w-8 h-8" style={{ borderColor: user.userColor }}>
              <AvatarFallback style={{ backgroundColor: user.userColor + '30' }}>
                {user.userName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-medium">{user.userName}</div>
              {user.currentFile && (
                <div className="text-xs text-muted-foreground truncate">
                  {user.currentFile.split('/').pop()}
                </div>
              )}
            </div>
            <Button
              onClick={() => handleFollowUser(user.userId)}
              size="sm"
              variant="ghost"
              className="h-6 px-2"
              disabled={!!followedUser}
            >
              <Eye className="w-3 h-3" />
            </Button>
            <div className="w-2 h-2 rounded-full bg-green-400" />
          </div>
        ))}

        {activeUsers.length === 0 && (
          <div className="text-xs text-muted-foreground text-center py-4">
            No other users in this room yet
          </div>
        )}
      </div>

      {/* WebRTC Controls (UI Stub) */}
      <div className="border-t pt-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          Voice & Video (Coming Soon)
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={toggleMic}
            size="sm"
            variant={micEnabled ? 'default' : 'outline'}
            className="flex-1"
            disabled
          >
            {micEnabled ? (
              <Mic className="w-3 h-3 mr-1" />
            ) : (
              <MicOff className="w-3 h-3 mr-1" />
            )}
            Mic
          </Button>
          <Button
            onClick={toggleVideo}
            size="sm"
            variant={videoEnabled ? 'default' : 'outline'}
            className="flex-1"
            disabled
          >
            {videoEnabled ? (
              <Video className="w-3 h-3 mr-1" />
            ) : (
              <VideoOff className="w-3 h-3 mr-1" />
            )}
            Video
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          WebRTC integration ready for implementation
        </p>
      </div>

      {/* Constitutional Notice */}
      <div className="mt-4 p-2 rounded bg-muted/50 border border-muted">
        <p className="text-xs text-muted-foreground">
          🛡️ <span className="font-semibold">Transparency:</span> All users are visible.
          No invisible observers.
        </p>
      </div>
    </Card>
  )
}

/**
 * Remote Cursor Component
 * Renders colored cursors for remote users
 */
interface RemoteCursorProps {
  user: UserPresence
}

export function RemoteCursor({ user }: RemoteCursorProps) {
  if (!user.cursorPosition) return null

  return (
    <div
      className="fixed pointer-events-none z-50 transition-all duration-100"
      style={{
        left: user.cursorPosition.x,
        top: user.cursorPosition.y,
      }}
    >
      {/* Cursor flag */}
      <div className="relative">
        <svg
          width="24"
          height="36"
          viewBox="0 0 24 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
            fill={user.userColor}
            stroke="white"
          />
        </svg>
        {/* User name label */}
        <div
          className="absolute top-0 left-6 px-2 py-1 rounded text-xs font-medium whitespace-nowrap shadow-lg"
          style={{
            backgroundColor: user.userColor,
            color: 'white',
          }}
        >
          {user.userName}
        </div>
      </div>
    </div>
  )
}

/**
 * Remote Cursors Container
 * Renders all remote cursors
 */
interface RemoteCursorsProps {
  roomId: string
}

export function RemoteCursors({ roomId }: RemoteCursorsProps) {
  const { remoteUsers } = usePresence(roomId)

  return (
    <>
      {remoteUsers.filter(isUserActive).map(user => (
        <RemoteCursor key={user.userId} user={user} />
      ))}
    </>
  )
}
