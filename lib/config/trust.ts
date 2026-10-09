export type TrustClaim = {
  label: string;
  evidenceUrl: string;
  evidenceDate: string;
};

// Add only owner-confirmed statements with a real supporting source and date.
// There is no default customer count, testimonial, endorsement or numeric claim.
export const trustClaims: TrustClaim[] = [];

export function supportedTrustClaims(claims: readonly TrustClaim[]) {
  return claims.filter((claim) => {
    const date = Date.parse(claim.evidenceDate);
    try {
      const url = new URL(claim.evidenceUrl);
      return (
        !!claim.label.trim() &&
        url.protocol === "https:" &&
        Number.isFinite(date) &&
        date <= Date.now()
      );
    } catch {
      return false;
    }
  });
}
