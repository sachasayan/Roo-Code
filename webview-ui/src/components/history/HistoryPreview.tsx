import { memo } from "react"

import { vscode } from "@/utils/vscode"
import { formatLargeNumber, formatDate } from "@/utils/format"
import { Button } from "@/components/ui"

import { useAppTranslation } from "@src/i18n/TranslationContext"
import { CopyButton } from "./CopyButton"
import { useTaskSearch } from "./useTaskSearch"

import { Trans } from "react-i18next"
import { Coins } from "lucide-react"

type HistoryPreviewProps = {
	showHistoryView: () => void
}
const HistoryPreview = ({ showHistoryView }: HistoryPreviewProps) => {
	const { tasks, showAllWorkspaces } = useTaskSearch()
	const { t } = useAppTranslation()

	return (
		<>
			<div className="flex flex-col gap-3 shrink-0 mx-5">
				{tasks.length !== 0 && (
					<div className="flex items-center justify-between text-vscode-descriptionForeground  w-full mx-auto max-w-[600px]">
						<div className="flex items-center gap-1">
							<span className="codicon codicon-comment-discussion scale-90 mr-1" />
							<span className="font-medium text-xs uppercase">{t("history:recentTasks")}</span>
						</div>
						<Button variant="ghost" size="sm" onClick={() => showHistoryView()} className="uppercase">
							<span className="codicon codicon-history size-[1rem]" />
						</Button>
					</div>
				)}

				{tasks.length === 0 && (
					<>
						<p className="opacity-50 p-2 text-center my-0 mx-auto max-w-80">
							<Trans
								i18nKey="chat:onboarding"
								components={{
									DocsLink: (
										<a
											href="https://docs.roocode.com/getting-started/your-first-task"
											target="_blank"
											rel="noopener noreferrer">
											the docs
										</a>
									),
								}}
							/>
						</p>

						<Button size="sm" variant="secondary" onClick={() => showHistoryView()} className="mx-auto">
							<span className="codicon codicon-history size-[1rem]" />
							{t("history:viewAll")}
						</Button>
					</>
				)}

				{tasks.slice(0, 3).map((item) => (
					<div
						key={item.id}
						className="bg-vscode-editor-background rounded relative overflow-hidden cursor-pointer border border-vscode-toolbar-hoverBackground/30 hover:border-vscode-toolbar-hoverBackground/60"
						onClick={() => vscode.postMessage({ type: "showTaskWithId", text: item.id })}>
						<div className="flex flex-col gap-2 p-3 pt-1">
							<div className="flex justify-between items-center">
								<span className="text-xs font-medium text-vscode-descriptionForeground uppercase">
									{formatDate(item.ts)}
								</span>
								<CopyButton itemTask={item.task} />
							</div>
							<div
								className="text-vscode-foreground overflow-hidden whitespace-pre-wrap"
								style={{
									display: "-webkit-box",
									WebkitLineClamp: 2,
									WebkitBoxOrient: "vertical",
									wordBreak: "break-word",
									overflowWrap: "anywhere",
								}}>
								{item.task}
							</div>
							<div className="flex flex-row gap-2 text-xs text-vscode-descriptionForeground">
								<span>↑ {formatLargeNumber(item.tokensIn || 0)}</span>
								<span>↓ {formatLargeNumber(item.tokensOut || 0)}</span>
								{!!item.totalCost && (
									<span>
										<Coins className="inline-block size-[1em]" /> {"$" + item.totalCost?.toFixed(2)}
									</span>
								)}
							</div>
							{showAllWorkspaces && item.workspace && (
								<div className="flex flex-row gap-1 text-vscode-descriptionForeground text-xs mt-1">
									<span className="codicon codicon-folder scale-80" />
									<span>{item.workspace}</span>
								</div>
							)}
						</div>
					</div>
				))}
			</div>
		</>
	)
}

export default memo(HistoryPreview)
