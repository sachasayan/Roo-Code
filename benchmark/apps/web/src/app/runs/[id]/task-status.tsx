import { CircleCheck, CircleDashed, CircleSlash, LoaderCircle } from "lucide-react"

import { type Task } from "@benchmark/db"

type TaskStatusProps = {
	task: Task
	runningTaskId?: number
}

export const TaskStatus = ({ task, runningTaskId }: TaskStatusProps) => {
	return runningTaskId === task.id ? (
		<LoaderCircle className="size-4 animate-spin" />
	) : !task.finishedAt ? (
		<CircleDashed className="size-4" />
	) : task.passed === false ? (
		<CircleSlash className="size-4 text-destructive" />
	) : task.passed === true ? (
		<CircleCheck className="size-4 text-green-500" />
	) : (
		<LoaderCircle className="size-4 animate-spin" />
	)
}
