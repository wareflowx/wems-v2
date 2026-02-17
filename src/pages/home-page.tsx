import { SiElectron, SiReact, SiVite } from "@icons-pack/react-simple-icons";
import { useTranslation } from "react-i18next";
import ExternalLink from "@/components/external-link";
import { Link } from "@tanstack/react-router"

export const iframeHeight = "800px"
export const description = "A sidebar with a header and a search form."

export function HomePage() {
  const { t } = useTranslation()
  const iconSize = 48

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex flex-col items-end justify-center gap-0.5">
        <div className="inline-flex gap-2">
          <SiReact size={iconSize} />
          <SiVite size={iconSize} />
          <SiElectron size={iconSize} />
        </div>
        <span className="flex items-end justify-end">
          <h1 className="font-bold font-mono text-4xl">{t("app.name")}</h1>
        </span>
        <div className="flex w-full justify-between">
          <ExternalLink
            className="flex gap-2 text-muted-foreground text-sm"
            href="https://github.com/LuanRoger"
          >
            Made by LuanRoger
          </ExternalLink>
        </div>
      </div>

      {/* Database Section */}
      <div className="mt-8 text-center w-full">
        <h2 className="text-xl font-semibold mb-4">Database</h2>
        <Link
          to="/posts"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 inline-block"
        >
          Manage Posts
        </Link>
      </div>
    </div>
  )
}
