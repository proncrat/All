import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'

export function ProfileLost() {
  return (
    <Empty className="border ">
      <EmptyHeader>
        <EmptyTitle>404 - Not Found</EmptyTitle>
        <EmptyDescription>There is no profile by that name/id</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <EmptyDescription>Need help? Skill issue</EmptyDescription>
      </EmptyContent>
    </Empty>
  )
}
