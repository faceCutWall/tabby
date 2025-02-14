'use client'

import { useContext, useState } from 'react'
import type { MouseEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { graphql } from '@/lib/gql/generates'
import { clearHomeScrollPosition } from '@/lib/stores/scroll-store'
import { useMutation } from '@/lib/tabby/gql'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  IconChevronLeft,
  IconEdit,
  IconMore,
  IconPlus,
  IconSpinner,
  IconTrash
} from '@/components/ui/icons'
import { ClientOnly } from '@/components/client-only'
import { NotificationBox } from '@/components/notification-box'
import { ThemeToggle } from '@/components/theme-toggle'
import { MyAvatar } from '@/components/user-avatar'
import UserPanel from '@/components/user-panel'

import { PageContext } from './page-context'

const deletePageMutation = graphql(/* GraphQL */ `
  mutation DeletePage($id: ID!) {
    deletePage(id: $id)
  }
`)

type HeaderProps = {
  pageIdFromURL?: string
  streamingDone?: boolean
}

export function Header({ pageIdFromURL, streamingDone }: HeaderProps) {
  const router = useRouter()
  const { isPageOwner, mode, setMode } = useContext(PageContext)
  const isEditMode = mode === 'edit'
  const [deleteAlertVisible, setDeleteAlertVisible] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const deletePage = useMutation(deletePageMutation, {
    onCompleted(data) {
      if (data.deletePage) {
        router.replace('/')
      } else {
        toast.error('Failed to delete')
        setIsDeleting(false)
      }
    },
    onError(err) {
      toast.error(err?.message || 'Failed to delete')
      setIsDeleting(false)
    }
  })

  const handleDeletePage = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsDeleting(true)
    deletePage({
      id: pageIdFromURL!
    })
  }

  const onNavigateToHomePage = (scroll?: boolean) => {
    if (scroll) {
      clearHomeScrollPosition()
    }
    router.push('/')
  }

  return (
    <header className="flex h-16 w-full items-center justify-between border-b px-4 lg:px-10">
      <div className="flex items-center gap-x-6">
        <Button
          variant="ghost"
          className="-ml-1 pl-0 text-sm text-muted-foreground"
          onClick={() => onNavigateToHomePage()}
        >
          <IconChevronLeft className="mr-1 h-5 w-5" />
          Home
        </Button>
      </div>
      <div className="flex items-center gap-2">
        {!isEditMode ? (
          <>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                  <IconMore />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {streamingDone && pageIdFromURL && (
                  <DropdownMenuItem
                    className="cursor-pointer gap-2"
                    onClick={() => onNavigateToHomePage(true)}
                  >
                    <IconPlus />
                    <span>Add new page</span>
                  </DropdownMenuItem>
                )}
                {streamingDone && pageIdFromURL && isPageOwner && (
                  <AlertDialog
                    open={deleteAlertVisible}
                    onOpenChange={setDeleteAlertVisible}
                  >
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem className="cursor-pointer gap-2">
                        <IconTrash />
                        Delete Page
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this page</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this page? This
                          operation is not revertible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className={buttonVariants({ variant: 'destructive' })}
                          onClick={handleDeletePage}
                        >
                          {isDeleting && (
                            <IconSpinner className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Yes, delete it
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              className="flex items-center gap-1 px-2 font-normal"
              onClick={() => setMode('edit')}
            >
              <IconEdit />
              Edit Page
            </Button>
          </>
        ) : (
          <>
            <Button onClick={e => setMode('view')}>Done</Button>
          </>
        )}
        <ClientOnly>
          <ThemeToggle />
        </ClientOnly>
        <NotificationBox className="mr-4" />
        <UserPanel
          showHome={false}
          showSetting
          beforeRouteChange={() => {
            clearHomeScrollPosition()
          }}
        >
          <MyAvatar className="h-10 w-10 border" />
        </UserPanel>
      </div>
    </header>
  )
}
