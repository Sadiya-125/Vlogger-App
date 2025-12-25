"use client"

import { useState } from "react"
import { Plus, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BoardCard } from "./board-card"
import { CreateBoardModal } from "./create-board-modal"

interface Board {
  id: string
  name: string
  description: string | null
  category: string
  isPrivate: boolean
  coverImage: string | null
  _count: {
    pins: number
    followers: number
  }
  pins: {
    images: { url: string }[]
  }[]
}

interface BoardsManagerProps {
  boards: Board[]
}

export function BoardsManager({ boards: initialBoards }: BoardsManagerProps) {
  const [boards, setBoards] = useState(initialBoards)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleBoardCreated = (newBoard: Board) => {
    setBoards([newBoard, ...boards])
  }

  const handleBoardDeleted = (boardId: string) => {
    setBoards(boards.filter((b) => b.id !== boardId))
  }

  const handleBoardUpdated = (updatedBoard: Board) => {
    setBoards(boards.map((b) => (b.id === updatedBoard.id ? updatedBoard : b)))
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">My Boards</h1>
          <p className="text-muted-foreground">
            Organize your travel destinations into collections
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Create Board
        </Button>
      </div>

      {/* Boards Grid */}
      {boards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              onDelete={handleBoardDeleted}
              onUpdate={handleBoardUpdated}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center mb-6">
            <Bookmark className="h-16 w-16 text-muted-foreground/50" />
          </div>
          <h3 className="text-2xl font-semibold mb-3">No boards yet</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Create your first board to start organizing your travel destinations
            into meaningful collections like Dream Trips, Weekend Getaways, or
            Bucket List Adventures.
          </p>
          <Button onClick={() => setShowCreateModal(true)} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Board
          </Button>
        </div>
      )}

      <CreateBoardModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onBoardCreated={handleBoardCreated}
      />
    </>
  )
}
