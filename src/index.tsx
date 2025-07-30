/* @refresh reload */

import * as presence from "@zag-js/presence";
import { normalizeProps, useMachine } from "@zag-js/solid";
import {
	type Component,
	createMemo,
	createSignal,
	type ParentComponent,
	splitProps,
} from "solid-js";
import { render, Show } from "solid-js/web";

const Presence: ParentComponent<{
	present: boolean;
	unmountOnExit?: boolean;
	onExitComplete?: () => void;
}> = (props) => {
	const [machineProps, localProps] = splitProps(props, [
		"present",
		"unmountOnExit",
		"onExitComplete",
	]);

	const service = useMachine(presence.machine, machineProps);

	const api = createMemo(() => presence.connect(service, normalizeProps));
	const unmount = createMemo(
		() => !api().present && machineProps.unmountOnExit,
	);

	return (
		<Show when={!unmount()}>
			<div
				hidden={!api().present}
				data-state={api().skip ? undefined : api().present ? "open" : "closed"}
				// This works:
				// ref={api().setNode}

				// This does not work:
				ref={(ref) => {
					api().setNode(ref);
				}}
				style={{
					animation: `fade-${machineProps.present ? "in" : "out"} 1s forwards`,
				}}
				{...localProps}
			/>
		</Show>
	);
};

const Root: Component = () => {
	const [isPresent, setIsPresent] = createSignal(false);
	return (
		<>
			<style>
				{`
				@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
				@keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }
				`}
			</style>
			<button
				type="button"
				onClick={() => {
					setIsPresent(!isPresent());
				}}
			>
				Toggle presence
			</button>
			<Presence present={isPresent()}>Children</Presence>
		</>
	);
};

render(() => <Root />, document.getElementById("root"));
