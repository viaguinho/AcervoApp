import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * @typedef {React.HTMLAttributes<HTMLDivElement>} DivProps
 */

/** @type {React.ForwardRefExoticComponent<DivProps & React.RefAttributes<HTMLDivElement>>} */
const Card = React.forwardRef((props, ref) => {
  const { className, children, ...rest } = props
  return (
    <div
      ref={ref}
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
      {...rest}
    >
      {children}
    </div>
  )
})
Card.displayName = "Card"

/** @type {React.ForwardRefExoticComponent<DivProps & React.RefAttributes<HTMLDivElement>>} */
const CardHeader = React.forwardRef((props, ref) => {
  const { className, children, ...rest } = props
  return (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...rest}
    >
      {children}
    </div>
  )
})
CardHeader.displayName = "CardHeader"

/** @type {React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLHeadingElement> & React.RefAttributes<HTMLHeadingElement>>} */
const CardTitle = React.forwardRef((props, ref) => {
  const { className, children, ...rest } = props
  return (
    <h3
      ref={ref}
      className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
      {...rest}
    >
      {children}
    </h3>
  )
})
CardTitle.displayName = "CardTitle"

/** @type {React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>} */
const CardDescription = React.forwardRef((props, ref) => {
  const { className, children, ...rest } = props
  return (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...rest}
    >
      {children}
    </p>
  )
})
CardDescription.displayName = "CardDescription"

/** @type {React.ForwardRefExoticComponent<DivProps & React.RefAttributes<HTMLDivElement>>} */
const CardContent = React.forwardRef((props, ref) => {
  const { className, children, ...rest } = props
  return (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...rest}>
      {children}
    </div>
  )
})
CardContent.displayName = "CardContent"

/** @type {React.ForwardRefExoticComponent<DivProps & React.RefAttributes<HTMLDivElement>>} */
const CardFooter = React.forwardRef((props, ref) => {
  const { className, children, ...rest } = props
  return (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...rest}
    >
      {children}
    </div>
  )
})
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
