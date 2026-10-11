import { InformationShell } from "@/components/site/information-page";
import styles from "./loading.module.css";

export default function Loading() {
  return (
    <InformationShell
      path="/guest-posting-sites/"
      title="Guest posting sites by niche, country and budget"
      label="Guest posting sites"
      description="Find publications for your audience. Compare topics, countries, metrics and placement prices to plan your next guest post."
      active="marketplace"
      image="/15_laptop_dashboard_illustration.png"
    >
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
    </InformationShell>
  );
}
