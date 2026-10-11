# Repairing a deployment environment-file error

The SSH deployment workflow uses the existing `/opt/nameretailer/.env` on the server. That file is ignored by Git; fetching/resetting the repository and changing the local `.env` do not update the server copy.

`key cannot contain a space` identifies a malformed variable name on the reported line. Use assignments such as `MONGODB_DB=nameretailer_cms`. Descriptive notes should start with `#`; do not leave headings or labels with spaces as assignments. Spaces in a quoted value, such as `SMTP_FROM="Name Retailer <info@example.com>"`, are valid. Preserve production credentials and settings when correcting the offending line.

For the reported line 6, open the server file through your authenticated SSH session or hosting console:

```sh
cd /opt/nameretailer
nano +6 .env
```

Correct the variable name if it represents a real application setting, or prefix the line with `#` if it is only a descriptive note. Save the file, then validate it before rebuilding:

```sh
docker compose config --quiet
```

This command validates the configuration without printing resolved environment values. After it succeeds, rerun the failed deployment job or rebuild on the server:

```sh
docker compose up -d --build
curl -fsS -o /dev/null http://127.0.0.1:3100/robots.txt
```

The local malformed descriptive assignment was commented on 2026-10-11; parsing before and after produced identical active application settings. This does not certify the VPS file or a successful deployment. The SSH attempt to the supplied host failed authentication, so no server file was modified.

References: [Docker environment-file syntax](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/#env-file-syntax), [Docker Compose configuration validation](https://docs.docker.com/reference/cli/docker/compose/config/).
