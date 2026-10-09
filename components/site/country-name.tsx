import Image from "next/image";
import { countryCodes } from "@/lib/commerce/countries";
import styles from "./country-name.module.css";

const normalizeCountry = (value: string) =>
  value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
const countryRegions = new Map(
  countryCodes.flatMap((code) => [
    [code.toLowerCase(), code.toLowerCase()],
    [normalizeCountry(regionNames.of(code) || code), code.toLowerCase()],
  ] as [string, string][]),
);
const aliases: Record<string, string> = {
  usa: "us", "u s": "us", "u s a": "us", "united states of america": "us",
  uk: "gb", "u k": "gb", britain: "gb", "great britain": "gb",
  england: "gb-eng", scotland: "gb-sct", wales: "gb-wls",
  uae: "ae", "u a e": "ae", holland: "nl", "the netherlands": "nl",
  "south korea": "kr", "north korea": "kp", "czech republic": "cz",
  turkey: "tr", vietnam: "vn", "russian federation": "ru",
  "republic of ireland": "ie", "ivory coast": "ci",
};

export function CountryName({ country }: { country: string | null | undefined }) {
  const name = country || "Unavailable";
  const normalized = normalizeCountry(name);
  const code = aliases[normalized] || countryRegions.get(normalized);
  return (
    <span className={styles.country}>
      {code && (
        <Image
          className={styles.flag}
          src={`/flags/${code}.svg`}
          width={24}
          height={18}
          alt=""
          aria-hidden="true"
          unoptimized
        />
      )}
      <span>{name}</span>
    </span>
  );
}
