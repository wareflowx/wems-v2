<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wareflowx/wems-v2/main/images/icon.jpg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/wareflowx/wems-v2/main/images/icon.jpg">
    <img src="https://raw.githubusercontent.com/wareflowx/wems-v2/main/images/icon.jpg" alt="wems" width="200" style="border-radius: 50%;">
  </picture>
</p>

<h1 align="center">WEMS</h1>

<p align="center">
  <a href="https://wems.vercel.app">
    <img src="https://img.shields.io/website?down_color=lightgrey&down_message=offline&up_color=green&up_message=online&url=https%3A%2F%2Fwems.vercel.app" alt="Website">
  </a>
  <a href="https://github.com/wareflowx/wems-v2/releases">
    <img src="https://img.shields.io/github/v/release/wareflowx/wems-v2" alt="Release">
  </a>
  <a href="https://github.com/wareflowx/wems-v2/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/wareflowx/wems-v2" alt="License">
  </a>
</p>

> Modern desktop application for managing warehouse employees, certifications, and workplace safety.

## Features

- **Employee Management** - Track employees with positions and work locations
- **Contract Tracking** - Manage employment contracts and their statuses
- **Document Management** - Store and organize employee documents
- **Medical Visits** - Schedule and track medical examinations
- **CACES Certification** - Manage forklift and heavy equipment certifications
- **Alerts System** - Get notified about expiring certifications and upcoming visits
- **Dark/Light Theme** - Automatic theme based on system preferences

## Tech Stack

- Electron 40
- React 19
- TypeScript
- Tailwind CSS
- SQLite with Drizzle ORM
- TanStack Router

## Installation

```bash
# Install dependencies
npm install

# Run in development
npm run dev
```

## Build

```bash
# Build for production
npm run build

# Package for Windows
npm run package
```

The packaged application will be in the `release/` folder. The database is stored in the `data/` folder next to the executable.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

- **WareflowX**

## License

MIT License - see the [LICENSE](LICENSE) file for details.
