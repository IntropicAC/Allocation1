// components/TutorialModal.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import styles from "./tutorialModal.module.css";

/**
 * Props:
 * - isOpen (bool)
 * - onClose () => void
 * - pages: Array<{ title?: string, description?: string, gifSrc?: string, alt?: string }>
 * - localStorageKey (string) e.g. 'allocationTutorialDismissed:v1'
 */
function TutorialModal({ isOpen, onClose, pages = [], localStorageKey = 'allocationTutorialDismissed:v1' }) {
  const total = pages.length;
  const [index, setIndex] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Guard if no pages
  const safePages = useMemo(() => (Array.isArray(pages) && pages.length ? pages : [{
    title: "Welcome",
    description: "This is your allocation tutorial.",
    gifSrc: "",
    alt: "Tutorial"
  }]), [pages]);

  const close = useCallback(() => {
    if (dontShowAgain) {
      try {
        localStorage.setItem(localStorageKey, "1");
      } catch {}
    }
    onClose?.();
  }, [dontShowAgain, onClose, localStorageKey]);

  const next = () => setIndex(i => Math.min(i + 1, total - 1));
  const prev = () => setIndex(i => Math.max(i - 1, 0));

  // Keyboard navigation (Esc to close, arrows to navigate)
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  if (!isOpen) return null;

  const page = safePages[index];

  return (
    <div className={styles.modalOverlay} onClick={close} role="dialog" aria-modal="true" aria-label="Allocation Tutorial">
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{page.title || "Tutorial"}</h2>
          <button className={styles.closeButton} onClick={close} title="Close">×</button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.tutorialStack}>
            <div className={styles.media}>
              {page.gifSrc ? (
                <video
                  src={page.gifSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className={styles.mediaVideo}
                />
              ) : (
                <div className={styles.mediaPlaceholder}>GIF / Image</div>
              )}
            </div>

            <div className={styles.text}>
              {page.description ? (
                <div className={styles.description}>{page.description}</div>
              ) : (
                <p className={styles.description}>Describe this feature here.</p>
              )}
            </div>
          </div>


        </div>

        <div className={styles.modalFooter}>
          <div className={styles.leftSide}>
            <label className={styles.checkboxWrap}>
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
              />
              <span>Don’t show this again</span>
            </label>
          </div>

          <div className={styles.centerSide}>
            {/* page dots */}
            <div className={styles.dots}>
              {safePages.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <div className={styles.rightSide}>
            <button
              className={styles.navButton}
              onClick={prev}
              disabled={index === 0}
              title="Previous"
            >
              ←
            </button>
            {index < total - 1 ? (
              <button className={styles.navButton} onClick={next} title="Next">
                →
              </button>
            ) : (
              <button className={styles.doneButton} onClick={close}>
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorialModal;
