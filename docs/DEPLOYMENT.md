# Deployment

The demo is configured as a static export. No server secrets, database, or upload service are required.

## Build

```sh
npm ci
npm run build:component
npm run fixtures
npm run build
```

The static output is in `dist/client/`. The Sites hosting manifest selects that same directory. Serve it with a static HTTP host; opening index.html directly from disk is not a supported React application deployment.

## Free hosting under your account

Cloudflare Pages is a suitable option. Connect your GitHub repository, use the build command above (excluding npm ci if your provider runs installation automatically), and select the generated static directory. No backend is needed. Vercel or GitHub Pages can also serve a correctly configured export; GitHub project Pages requires matching the repository base path rather than assuming root-relative URLs work.

The provided source can be committed to a new GitHub repository named framepick. This task does not automatically publish to the npm registry. The local tarball can be installed directly in the later face-to-anime and captioning applications.

Before adding a demo link to your résumé, open it signed out and confirm access, pick an image, check the downloads, and test mobile layout. Sites deployments may be owner-private; verify the audience rather than treating every deployment URL as public.
