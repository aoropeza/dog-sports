# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Repository structure

Monorepo — each workspace has its own `package.json` and `node_modules`:

```
canine-sports-2/
├── app/               # Next.js app (SSR on Lambda) — primary codebase
└── infrastructure/    # AWS CDK stacks (Lambda + CloudFront)
```

`app/` builds as a standalone Node server (`output: "standalone"` in
`app/next.config.ts`) that runs in Lambda behind the
[aws-lambda-web-adapter](https://github.com/awslabs/aws-lambda-web-adapter)
layer, fronted by CloudFront on its own `*.cloudfront.net` domain (no custom
domain yet). `app/package.json`'s `postbuild` script copies `public/` and
`.next/static` into `.next/standalone` and writes the `run.sh` entrypoint the
adapter expects. `infrastructure/` deploys `.next/standalone` as the Lambda's
code and `.next/static` to S3 (served by CloudFront on `/_next/static/*`,
bypassing the Lambda for those hashed, cacheable assets).

This mirrors citius's deployment shape, minus what this app doesn't need:
no VPC (DynamoDB is reached over its public endpoint), no DynamoDB cache
table (no ISR/revalidation), no Route53/ACM (no domain picked yet).

## Training sessions (DynamoDB)

`/sesiones` lets the user save exercises picked on the board into training
sessions. Data lives in one DynamoDB table, `training-sessions-<STAGE>`
(created by the CDK stack, retained on destroy). The app talks to it through
server actions in `app/src/lib/actions/sessions.ts`, consumed from client
components with the `useServerAction` hook (`app/src/hooks/useServerAction.ts`,
same pattern as citius). Bump a counter passed in `extraDeps` to refetch after
a mutation.

Running locally hits the deployed `develop` table: `app/.env.local` (gitignored)
sets `MACHINE=local` and `STAGE=develop`, and the actions then read the
`dogsports` profile from `~/.aws/credentials` (override with `AWS_PROFILE_NAME`,
region defaults to `us-east-1`). Just `npm run dev`.

There is no authentication: anyone with the CloudFront URL can read and edit
sessions.

See `@app/AGENTS.md` for Next.js-specific agent rules.

## CI/CD — trunk-based

Single `main` branch, no `develop`/release branches:

- `ci.yml` — every PR into `main`: lint, build, `cdk synth` (no AWS calls).
- `cd.yml` — every push to `main`: lint, build once, package the build,
  upload it to a shared S3 bucket keyed by commit SHA, then deploy it to
  **staging** (`STAGE=develop`) automatically.
- `promote-production.yml` — manual (`workflow_dispatch`): deploys that
  *same* already-built artifact to **production** (`STAGE=main`). Nothing
  gets rebuilt between staging and production.

Needs `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` as repo secrets, and
`cdk bootstrap` run once per AWS account/region before the first deploy.

## Commands

Run from the repo root (proxies into `app/` via `npm --prefix`):

```
npm run dev      # start the Next.js dev server
npm run lint      # lint the app
npm run build     # next build -> app/.next/standalone (+ app/.next/static)
```

Infrastructure (from `infrastructure/`, `STAGE=develop` or `STAGE=main`):

```
npm run synth     # render the CloudFormation template, no AWS calls
npm run deploy    # cdk deploy --all
```
