import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

type DialogContentProps = {
  children: ReactNode;
  className?: string;
};

type DialogHeaderProps = {
  children: ReactNode;
};

type DialogTitleProps = {
  children: ReactNode;
};

type DialogDescriptionProps = {
  children: ReactNode;
};

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const [isVisible, setIsVisible] = useState(open);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;
    const previousStyles = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
      htmlOverflow: html.style.overflow,
    };
    const scrollbarWidth = window.innerWidth - html.clientWidth;

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
    html.style.overflow = "hidden";

    return () => {
      body.style.position = previousStyles.position;
      body.style.top = previousStyles.top;
      body.style.width = previousStyles.width;
      body.style.overflow = previousStyles.overflow;
      body.style.paddingRight = previousStyles.paddingRight;
      html.style.overflow = previousStyles.htmlOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  useEffect(() => {
    const overlay = overlayRef.current;

    if (!overlay) {
      return;
    }

    const content = overlay.querySelector(".dialog-content") as HTMLElement | null;

    if (open) {
      setIsVisible(true);

      gsap.set(overlay, {
        autoAlpha: 0,
        visibility: "visible",
        pointerEvents: "auto",
        backgroundColor: "rgba(3, 4, 94, 0.08)",
        backdropFilter: "blur(8px)",
      });

      if (content) {
        gsap.set(content, {
          autoAlpha: 0,
          y: 28,
          scale: 0.96,
        });
      }

      gsap.timeline({ defaults: { ease: "power3.out" } })
        .to(overlay, {
          autoAlpha: 1,
          backgroundColor: "rgba(3, 4, 94, 0.62)",
          duration: 0.45,
        })
        .to(
          content ?? overlay,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.4,
          },
          "-=0.15"
        );

      return;
    }

    if (!isVisible) {
      return;
    }

    const closeTimeline = gsap.timeline({ defaults: { ease: "power3.in" } });

    if (content) {
      closeTimeline.to(content, {
        autoAlpha: 0,
        y: 20,
        scale: 0.97,
        duration: 0.25,
      });
    }

    closeTimeline
      .to(
        overlay,
        {
          autoAlpha: 0,
          backgroundColor: "rgba(3, 4, 94, 0)",
          backdropFilter: "blur(0px)",
          duration: 0.25,
        },
        0
      )
      .eventCallback("onComplete", () => {
        gsap.set(overlay, {
          visibility: "hidden",
          pointerEvents: "none",
          backgroundColor: "rgba(3, 4, 94, 0)",
          backdropFilter: "blur(0px)",
        });
        setIsVisible(false);
      });
  }, [isVisible, open]);

  if (!open && !isVisible) {
    return null;
  }

  return (
    <div ref={overlayRef} className="dialog-overlay" onClick={() => onOpenChange(false)}>
      {children}
    </div>
  );
}

export function DialogContent({ children, className }: DialogContentProps) {
  return (
    <div
      className={`dialog-content ${className ?? ""}`.trim()}
      role="dialog"
      aria-modal="true"
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return <div className="dialog-header">{children}</div>;
}

export function DialogTitle({ children }: DialogTitleProps) {
  return <h2 className="dialog-title">{children}</h2>;
}

export function DialogDescription({ children }: DialogDescriptionProps) {
  return <p className="dialog-description">{children}</p>;
}
