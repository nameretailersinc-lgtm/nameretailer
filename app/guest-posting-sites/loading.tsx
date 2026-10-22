import styles from "./loading.module.css";

// Only the placeholder: the streamed HTML keeps this markup beside the real page,
// so it must not repeat the page shell, the H1 or the footer.
export default function Loading() {
  return (
    <section
      className={styles.loading}
      aria-busy="true"
      aria-label="Publication directory"
    >
      <p className={styles.status} role="status">
        Loading publications…
      </p>
      <div className={styles.cards} aria-hidden="true">
        {Array.from({ length: 8 }, (_, index) => (
          <div className={styles.card} key={index}>
            <span className={styles.icon} />
            <div>
              <span />
              <span />
              <span />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
