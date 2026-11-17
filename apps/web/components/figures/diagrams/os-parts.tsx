import os from './os.module.css';

/** A short arrow pointing down, for a link from one row of the picture to the row below. */
export function DownArrow() {
  return (
    <svg className={os.downArrow} viewBox="0 0 20 28" aria-hidden="true" focusable="false">
      <path d="M10 2v23M4 19l6 6 6-6" />
    </svg>
  );
}
