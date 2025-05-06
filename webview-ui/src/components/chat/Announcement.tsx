import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { memo } from "react"
import { useAppTranslation } from "@/i18n/TranslationContext"
import { Trans } from "react-i18next"

interface AnnouncementProps {
	hideAnnouncement: () => void
}
/*
You must update the latestAnnouncementId in ClineProvider for new announcements to show to users. This new id will be compared with whats in state for the 'last announcement shown', and if it's different then the announcement will render. As soon as an announcement is shown, the id will be updated in state. This ensures that announcements are not shown more than once, even if the user doesn't close it themselves.
*/
const Announcement = ({ hideAnnouncement }: AnnouncementProps) => {
	const { t } = useAppTranslation()

	const discordLink = (
		<VSCodeLink
			href="https://discord.gg/roocode"
			onClick={(e) => {
				e.preventDefault()
				window.postMessage(
					{ type: "action", action: "openExternal", data: { url: "https://discord.gg/roocode" } },
					"*",
				)
			}}>
			Discord
		</VSCodeLink>
	)

	const redditLink = (
		<VSCodeLink
			href="https://reddit.com/r/RooCode"
			onClick={(e) => {
				e.preventDefault()
				window.postMessage(
					{ type: "action", action: "openExternal", data: { url: "https://reddit.com/r/RooCode" } },
					"*",
				)
			}}>
			Reddit
		</VSCodeLink>
	)

	return (
		<div className="flex flex-col justify-center absolute top-0 bottom-0 left-0 right-0 z-50 p-10 bg-black/50">
			<div className="bg-vscode-editor-background rounded-[3px] p-[12px_16px] m-[5px_15px] relative flex-shrink-0">
				<VSCodeButton
					appearance="icon"
					onClick={hideAnnouncement}
					title={t("chat:announcement.hideButton")}
					className="absolute top-2 right-2">
					<span className="codicon codicon-close"></span>
				</VSCodeButton>
				<h2 className="m-0 mb-2">{t("chat:announcement.title")}</h2>

				<p className="my-[5px]">{t("chat:announcement.description")}</p>

				<h3 className="mt-3 mb-[5px] text-sm">{t("chat:announcement.whatsNew")}</h3>
				<ul className="my-[5px]">
					<li>
						•{" "}
						<Trans
							i18nKey="chat:announcement.feature1"
							components={{
								bold: <b />,
								code: <code />,
							}}
						/>
					</li>
					<li>
						•{" "}
						<Trans
							i18nKey="chat:announcement.feature2"
							components={{
								bold: <b />,
								code: <code />,
							}}
						/>
					</li>
					<li>
						•{" "}
						<Trans
							i18nKey="chat:announcement.feature3"
							components={{
								bold: <b />,
								code: <code />,
							}}
						/>
					</li>
				</ul>

				<p className="mt-2.5 mb-0">
					<Trans
						i18nKey="chat:announcement.detailsDiscussLinks"
						components={{
							discordLink: discordLink,
							redditLink: redditLink,
						}}
					/>
				</p>
			</div>
		</div>
	)
}

export default memo(Announcement)
