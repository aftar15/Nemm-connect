'use client'

// Chapter List Component with Edit/Delete and View Members

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreVertical, Pencil, Trash2, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import EditChapterDialog from './EditChapterDialog'
import DeleteChapterDialog from './DeleteChapterDialog'
import ChapterMembersDialog from './ChapterMembersDialog'

import { createClient } from '@/lib/supabase/client'

interface Chapter {
  id: string
  name: string
  created_at: string
  updated_at: string
}

interface ChapterListProps {
  initialChapters: Chapter[]
}

export default function ChapterList({ initialChapters }: ChapterListProps) {
  const [chapters, setChapters] = useState(initialChapters)
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)
  const [deletingChapter, setDeletingChapter] = useState<Chapter | null>(null)
  const [viewingChapter, setViewingChapter] = useState<{ id: string; name: string } | null>(null)
  const router = useRouter()

  if (chapters.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No chapters created yet. Click &quot;Create Chapter&quot; to get started.
        </p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Chapter Name</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {chapters.map((chapter) => (
            <TableRow 
              key={chapter.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => setViewingChapter({ id: chapter.id, name: chapter.name })}
            >
              <TableCell className="font-medium">{chapter.name}</TableCell>
              <TableCell>
                {new Date(chapter.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        setViewingChapter({ id: chapter.id, name: chapter.name })
                      }}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      View Members
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingChapter(chapter)
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeletingChapter(chapter)
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingChapter && (
        <EditChapterDialog
          chapter={editingChapter}
          open={!!editingChapter}
          onOpenChange={(open) => !open && setEditingChapter(null)}
        />
      )}

      {deletingChapter && (
        <DeleteChapterDialog
          chapter={deletingChapter}
          open={!!deletingChapter}
          onOpenChange={(open) => !open && setDeletingChapter(null)}
        />
      )}

      {viewingChapter && (
        <ChapterMembersDialog
          chapterId={viewingChapter.id}
          chapterName={viewingChapter.name}
          open={!!viewingChapter}
          onOpenChange={(open) => !open && setViewingChapter(null)}
        />
      )}
    </>
  )
}

