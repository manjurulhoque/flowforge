"use client";

import { use } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

function EditorLoading() {
	return (
		<div className="flex h-screen items-center justify-center bg-zinc-50 text-zinc-500">
			<Loader2 className="h-5 w-5 animate-spin" />
		</div>
	);
}

const EditorPage = dynamic(
	() => import("@/features/editor/EditorPage").then((m) => m.EditorPage),
	{ ssr: false, loading: () => <EditorLoading /> },
);

export default function ProjectEditorPage({
	params,
}: {
	params: Promise<{ projectId: string }>;
}) {
	const { projectId } = use(params);
	return <EditorPage projectId={projectId} />;
}
