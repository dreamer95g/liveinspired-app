"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner";
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        // Aumentamos los íconos a size-5 para que acompañen el nuevo tamaño de letra
        success: <CircleCheckIcon className="size-5" />,
        info: <InfoIcon className="size-5" />,
        warning: <TriangleAlertIcon className="size-5" />,
        error: <OctagonXIcon className="size-5" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)"
        }
      }
      toastOptions={{
        classNames: {
          // Clases de Tailwind para aumentar el padding, tamaño de letra y centrar el contenido
          toast: "cn-toast flex items-center p-4 shadow-lg",
          content: "flex-1 flex flex-col justify-center",
          title: "text-base sm:text-lg font-semibold text-center w-full",
          description: "text-sm sm:text-base text-center w-full",
        },
      }}
      {...props}
    />
  );
}

export { Toaster }