# The Trailer Stack

![The Trailer Stack]()

```sh
npx create-remix@latest --template zyishai/trailer-stack
```

---

The Trailer Stack is a **quick and lightweight** Remix stack. The base build weighs only 40kB!  
It uses a combination of very minimal setup and optional add-ons that can be installed and configured during initialization.  
Note that this stack is opinionated to my needs; however, you can very easily remove/replace different parts that you don't need/want.

## What's in the stack 🚀

<!--
- [Fly app deployment](https://fly.io) with [Docker](https://www.docker.com/)
- Production-ready [SQLite Database](https://sqlite.org)
- Healthcheck endpoint for [Fly backups region fallbacks](https://fly.io/docs/reference/configuration/#services-http_checks)
- [GitHub Actions](https://github.com/features/actions) for deploy on merge to production and staging environments
- Email/Password Authentication with [cookie-based sessions](https://remix.run/utils/sessions#md-createcookiesessionstorage)
- Database ORM with [Prisma](https://prisma.io)
- End-to-end testing with [Cypress](https://cypress.io)
- Local third party request mocking with [MSW](https://mswjs.io)
- Unit testing with [Vitest](https://vitest.dev) and [Testing Library](https://testing-library.com)
-->
- Styling with [Tailwind](https://tailwindcss.com/) and [Shadcn UI](https://ui.shadcn.com)
- Custom fonts: `Inter` and `InterDisplay`
- Custom components: CodeWithCopy, ThemeSelector, and more
- Dark mode support
- Runtime schema validation using [Zod](https://zod.dev) and [Conform](https://conform.guide)
- Flat routes provided by [Remix Flat Routes](https://github.com/kiliman/remix-flat-routes)
- SEO features: auto sitemap.xml generation and robots.txt routes.
- Code formatting with [Prettier](https://prettier.io) and [EditorConfig](https://editorconfig.org)
- Auto lint before commits using [ESLint](https://eslint.org) and [Husky](https://www.npmjs.com/package/husky)
- Static Types with [TypeScript](https://typescriptlang.org)

## Planned Features 🛠️
- todo

## Contributing 🤝
Found a bug? Want to suggest a feature? You can [report a bug](), [recommend a feature]() or fork this repository and [open a pull-request](). Just make sure you follow the [Contribution Guide]().

**Thank you for using this stack. Please reach out to me if you have any questions.**
