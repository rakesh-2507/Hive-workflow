import {
    useEffect,
    useState,
} from "react";

import {
    CheckCircle2,
    Circle,
    Clock3,
    Loader2,
    Package,
} from "lucide-react";

import {
    getAssetPurchaseTasks,
    getAssetPurchaseTracking,
} from "../../api/assetPurchase";

import type {
    AssetPurchaseTracking as AssetPurchaseTrackingData,
} from "../../api/assetPurchase";

import type {
    AssetPurchaseTaskDetails,
} from "../../types/task";

interface AssetPurchaseTrackingProps {
    /**
     * Optional single asset id.
     *
     * If supplied, only that asset is shown.
     * If omitted, all asset tasks for the logged-in user
     * are loaded.
     */
    assetId?: string;
}

const getStatusIcon = (status: string) => {
    const normalized = status
        .trim()
        .toLowerCase();

    if (
        normalized === "completed" ||
        normalized === "approved" ||
        normalized === "accepted"
    ) {
        return (
            <CheckCircle2
                size={18}
                className="text-emerald-500"
            />
        );
    }

    if (
        normalized === "in progress" ||
        normalized === "pending"
    ) {
        return (
            <Clock3
                size={18}
                className="text-amber-500"
            />
        );
    }

    return (
        <Circle
            size={18}
            className="text-gray-400"
        />
    );
};

const getStatusTextClass = (
    status: string,
) => {
    const normalized = status
        .trim()
        .toLowerCase();

    if (
        normalized === "completed" ||
        normalized === "approved" ||
        normalized === "accepted"
    ) {
        return "text-emerald-500";
    }

    if (
        normalized === "in progress" ||
        normalized === "pending"
    ) {
        return "text-amber-500";
    }

    return "text-gray-500 dark:text-gray-400";
};

const formatDate = (
    value?: string | null,
) => {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const getTaskTitle = (
    task: AssetPurchaseTaskDetails,
) => {
    if (task.document?.document_type) {
        const documentType =
            task.document.document_type;

        if (
            documentType ===
            "AssetPurchaseRequest"
        ) {
            return "Asset Purchase";
        }

        if (
            documentType ===
            "AssetRepairRequest"
        ) {
            return "Asset Repair";
        }

        return documentType;
    }

    return (
        task.task_type ||
        "Asset Task"
    );
};

interface TrackingCardProps {
    tracking: AssetPurchaseTrackingData;
    task: AssetPurchaseTaskDetails;
}

function TrackingCard({
    tracking,
    task,
}: TrackingCardProps) {
    return (
        <div className="space-y-4">

            {/* Overall status */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">

                <div className="flex items-start justify-between gap-3">

                    <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-gray-800">
                            <Package
                                size={17}
                                className="text-cyan-500"
                            />
                        </div>

                        <div className="min-w-0">

                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                {getTaskTitle(task)}
                            </p>

                            <p className="truncate text-sm font-semibold text-s">
                                {
                                    tracking
                                        .document
                                        .document_no
                                }
                            </p>

                        </div>
                    </div>

                    <span
                        className={`shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold dark:bg-gray-800 ${getStatusTextClass(
                            tracking.status_label,
                        )}`}
                    >
                        {tracking.status_label}
                    </span>

                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">

                    <div>
                        <p className="text-[10px] text-t">
                            Current Stage
                        </p>

                        <p className="mt-1 text-xs font-medium text-gray-900 dark:text-white">
                            {tracking.current_stage}
                        </p>
                    </div>

                    <div>
                        <p className="text-[10px] text-t">
                            Started
                        </p>

                        <p className="mt-1 text-xs font-medium text-gray-900 dark:text-white">
                            {formatDate(
                                tracking.start_date,
                            )}
                        </p>
                    </div>

                </div>
            </div>

            {/* Workflow timeline */}
            <div>

                <p className="mb-3 text-xs font-semibold text-s">
                    Workflow Progress
                </p>

                <div className="space-y-0">

                    {tracking.flow.map(
                        (item, index) => {
                            const isLast =
                                index ===
                                tracking.flow.length -
                                    1;

                            return (
                                <div
                                    key={`${item.stage}-${index}`}
                                    className="relative flex gap-3"
                                >

                                    {!isLast && (
                                        <div className="absolute left-[8px] top-5 h-[calc(100%-4px)] w-px bg-gray-200 dark:bg-gray-700" />
                                    )}

                                    <div className="relative z-10 shrink-0 bg-white dark:bg-gray-900">
                                        {getStatusIcon(
                                            item.status,
                                        )}
                                    </div>

                                    <div className="min-w-0 pb-5">

                                        <p className="text-xs font-medium text-gray-900 dark:text-white">
                                            {item.stage}
                                        </p>

                                        <p
                                            className={`mt-1 text-[10px] font-medium ${getStatusTextClass(
                                                item.status,
                                            )}`}
                                        >
                                            {item.status}
                                        </p>

                                    </div>

                                </div>
                            );
                        },
                    )}

                </div>
            </div>

            {/* Current assignment */}
            {tracking.assigned_to && (
                <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">

                    <p className="text-[10px] text-t">
                        Currently Assigned To
                    </p>

                    <p className="mt-1 text-xs font-semibold text-s">
                        {tracking.assigned_to.name}
                    </p>

                    <p className="mt-0.5 text-[10px] text-t">
                        {tracking.assigned_to.mtype}
                    </p>

                </div>
            )}

            {/* Quote information */}
            {tracking.quotation_count !==
                undefined && (
                <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">

                    <div className="flex items-center justify-between">

                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                            Quotations
                        </span>

                        <span className="text-xs font-semibold text-gray-900 dark:text-white">
                            {
                                tracking
                                    .quotation_count
                            }
                        </span>

                    </div>

                    {tracking.selected_quote && (
                        <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-700">

                            <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                Selected Quote
                            </p>

                            <p className="mt-1 text-xs font-semibold text-s">
                                {
                                    tracking
                                        .selected_quote
                                        .vendor_name
                                }
                            </p>

                            <div className="mt-1 flex items-center justify-between gap-2">

                                <span className="text-[10px] text-s">
                                    {
                                        tracking
                                            .selected_quote
                                            .quote_no
                                    }
                                </span>

                                <span className="text-xs font-medium text-s">
                                    {
                                        tracking
                                            .selected_quote
                                            .currency ??
                                        "INR"
                                    }{" "}
                                    {
                                        tracking
                                            .selected_quote
                                            .quoted_amount
                                            .toLocaleString(
                                                "en-IN",
                                            )
                                    }
                                </span>

                            </div>
                        </div>
                    )}

                </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3 text-[10px]">

                <div>
                    <p className="text-gray-400 dark:text-gray-500">
                        Created
                    </p>

                    <p className="mt-1 font-medium text-s">
                        {formatDate(
                            tracking.created_date,
                        )}
                    </p>
                </div>

                <div>
                    <p className="text-gray-400 dark:text-gray-500">
                        Updated
                    </p>

                    <p className="mt-1 font-medium text-s">
                        {formatDate(
                            tracking.updated_date,
                        )}
                    </p>
                </div>

            </div>

        </div>
    );
}

interface TaskTrackingState {
    task: AssetPurchaseTaskDetails;
    tracking: AssetPurchaseTrackingData;
}

export default function AssetPurchaseTracking({
    assetId,
}: AssetPurchaseTrackingProps) {
    const [items, setItems] =
        useState<TaskTrackingState[]>(
            [],
        );

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        let cancelled = false;

        const loadTracking = async () => {
            try {
                setLoading(true);
                setError("");

                /*
                 * If an assetId was supplied, preserve
                 * the existing single-asset behavior.
                 */
                if (assetId) {
                    const tracking =
                        await getAssetPurchaseTracking(
                            assetId,
                        );

                    if (!cancelled) {
                        setItems([
                            {
                                task: {
                                    task_id:
                                        tracking.task_id,

                                    wf_task_id:
                                        tracking.wf_task_id,

                                    task_type:
                                        tracking
                                            .document
                                            .document_type,

                                    task_description:
                                        tracking.message,

                                    document:
                                        {
                                            document_id: 0,
                                            document_type:
                                                tracking
                                                    .document
                                                    .document_type,

                                            document_no:
                                                tracking
                                                    .document
                                                    .document_no,

                                            request_data:
                                                {} as never,

                                            created_by:
                                                0,

                                            created_date:
                                                tracking
                                                    .created_date,

                                            updated_date:
                                                tracking
                                                    .updated_date,
                                        },

                                    status:
                                        tracking.status,

                                    assigned_by:
                                        0,

                                    assigned_to:
                                        tracking
                                            .assigned_to
                                            ?.uid ?? 0,

                                    levels: [],

                                    selected_quote_id:
                                        tracking
                                            .selected_quote_id ??
                                        null,

                                    start_date:
                                        tracking.start_date,

                                    end_date:
                                        tracking.end_date ??
                                        null,

                                    key_params:
                                        {},

                                    created_date:
                                        tracking.created_date,

                                    updated_date:
                                        tracking.updated_date,
                                },

                                tracking,
                            },
                        ]);
                    }

                    return;
                }

                /*
                 * Load all asset tasks belonging to
                 * the logged-in user.
                 */
                const response =
                    await getAssetPurchaseTasks();

                if (cancelled) {
                    return;
                }

                /*
                 * Only tasks having an asset document
                 * can be passed to the tracking endpoint.
                 *
                 * This excludes generic Writer / Author /
                 * Reviewer tasks which have document = null.
                 */
                const assetTasks =
                    response.data.filter(
                        (task) =>
                            Boolean(
                                task.document
                                    ?.document_no,
                            ),
                    );

                /*
                 * Fetch tracking for all asset tasks.
                 *
                 * Promise.allSettled is used so that one
                 * failed tracking request doesn't prevent
                 * the remaining tasks from displaying.
                 */
                const results =
                    await Promise.allSettled(
                        assetTasks.map(
                            async (task) => {
                                const documentNo =
                                    task.document
                                        ?.document_no;

                                if (
                                    !documentNo
                                ) {
                                    return null;
                                }

                                const tracking =
                                    await getAssetPurchaseTracking(
                                        documentNo,
                                    );

                                return {
                                    task,
                                    tracking,
                                };
                            },
                        ),
                    );

                if (cancelled) {
                    return;
                }

                const successfulResults =
                    results
                        .filter(
                            (
                                result,
                            ): result is PromiseFulfilledResult<TaskTrackingState> =>
                                result.status ===
                                    "fulfilled" &&
                                result.value !==
                                    null,
                        )
                        .map(
                            (result) =>
                                result.value,
                        );

                setItems(
                    successfulResults,
                );
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load asset tracking.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadTracking();

        return () => {
            cancelled = true;
        };
    }, [assetId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2
                    size={22}
                    className="animate-spin text-gray-400"
                />

                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    Loading tracking...
                </span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                {error}
            </div>
        );
    }

    if (!items.length) {
        return (
            <div className="py-8 text-center text-xs text-s">
                No tracking information available.
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {items.map(
                ({
                    task,
                    tracking,
                }) => (
                    <div
                        key={`${task.task_id}-${tracking.wf_task_id}`}
                        className="rounded-xl"
                    >
                        <TrackingCard
                            task={task}
                            tracking={tracking}
                        />
                    </div>
                ),
            )}

        </div>
    );
}
