export function registrationCookie() {
  const secure = process.env.NEXTAUTH_URL?.startsWith("https://") === true;
  return {
    name: secure ? "__Host-nr-registration" : "nr-registration",
    secure,
  };
}
