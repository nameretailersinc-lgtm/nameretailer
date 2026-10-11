"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Globe2,
  GraduationCap,
  Grid2X2,
  HeartPulse,
  House,
  MapPin,
  Monitor,
  Palette,
  PawPrint,
  Plane,
  Search,
  ShoppingBag,
  Utensils,
  X,
  type LucideIcon,
} from "lucide-react";
import { CountryName, countryCode } from "@/components/site/country-name";
import styles from "./catalog-browser.module.css";

const topicGroups: Array<{ label: string; Icon: LucideIcon; matches: RegExp }> =
  [
    {
      label: "Business & Finance",
      Icon: BriefcaseBusiness,
      matches:
        /business|finance|bank|career|employment|management|startups|commerce|marketing|econom/iu,
    },
    {
      label: "Technology",
      Icon: Monitor,
      matches:
        /technology|comput|software|program|internet|mobile|hardware|gadget|web|telecom|crypto/iu,
    },
    {
      label: "Education",
      Icon: GraduationCap,
      matches: /education|learning|teaching|science|books/iu,
    },
    {
      label: "Health & Wellness",
      Icon: HeartPulse,
      matches: /health|fitness|medical|beauty|wellness|sport/iu,
    },
    {
      label: "Home & Lifestyle",
      Icon: House,
      matches:
        /home|house|estate|construction|repair|lifestyle|family|garden|wedding/iu,
    },
    {
      label: "Travel",
      Icon: Plane,
      matches: /travel|tourism|transport|automobil/iu,
    },
    {
      label: "Arts & Entertainment",
      Icon: Palette,
      matches: /art|culture|music|entertainment|film|photograph|design|game/iu,
    },
    {
      label: "Animals & Nature",
      Icon: PawPrint,
      matches: /animal|pet|nature|environment|agricultur/iu,
    },
    {
      label: "Food",
      Icon: Utensils,
      matches: /food|cook|nutrition|restaurant/iu,
    },
    {
      label: "Fashion & Shopping",
      Icon: ShoppingBag,
      matches: /fashion|shopping|clothing|retail/iu,
    },
  ];
const continentCodes: Array<[string, string]> = [
  [
    "North America",
    "AG AI AW BB BL BM BQ BS BZ CA CR CU CW DM DO GD GL GP GT HN HT JM KN KY LC MF MQ MS MX NI PA PM PR SV SX TC TT US VC VG VI",
  ],
  ["South America", "AR BO BR CL CO EC FK GF GY PE PY SR UY VE"],
  [
    "Europe",
    "AD AL AT AX BA BE BG BY CH CY CZ DE DK EE ES FI FO FR GB GB-ENG GB-SCT GB-WLS GG GI GR HR HU IE IM IS IT JE LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS RU SE SI SJ SK SM UA VA",
  ],
  [
    "Asia",
    "AE AF AM AZ BD BH BN BT CC CN CX GE HK ID IL IN IO IQ IR JO JP KG KH KP KR KW KZ LA LB LK MM MN MO MV MY NP OM PH PK PS QA SA SG SY TH TJ TL TM TR TW UZ VN YE",
  ],
  [
    "Africa",
    "AO BF BI BJ BW CD CF CG CI CM CV DJ DZ EG EH ER ET GA GH GM GN GQ GW KE KM LR LS LY MA MG ML MR MU MW MZ NA NE NG RE RW SC SD SH SL SN SO SS ST SZ TD TG TN TZ UG YT ZA ZM ZW",
  ],
  [
    "Oceania",
    "AS AU CK FJ FM GU KI MH MP NC NF NR NU NZ PF PG PN PW SB TK TO TV VU WF WS",
  ],
];
const popularCountryCodes = ["us", "gb", "ca", "au", "de", "fr", "in", "pk"];

export function CatalogBrowser({
  kind,
  values,
  selectedValue = "",
  onSelect,
  onClose,
}: {
  kind: "category" | "country";
  values: string[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const resultsPanel = useRef<HTMLElement>(null);
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("All");
  const country = kind === "country";
  const uniqueValues = [...new Set(values)].sort((a, b) => a.localeCompare(b));
  const groups = country
    ? continentCodes
        .map(([label, codes]) => ({
          label,
          Icon: MapPin,
          values: uniqueValues.filter((value) =>
            codes.split(" ").includes((countryCode(value) || "").toUpperCase()),
          ),
        }))
        .filter((item) => item.values.length > 0)
    : topicGroups
        .map((item) => ({
          ...item,
          values: uniqueValues.filter((value) => item.matches.test(value)),
        }))
        .filter((item) => item.values.length > 0);
  const selectedGroup = groups.find((item) => item.label === group);
  const visible = (selectedGroup?.values || uniqueValues).filter((value) => {
    const term = search.trim().toLowerCase();
    const code = country ? countryCode(term) : undefined;
    return (
      !term ||
      value.toLowerCase().includes(term) ||
      (country && countryCode(value)?.includes(term)) ||
      (!!code && countryCode(value) === code)
    );
  });
  const title =
    group === "All"
      ? country
        ? "All countries"
        : "All publication topics"
      : group;
  const HeaderIcon = selectedGroup?.Icon || (country ? Globe2 : Grid2X2);

  function chooseGroup(value: string) {
    setGroup(value);
    setSearch("");
    resultsPanel.current?.scrollTo({ top: 0 });
  }

  useEffect(() => {
    const element = dialog.current;
    const opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const root = document.documentElement;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousGutter = root.style.scrollbarGutter;
    root.style.scrollbarGutter = "stable";
    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    element?.showModal();
    searchInput.current?.focus();
    return () => {
      element?.close();
      root.style.overflow = previousRootOverflow;
      root.style.scrollbarGutter = previousGutter;
      document.body.style.overflow = previousBodyOverflow;
      opener?.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby="catalog-browser-title"
      aria-describedby="catalog-browser-description"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.toolbar}>
        <div className={styles.search}>
          <Search size={21} aria-hidden="true" />
          <input
            ref={searchInput}
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setGroup("All");
              resultsPanel.current?.scrollTo({ top: 0 });
            }}
            aria-label={
              country
                ? "Search available countries"
                : "Search available publication topics"
            }
            placeholder={
              country
                ? "Search countries (e.g. United States, Canada, UK...)"
                : "Search publication topics, categories or keywords..."
            }
          />
        </div>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={country ? "Close country browser" : "Close topic browser"}
        >
          <X size={22} aria-hidden="true" />
          <span>Close</span>
        </button>
      </div>
      <div className={styles.body}>
        <aside
          className={styles.sidebar}
          aria-label={country ? "Country groups" : "Topic groups"}
        >
          <button
            type="button"
            aria-pressed={group === "All"}
            onClick={() => chooseGroup("All")}
          >
            {country ? (
              <Globe2 size={22} aria-hidden="true" />
            ) : (
              <Grid2X2 size={22} aria-hidden="true" />
            )}
            <span>{country ? "All countries" : "All topics"}</span>
            <small>{uniqueValues.length}</small>
          </button>
          {groups.map(({ label, Icon, values: groupValues }, index) => (
            <button
              type="button"
              key={label}
              aria-pressed={group === label}
              data-tone={index % 5}
              onClick={() => chooseGroup(label)}
            >
              <Icon size={22} aria-hidden="true" />
              <span>{label}</span>
              <small>{groupValues.length}</small>
            </button>
          ))}
          {country &&
            uniqueValues.some((value) =>
              popularCountryCodes.includes(countryCode(value) || ""),
            ) && (
              <div className={styles.popular}>
                <h3>Popular countries</h3>
                {popularCountryCodes
                  .map((code) =>
                    uniqueValues.find((value) => countryCode(value) === code),
                  )
                  .filter((value): value is string => !!value)
                  .map((value) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() => onSelect(value)}
                    >
                      <CountryName country={value} />
                      <ChevronRight size={14} aria-hidden="true" />
                    </button>
                  ))}
              </div>
            )}
        </aside>
        <section ref={resultsPanel} className={styles.results}>
          <header>
            <span className={styles.headerIcon}>
              <HeaderIcon size={36} aria-hidden="true" />
            </span>
            <div>
              <h2 id="catalog-browser-title">{title}</h2>
              <p id="catalog-browser-description">
                {country
                  ? "Select a country to find publications for your audience."
                  : "Select a topic to see matching guest posting publications."}
              </p>
            </div>
            <div className={styles.headerActions}>
              <span className={styles.count} role="status">
                {visible.length} {country ? "countries" : "topics"}
              </span>
              <button
                type="button"
                className={styles.allOptions}
                onClick={() => onSelect("")}
              >
                {country ? "Use all countries" : "Use all topics"}
              </button>
            </div>
          </header>
          {visible.length ? (
            <div
              className={`${styles.grid} ${country ? styles.countryGrid : ""}`}
            >
              {visible.map((value, index) => {
                const Icon =
                  topicGroups.find((item) => item.matches.test(value))?.Icon ||
                  BookOpen;
                return (
                  <button
                    type="button"
                    key={value}
                    onClick={() => onSelect(value)}
                    aria-pressed={selectedValue === value}
                    data-tone={index % 5}
                  >
                    {country ? (
                      <CountryName country={value} />
                    ) : (
                      <>
                        <span className={styles.topicIcon}>
                          <Icon size={26} aria-hidden="true" />
                        </span>
                        <span>
                          {value}
                          <small>Browse publications</small>
                        </span>
                      </>
                    )}
                    {selectedValue === value ? (
                      <Check
                        size={19}
                        className={styles.selectedCheck}
                        aria-hidden="true"
                      />
                    ) : (
                      <ChevronRight size={17} aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className={styles.empty}>
              <Search size={30} aria-hidden="true" />
              <h3>No {country ? "countries" : "topics"} match your search</h3>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setGroup("All");
                }}
              >
                Reset browsing filters{" "}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          )}
        </section>
      </div>
    </dialog>
  );
}
