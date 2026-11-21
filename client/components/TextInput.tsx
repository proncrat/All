import type { InputHTMLAttributes, ReactNode } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  /** Content rendered before the input (icon, spinner, ...) */
  start?: ReactNode
  /** Content rendered after the input */
  end?: ReactNode
  /** Extra classes for the outer wrapper */
  wrapperClassName?: string
}

export function TextInput({
  start,
  end,
  wrapperClassName = '',
  className = '',
  ...props
}: Props) {
  return (
    <label
      className={`flex h-8 w-full min-w-0 cursor-text items-center gap-2 rounded-lg border border-input px-2.5 text-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-disabled:opacity-50 dark:bg-input/30 ${wrapperClassName}`}
    >
      {start && (
        <span className="flex shrink-0 items-center text-muted-foreground [&>svg]:size-4">
          {start}
        </span>
      )}
      <input
        className={`h-full w-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed md:text-sm ${className}`}
        {...props}
      />
      {end && (
        <span className="flex shrink-0 items-center text-muted-foreground [&>svg]:size-4">
          {end}
        </span>
      )}
    </label>
  )
}
