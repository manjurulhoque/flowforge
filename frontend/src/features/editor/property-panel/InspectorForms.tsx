import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Plus, Trash2 } from "lucide-react";
import { Input, Label, Select, Switch } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { useEditorStore } from "@/store/editorStore";
import { uid } from "@/utils/factory";
import type { ArchNode, EnvVar, NodeStatus } from "@/types";

const PALETTE = [
	"#5b6578",
	"#6d8a72",
	"#94856f",
	"#7d6e82",
	"#6b7c94",
	"#8e7887",
	"#9a8b6e",
	"#6e8488",
];

function Field({
	label,
	error,
	children,
}: {
	label: string;
	error?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-1.5">
			<Label>{label}</Label>
			{children}
			{error && <p className="text-[11px] text-red-500">{error}</p>}
		</div>
	);
}

/* --------------------------- General --------------------------- */

const generalSchema = z.object({
	label: z.string().min(1, "Name is required").max(48),
	description: z.string().max(240),
	status: z.enum(["healthy", "warning", "error", "unknown"]),
	color: z.string(),
});
type GeneralValues = z.infer<typeof generalSchema>;

export function GeneralForm({ node }: { node: ArchNode }) {
	const updateNodeData = useEditorStore((s) => s.updateNodeData);
	const {
		register,
		handleSubmit,
		reset,
		watch,
		setValue,
		formState: { errors },
	} = useForm<GeneralValues>({
		resolver: zodResolver(generalSchema),
		defaultValues: {
			label: node.data.label,
			description: node.data.description,
			status: node.data.status,
			color: node.data.color,
		},
	});

	useEffect(() => {
		reset({
			label: node.data.label,
			description: node.data.description,
			status: node.data.status,
			color: node.data.color,
		});
	}, [node.id, node.data, reset]);

	const save = handleSubmit((v) => updateNodeData(node.id, v));
	const color = watch("color");

	function addTag(value: string) {
		const t = value.trim();
		if (!t || node.data.tags.includes(t)) return;
		updateNodeData(node.id, { tags: [...node.data.tags, t] });
	}
	function removeTag(t: string) {
		updateNodeData(node.id, {
			tags: node.data.tags.filter((x) => x !== t),
		});
	}

	return (
		<div className="space-y-4">
			<Field label="Name" error={errors.label?.message}>
				<Input {...register("label")} onBlur={save} />
			</Field>
			<Field label="Description" error={errors.description?.message}>
				<textarea
					{...register("description")}
					onBlur={save}
					rows={3}
					className="w-full resize-none rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm text-zinc-800 focus:border-[#ff6a2b] focus:outline-none"
				/>
			</Field>
			<Field label="Status">
				<Select
					{...register("status")}
					onChange={(e) => {
						setValue("status", e.target.value as NodeStatus);
						save();
					}}
				>
					<option value="healthy">Healthy</option>
					<option value="warning">Degraded</option>
					<option value="error">Unhealthy</option>
					<option value="unknown">Unknown</option>
				</Select>
			</Field>
			<Field label="Accent color">
				<div className="flex flex-wrap gap-2">
					{PALETTE.map((c) => (
						<button
							key={c}
							type="button"
							onClick={() => {
								setValue("color", c);
								updateNodeData(node.id, { color: c });
							}}
							className="h-6 w-6 rounded-md ring-offset-2 ring-offset-white transition-transform hover:scale-110"
							style={{
								backgroundColor: c,
								boxShadow:
									color === c ? `0 0 0 2px ${c}` : undefined,
							}}
							aria-label={`Color ${c}`}
						/>
					))}
				</div>
			</Field>
			<Field label="Tags">
				<div className="flex flex-wrap gap-1.5">
					{node.data.tags.map((t) => (
						<span
							key={t}
							className="flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-1 text-[11px] text-zinc-600"
						>
							{t}
							<button
								onClick={() => removeTag(t)}
								aria-label={`Remove ${t}`}
							>
								<X className="h-3 w-3 text-zinc-400 hover:text-zinc-700" />
							</button>
						</span>
					))}
				</div>
				<Input
					placeholder="Add tag and press Enter"
					className="mt-2 h-8"
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							addTag((e.target as HTMLInputElement).value);
							(e.target as HTMLInputElement).value = "";
						}
					}}
				/>
			</Field>
		</div>
	);
}

/* --------------------------- Configuration --------------------------- */

const configSchema = z.object({
	language: z.string(),
	framework: z.string(),
	port: z.number().int().min(1, "1–65535").max(65535, "1–65535"),
	replicas: z.number().int().min(0).max(100),
	cpu: z.string(),
	memory: z.string(),
	healthEndpoint: z.string().startsWith("/", "Must start with /"),
	autoscaling: z.boolean(),
	minReplicas: z.number().int().min(1),
	maxReplicas: z.number().int().min(1),
});
type ConfigValues = z.infer<typeof configSchema>;

export function ConfigForm({ node }: { node: ArchNode }) {
	const updateNodeData = useEditorStore((s) => s.updateNodeData);
	const {
		register,
		handleSubmit,
		reset,
		watch,
		setValue,
		formState: { errors },
	} = useForm<ConfigValues>({
		resolver: zodResolver(configSchema),
		defaultValues: node.data.config,
	});

	useEffect(() => {
		reset(node.data.config);
	}, [node.id, node.data.config, reset]);

	const save = handleSubmit((v) =>
		updateNodeData(node.id, { config: { ...node.data.config, ...v } }),
	);
	const autoscaling = watch("autoscaling");

	function updateEnv(env: EnvVar[]) {
		updateNodeData(node.id, { config: { ...node.data.config, env } });
	}

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 gap-3">
				<Field label="Language">
					<Input {...register("language")} onBlur={save} />
				</Field>
				<Field label="Framework">
					<Input {...register("framework")} onBlur={save} />
				</Field>
			</div>
			<div className="grid grid-cols-2 gap-3">
				<Field label="Port" error={errors.port?.message}>
					<Input
						type="number"
						{...register("port", { valueAsNumber: true })}
						onBlur={save}
					/>
				</Field>
				<Field label="Replicas" error={errors.replicas?.message}>
					<Input
						type="number"
						{...register("replicas", { valueAsNumber: true })}
						onBlur={save}
					/>
				</Field>
			</div>
			<div className="grid grid-cols-2 gap-3">
				<Field label="CPU">
					<Input {...register("cpu")} onBlur={save} />
				</Field>
				<Field label="Memory">
					<Input {...register("memory")} onBlur={save} />
				</Field>
			</div>
			<Field
				label="Health endpoint"
				error={errors.healthEndpoint?.message}
			>
				<Input {...register("healthEndpoint")} onBlur={save} />
			</Field>

			<div className="rounded-lg border border-zinc-200 p-3">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-[13px] font-medium text-zinc-800">
							Autoscaling
						</p>
						<p className="text-[11px] text-zinc-400">
							Horizontal pod autoscaler
						</p>
					</div>
					<Switch
						checked={autoscaling}
						onCheckedChange={(v) => {
							setValue("autoscaling", v);
							save();
						}}
					/>
				</div>
				{autoscaling && (
					<div className="mt-3 grid grid-cols-2 gap-3">
						<Field label="Min replicas">
							<Input
								type="number"
								{...register("minReplicas", {
									valueAsNumber: true,
								})}
								onBlur={save}
							/>
						</Field>
						<Field label="Max replicas">
							<Input
								type="number"
								{...register("maxReplicas", {
									valueAsNumber: true,
								})}
								onBlur={save}
							/>
						</Field>
					</div>
				)}
			</div>

			<div>
				<div className="mb-2 flex items-center justify-between">
					<Label>Environment & Secrets</Label>
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={() =>
							updateEnv([
								...node.data.config.env,
								{
									id: uid("env"),
									key: "",
									value: "",
									secret: false,
								},
							])
						}
						aria-label="Add variable"
					>
						<Plus className="h-4 w-4" />
					</Button>
				</div>
				<div className="space-y-2">
					{node.data.config.env.length === 0 && (
						<p className="rounded-lg border border-dashed border-zinc-200 py-3 text-center text-[11px] text-zinc-400">
							No variables defined
						</p>
					)}
					{node.data.config.env.map((v) => (
						<div key={v.id} className="flex items-center gap-1.5">
							<Input
								defaultValue={v.key}
								placeholder="KEY"
								className="h-8 flex-1 font-mono text-[11px]"
								onBlur={(e) =>
									updateEnv(
										node.data.config.env.map((x) =>
											x.id === v.id
												? { ...x, key: e.target.value }
												: x,
										),
									)
								}
							/>
							<Input
								defaultValue={v.value}
								placeholder={v.secret ? "••••••" : "value"}
								type={v.secret ? "password" : "text"}
								className="h-8 flex-1 font-mono text-[11px]"
								onBlur={(e) =>
									updateEnv(
										node.data.config.env.map((x) =>
											x.id === v.id
												? {
														...x,
														value: e.target.value,
													}
												: x,
										),
									)
								}
							/>
							<button
								onClick={() =>
									updateEnv(
										node.data.config.env.map((x) =>
											x.id === v.id
												? { ...x, secret: !x.secret }
												: x,
										),
									)
								}
								className={`rounded px-1.5 py-1 text-[9px] font-semibold ${v.secret ? "bg-zinc-200 text-zinc-600" : "bg-zinc-100 text-zinc-400"}`}
								title="Toggle secret"
							>
								SEC
							</button>
							<button
								onClick={() =>
									updateEnv(
										node.data.config.env.filter(
											(x) => x.id !== v.id,
										),
									)
								}
								aria-label="Remove"
							>
								<Trash2 className="h-3.5 w-3.5 text-zinc-400 hover:text-red-500" />
							</button>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
