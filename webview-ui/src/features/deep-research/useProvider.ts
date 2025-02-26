import { useCallback, useMemo } from "react"

import { ApiConfiguration } from "../../../../src/shared/api"

import { useExtensionState } from "@/context/ExtensionStateContext"
import { vscode } from "@/utils/vscode"

import { Provider, ProviderMetadata, isProvider, ProviderId } from "./types"

type ConfigurationKey = keyof ApiConfiguration
type ConfigurationValue<K extends ConfigurationKey> = ApiConfiguration[K]

type UseProvider = {
	provider?: Provider
	providers: ProviderMetadata[]
	setProvider: (provider: Provider) => void
	setProviderValue: <K extends ConfigurationKey>(key: K, value: ConfigurationValue<K>) => void
}

export const useProvider = (): UseProvider => {
	const { currentApiConfigName, apiConfiguration, listApiConfigMeta } = useExtensionState()

	const providers = useMemo(
		() =>
			listApiConfigMeta
				?.filter((config) => isProvider(config.apiProvider ?? ""))
				.map((p) => ({
					profileId: p.id,
					profileName: p.name,
					providerId: p.apiProvider as ProviderId,
					providerName: p.apiProvider === ProviderId.OpenRouter ? "OpenRouter" : "OpenAI",
				})) ?? [],
		[listApiConfigMeta],
	)

	const provider = useMemo(() => {
		if (
			!apiConfiguration?.apiProvider ||
			!isProvider(apiConfiguration?.apiProvider) ||
			!currentApiConfigName ||
			!listApiConfigMeta
		) {
			return undefined
		}

		const matchedProvider = providers.find(
			({ profileName, providerId }) =>
				profileName === currentApiConfigName && providerId === apiConfiguration.apiProvider,
		)

		if (!matchedProvider) {
			return undefined
		}

		const { openRouterApiKey, openAiNativeApiKey, firecrawlApiKey } = apiConfiguration

		return {
			...matchedProvider,
			providerApiKey:
				matchedProvider.providerId === ProviderId.OpenRouter ? openRouterApiKey : openAiNativeApiKey,
			firecrawlApiKey,
		}
	}, [apiConfiguration, currentApiConfigName, listApiConfigMeta, providers])

	const setProvider = useCallback(
		({ profileName }: ProviderMetadata) => vscode.postMessage({ type: "loadApiConfiguration", text: profileName }),
		[],
	)

	const setProviderValue = useCallback(
		<K extends keyof ApiConfiguration>(key: K, value: ApiConfiguration[K]) => {
			vscode.postMessage({
				type: "upsertApiConfiguration",
				text: currentApiConfigName,
				apiConfiguration: { ...apiConfiguration, [key]: value },
			})
		},
		[currentApiConfigName, apiConfiguration],
	)

	return { provider, providers, setProvider, setProviderValue }
}
