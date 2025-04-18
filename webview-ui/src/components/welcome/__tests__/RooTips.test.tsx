import { render, screen, act } from "@testing-library/react"
import RooTips from "../RooTips"
import React from "react" // Import React for JSX types

// Mock the translation hook
jest.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key, // Simple mock that returns the key
	}),
	Trans: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock VSCodeLink
jest.mock("@vscode/webview-ui-toolkit/react", () => ({
	VSCodeLink: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}))

describe("RooTips Component", () => {
	beforeEach(() => {
		jest.useFakeTimers()
	})

	afterEach(() => {
		jest.runOnlyPendingTimers()
		jest.useRealTimers()
	})

	test("renders and cycles through tips by default (cycle=true)", () => {
		render(<RooTips />)

		// Initial render (random tip) - check if one tip is rendered
		// We check for the link text pattern as the description is included
		expect(screen.getByRole("link", { name: /rooTips\..*\.title/i })).toBeInTheDocument()
		expect(screen.getAllByRole("link")).toHaveLength(1)

		// Fast-forward time to trigger the interval + fade timeout
		act(() => {
			jest.advanceTimersByTime(11000 + 1000) // interval + fade duration
		})

		// After interval, a different tip should be potentially rendered (still one tip)
		// Note: Due to random start, we can't guarantee a *different* tip if there are only 2,
		// but the core logic is that it attempts to cycle. We re-check the structure.
		expect(screen.getByRole("link", { name: /rooTips\..*\.title/i })).toBeInTheDocument()
		expect(screen.getAllByRole("link")).toHaveLength(1)
	})

	test("renders only the top two tips when cycle is false", () => {
		render(<RooTips cycle={false} />)

		// Check if the first two tips are rendered
		expect(screen.getByRole("link", { name: "rooTips.boomerangTasks.title" })).toBeInTheDocument()
		expect(screen.getByText("rooTips.boomerangTasks.description")).toBeInTheDocument()
		expect(screen.getByRole("link", { name: "rooTips.stickyModels.title" })).toBeInTheDocument()
		expect(screen.getByText("rooTips.stickyModels.description")).toBeInTheDocument()

		// Ensure only two tips are present
		expect(screen.getAllByRole("link")).toHaveLength(2)

		// Check that the third tip is not rendered
		expect(screen.queryByRole("link", { name: "rooTips.tools.title" })).not.toBeInTheDocument()

		// Fast-forward time - nothing should change
		act(() => {
			jest.advanceTimersByTime(12000)
		})

		// Verify the state remains the same (still top two tips)
		expect(screen.getByRole("link", { name: "rooTips.boomerangTasks.title" })).toBeInTheDocument()
		expect(screen.getByRole("link", { name: "rooTips.stickyModels.title" })).toBeInTheDocument()
		expect(screen.getAllByRole("link")).toHaveLength(2)
		expect(screen.queryByRole("link", { name: "rooTips.tools.title" })).not.toBeInTheDocument()
	})
})
