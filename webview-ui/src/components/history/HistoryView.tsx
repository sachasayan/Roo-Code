import React, { memo, useState } from "react"
import { DeleteTaskDialog } from "./DeleteTaskDialog"
import { BatchDeleteTaskDialog } from "./BatchDeleteTaskDialog"
import prettyBytes from "pretty-bytes"
import { Virtuoso } from "react-virtuoso"

import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"

import { vscode } from "@/utils/vscode"
import { formatLargeNumber, formatDate } from "@/utils/format"
import { cn } from "@/lib/utils"
import { Button, Checkbox } from "@/components/ui"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { useAppTranslation } from "@/i18n/TranslationContext"

import { Tab, TabContent, TabHeader } from "../common/Tab"
import { useTaskSearch } from "./useTaskSearch"
import { ExportButton } from "./ExportButton"
import { CopyButton } from "./CopyButton"

type HistoryViewProps = {
	onDone: () => void
}

type SortOption = "newest" | "oldest" | "mostExpensive" | "mostTokens" | "mostRelevant"

const HistoryView = ({ onDone }: HistoryViewProps) => {
	const {
		tasks,
		searchQuery,
		setSearchQuery,
		sortOption,
		setSortOption,
		setLastNonRelevantSort,
		showAllWorkspaces,
		setShowAllWorkspaces,
	} = useTaskSearch()
	const { t } = useAppTranslation()

	const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null)
	const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
	const [showBatchDeleteDialog, setShowBatchDeleteDialog] = useState<boolean>(false)

	// Toggle selection for a single task
	const toggleTaskSelection = (taskId: string, isSelected: boolean) => {
		if (isSelected) {
			setSelectedTaskIds((prev) => [...prev, taskId])
		} else {
			setSelectedTaskIds((prev) => prev.filter((id) => id !== taskId))
		}
	}

	// Toggle select all tasks
	const toggleSelectAll = (selectAll: boolean) => {
		if (selectAll) {
			setSelectedTaskIds(tasks.map((task) => task.id))
		} else {
			setSelectedTaskIds([])
		}
	}

	// Handle batch delete button click
	const handleBatchDelete = () => {
		if (selectedTaskIds.length > 0) {
			setShowBatchDeleteDialog(true)
		}
	}

	const sortOptionsData: { value: SortOption; label: string; icon: string; disabled?: boolean }[] = [
		{ value: "newest", label: t("history:newest"), icon: "codicon-arrow-down" },
		{ value: "oldest", label: t("history:oldest"), icon: "codicon-arrow-up" },
		{ value: "mostExpensive", label: t("history:mostExpensive"), icon: "codicon-dashboard" },
		{ value: "mostTokens", label: t("history:mostTokens"), icon: "codicon-symbol-numeric" },
		{ value: "mostRelevant", label: t("history:mostRelevant"), icon: "codicon-search", disabled: !searchQuery },
	]

	const selectedSortLabel = sortOptionsData.find((opt) => opt.value === sortOption)?.label

	return (
		<Tab>
			<TabHeader className="flex flex-col gap-4">
				<div className="flex justify-between items-center">
					<h3 className="text-vscode-foreground m-0">{t("history:history")}</h3>
					<div className="flex gap-2">
						<Button
							variant="outline" // Keep outline variant
							// size="icon" // Remove icon size to allow text
							onClick={onDone}
							title={t("history:done")}>
							<span className="codicon codicon-close mr-1" /> {/* Keep icon, add margin */}
							{t("history:done")} {/* Add text back */}
						</Button>
					</div>
				</div>
				<div className="flex flex-col gap-4">
					<VSCodeTextField
						style={{ width: "100%" }}
						placeholder={t("history:searchPlaceholder")}
						value={searchQuery}
						data-testid="history-search-input"
						onInput={(e) => {
							const newValue = (e.target as HTMLInputElement)?.value
							setSearchQuery(newValue)
							if (newValue && !searchQuery && sortOption !== "mostRelevant") {
								setLastNonRelevantSort(sortOption)
								setSortOption("mostRelevant")
							}
						}}>
						<div
							slot="start"
							className="codicon codicon-search"
							style={{ fontSize: 13, marginTop: 2.5, opacity: 0.8 }}
						/>
						{searchQuery && (
							<div
								className="input-icon-button codicon codicon-close"
								aria-label="Clear search"
								onClick={() => setSearchQuery("")}
								slot="end"
								style={{
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									height: "100%",
								}}
							/>
						)}
					</VSCodeTextField>
					<div className="flex justify-between items-center gap-4">
						<div className="flex items-center gap-2 flex-shrink-0">
							<Checkbox
								id="show-all-workspaces-view"
								checked={showAllWorkspaces}
								onCheckedChange={(checked) => setShowAllWorkspaces(checked === true)}
								variant="description"
							/>
							<label htmlFor="show-all-workspaces-view" className="text-vscode-foreground cursor-pointer">
								{t("history:showAllWorkspaces")}
							</label>
						</div>

						<div className="flex-grow min-w-[180px]">
							<Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
								<SelectTrigger className="w-full" data-testid="history-sort-trigger">
									<span>Sort: {selectedSortLabel ?? t("history:sortByPlaceholder")}</span>
								</SelectTrigger>
								<SelectContent>
									{sortOptionsData.map((option) => (
										<SelectItem
											key={option.value}
											value={option.value}
											disabled={option.disabled}
											data-testid={`history-sort-item-${option.value}`}>
											<div className="flex items-center gap-2">
												<span className={`codicon ${option.icon}`} />
												<span>{option.label}</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{tasks.length > 0 && (
						<div className="flex items-center">
							<div className="flex items-center gap-2 flex-grow">
								<Checkbox
									checked={tasks.length > 0 && selectedTaskIds.length === tasks.length}
									onCheckedChange={(checked) => toggleSelectAll(checked === true)}
									variant="description"
								/>
								<span className="text-vscode-foreground">
									{selectedTaskIds.length === tasks.length
										? t("history:deselectAll")
										: t("history:selectAll")}
								</span>
							</div>
						</div>
					)}
				</div>
			</TabHeader>

			<TabContent className="p-0">
				<Virtuoso
					style={{
						flexGrow: 1,
						overflowY: "scroll",
					}}
					data={tasks}
					data-testid="virtuoso-container"
					initialTopMostItemIndex={0}
					components={{
						List: React.forwardRef((props, ref) => (
							<div {...props} ref={ref} data-testid="virtuoso-item-list" />
						)),
					}}
					itemContent={(index, item) => (
						<div
							data-testid={`task-item-${item.id}`}
							key={item.id}
							className={cn("group relative cursor-pointer", {
								"border-b border-vscode-panel-border": index < tasks.length - 1,
								"bg-vscode-list-activeSelectionBackground": selectedTaskIds.includes(item.id),
							})}
							onClick={() => {
								toggleTaskSelection(item.id, !selectedTaskIds.includes(item.id))
							}}>
							<div className="flex items-stretch gap-6">
								<div className="flex-1 min-w-0 p-6 pr-0">
									<div className="flex justify-between items-center mb-2">
										<span className="text-vscode-descriptionForeground font-medium text-sm uppercase">
											{formatDate(item.ts)}
										</span>
									</div>
									<div
										style={{
											fontSize: "var(--vscode-font-size)",
											color: "var(--vscode-foreground)",
											display: "-webkit-box",
											WebkitLineClamp: 3,
											WebkitBoxOrient: "vertical",
											overflow: "hidden",
											whiteSpace: "pre-wrap",
											wordBreak: "break-word",
											overflowWrap: "anywhere",
										}}
										data-testid="task-content"
										dangerouslySetInnerHTML={{ __html: item.task }}
									/>
									<div className="flex flex-col gap-2 mt-2 text-xs text-vscode-descriptionForeground">
										<div className="flex items-center flex-wrap gap-x-4 gap-y-1">
											<div className="flex items-center gap-1 flex-wrap">
												<span
													data-testid="tokens-in"
													className="flex items-center gap-1"
													title={t("history:tokensInTitle")}>
													<i
														className="codicon codicon-arrow-up"
														style={{ fontSize: "12px", fontWeight: "bold" }}
													/>
													{formatLargeNumber(item.tokensIn || 0)}
												</span>
												<span
													data-testid="tokens-out"
													className="flex items-center gap-1"
													title={t("history:tokensOutTitle")}>
													<i
														className="codicon codicon-arrow-down"
														style={{ fontSize: "12px", fontWeight: "bold" }}
													/>
													{formatLargeNumber(item.tokensOut || 0)}
												</span>
											</div>
											{!!item.totalCost && (
												<div
													className="flex items-center gap-1"
													data-testid="cost-container"
													title={t("history:apiCostLabel")}>
													<i className="codicon codicon-credit-card" />
													<span>${item.totalCost?.toFixed(2)}</span>
												</div>
											)}
											{!!item.size && (
												<div
													className="flex items-center gap-1"
													data-testid="size-container"
													title={t("history:fileSizeTitle")}>
													<i className="codicon codicon-file-binary" />
													<span>{prettyBytes(item.size)}</span>
												</div>
											)}
										</div>

										{!!item.cacheWrites && (
											<div
												data-testid="cache-container"
												style={{
													display: "flex",
													alignItems: "center",
													gap: "4px",
													flexWrap: "wrap",
												}}>
												<span
													style={{
														fontWeight: 500,
														color: "var(--vscode-descriptionForeground)",
													}}>
													{t("history:cacheLabel")}
												</span>
												<span
													data-testid="cache-writes"
													style={{
														display: "flex",
														alignItems: "center",
														gap: "3px",
														color: "var(--vscode-descriptionForeground)",
													}}>
													<i
														className="codicon codicon-database"
														style={{
															fontSize: "12px",
															fontWeight: "bold",
															marginBottom: "-1px",
														}}
													/>
													+{formatLargeNumber(item.cacheWrites || 0)}
												</span>
												<span
													data-testid="cache-reads"
													style={{
														display: "flex",
														alignItems: "center",
														gap: "3px",
														color: "var(--vscode-descriptionForeground)",
													}}>
													<i
														className="codicon codicon-arrow-right"
														style={{
															fontSize: "12px",
															fontWeight: "bold",
															marginBottom: 0,
														}}
													/>
													{formatLargeNumber(item.cacheReads || 0)}
												</span>
											</div>
										)}

										{showAllWorkspaces && item.workspace && (
											<div className="flex flex-row gap-1 text-vscode-descriptionForeground text-xs items-center">
												<span className="codicon codicon-folder" />
												<span>{item.workspace}</span>
											</div>
										)}
									</div>
								</div>

								<div
									className={cn(
										"flex items-center gap-0 transition-opacity duration-100",
										selectedTaskIds.includes(item.id)
											? "opacity-100"
											: "opacity-0 group-hover:opacity-100",
									)}>
									<Button
										variant="ghost"
										size="icon"
										title={t("history:deleteTaskTitle")}
										data-testid="delete-task-button"
										onClick={(e) => {
											e.stopPropagation()
											if (e.shiftKey) {
												vscode.postMessage({ type: "deleteTaskWithId", text: item.id })
											} else {
												setDeleteTaskId(item.id)
											}
										}}>
										<span className="codicon codicon-trash" />
									</Button>
									<div onClick={(e) => e.stopPropagation()}>
										<CopyButton itemTask={item.task} />
									</div>
									<div onClick={(e) => e.stopPropagation()}>
										<ExportButton itemId={item.id} />
									</div>
								</div>

								<div className="relative">
									<Button
										variant="ghost"
										className={cn(
											"h-full px-3",
											"flex items-center justify-center",
											{
												"hover:bg-vscode-list-activeSelectionForeground/10":
													selectedTaskIds.includes(item.id),
											},
											"focus-visible:ring-0 focus-visible:ring-offset-0",
										)}
										title={t("history:showTaskDetails")}
										onClick={(e) => {
											e.stopPropagation()
											vscode.postMessage({ type: "showTaskWithId", text: item.id })
										}}>
										<span className="codicon codicon-chevron-right" />
									</Button>
								</div>
							</div>
						</div>
					)}
				/>
			</TabContent>

			{selectedTaskIds.length > 0 && (
				<div className="fixed bottom-0 left-0 right-0 bg-vscode-editor-background border-t border-vscode-panel-border p-4 flex justify-between items-center">
					<div className="text-vscode-foreground">
						{t("history:selectedItems", { selected: selectedTaskIds.length, total: tasks.length })}
					</div>
					<div className="flex gap-2">
						<Button variant="secondary" onClick={() => setSelectedTaskIds([])}>
							{t("history:clearSelection")}
						</Button>
						<Button variant="default" onClick={handleBatchDelete}>
							{t("history:deleteSelected")}
						</Button>
					</div>
				</div>
			)}

			{deleteTaskId && (
				<DeleteTaskDialog taskId={deleteTaskId} onOpenChange={(open) => !open && setDeleteTaskId(null)} open />
			)}

			{showBatchDeleteDialog && (
				<BatchDeleteTaskDialog
					taskIds={selectedTaskIds}
					open={showBatchDeleteDialog}
					onOpenChange={(open) => {
						if (!open) {
							setShowBatchDeleteDialog(false)
							setSelectedTaskIds([])
						}
					}}
				/>
			)}
		</Tab>
	)
}

export default memo(HistoryView)
