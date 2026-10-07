import {
    useEffect,
    useState,
} from "react";

import {
    CalendarDays,
    FileUp,
    Package,
    Plus,
    Send,
    Trash2,
    X,
} from "lucide-react";

import { getProcessList } from "../../api/process";

import type { ProcessListItem } from "../../types/process";

import {
    createAssetPurchaseRequest,
} from "../../api/assetPurchase";

type ParameterType =
    | "text"
    | "textarea"
    | "number"
    | "date";

interface RequestParameter {
    id: string;
    name: string;
    type: ParameterType;
    value: string;
    required: boolean;
}

interface Props {
    onSuccess?: (
        response: Awaited<
            ReturnType<typeof createAssetPurchaseRequest>
        >
    ) => void;
}

const createParameter = (): RequestParameter => ({
    id: crypto.randomUUID(),
    name: "",
    type: "text",
    value: "",
    required: false,
});

function AssetPurchaseRequestForm({
    onSuccess,
}: Props) {
    const [parameters, setParameters] = useState<
        RequestParameter[]
    >([]);

    const [referenceFile, setReferenceFile] =
        useState<File | null>(null);

    const [processId, setProcessId] =
        useState<number | "">("");

    const [processes, setProcesses] =
        useState<ProcessListItem[]>([]);

    const [isLoadingProcesses, setIsLoadingProcesses] =
        useState(false);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] =
        useState("");

    /*
     * ============================================================
     * LOAD PROCESS LIST
     * ============================================================
     */
    useEffect(() => {
        const loadProcesses = async () => {
            setIsLoadingProcesses(true);

            try {
                const response = await getProcessList();

                if (response.success === false) {
                    throw new Error(
                        "Failed to load process list."
                    );
                }

                setProcesses(response.data ?? []);
            } catch (err: unknown) {
                console.error(
                    "Failed to load processes:",
                    err
                );

                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError(
                        "Failed to load process list."
                    );
                }
            } finally {
                setIsLoadingProcesses(false);
            }
        };

        void loadProcesses();
    }, []);

    /*
     * ============================================================
     * ADD PARAMETER
     * ============================================================
     */
    const addParameter = () => {
        setParameters((prev) => [
            ...prev,
            createParameter(),
        ]);

        setError("");
        setSuccessMessage("");
    };

    /*
     * ============================================================
     * REMOVE PARAMETER
     * ============================================================
     */
    const removeParameter = (id: string) => {
        setParameters((prev) =>
            prev.filter(
                (parameter) =>
                    parameter.id !== id
            )
        );

        setError("");
        setSuccessMessage("");
    };

    /*
     * ============================================================
     * UPDATE PARAMETER
     * ============================================================
     */
    const updateParameter = (
        id: string,
        field: keyof RequestParameter,
        value: string | boolean
    ) => {
        setParameters((prev) =>
            prev.map((parameter) =>
                parameter.id === id
                    ? {
                        ...parameter,
                        [field]: value,
                    }
                    : parameter
            )
        );

        setError("");
        setSuccessMessage("");
    };

    /*
     * ============================================================
     * FILE CHANGE
     * ============================================================
     */
    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file =
            e.target.files?.[0] ?? null;

        setReferenceFile(file);
        setError("");
        setSuccessMessage("");
    };

    /*
     * ============================================================
     * REMOVE FILE
     * ============================================================
     */
    const removeFile = () => {
        setReferenceFile(null);

        const fileInput =
            document.getElementById(
                "reference_file"
            ) as HTMLInputElement | null;

        if (fileInput) {
            fileInput.value = "";
        }

        setError("");
        setSuccessMessage("");
    };

    /*
     * ============================================================
     * SUBMIT
     * ============================================================
     */
    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setError("");
        setSuccessMessage("");


        /*
         * Validate process.
         */
        if (processId === "") {
            setError(
                "Please select a process."
            );
            return;
        }

        /*
         * Validate parameters.
         */
        if (parameters.length === 0) {
            setError(
                "Please add at least one request parameter."
            );
            return;
        }

        /*
         * Validate parameter names.
         */
        const hasEmptyName =
            parameters.some(
                (parameter) =>
                    !parameter.name.trim()
            );

        if (hasEmptyName) {
            setError(
                "Please enter a parameter name for every parameter."
            );
            return;
        }

        /*
         * Check duplicate parameter names.
         */
        const parameterNames =
            parameters.map((parameter) =>
                parameter.name
                    .trim()
                    .toLowerCase()
            );

        const hasDuplicateNames =
            new Set(parameterNames).size !==
            parameterNames.length;

        if (hasDuplicateNames) {
            setError(
                "Parameter names must be unique."
            );
            return;
        }

        /*
         * Check required parameter values.
         */
        const missingRequiredValue =
            parameters.some(
                (parameter) =>
                    parameter.required &&
                    !parameter.value.trim()
            );

        if (missingRequiredValue) {
            setError(
                "Please fill in all required parameters."
            );
            return;
        }

        setIsSubmitting(true);

        try {
            /*
             * Convert dynamic parameters into
             * request_data.
             *
             * Example:
             *
             * {
             *     asset_name: "Dell Laptop",
             *     asset_type: "Laptop",
             *     quantity: "2"
             * }
             */
            const requestData =
                parameters.reduce<
                    Record<string, string>
                >((data, parameter) => {
                    data[
                        parameter.name.trim()
                    ] =
                        parameter.value.trim();

                    return data;
                }, {});

            /*
             * Create asset purchase request.
             *
             * Multipart form data:
             *
             * request_type
             * process_id
             * request_data
             * reference_file
             */
            const response =
                await createAssetPurchaseRequest(
                    processId,
                    requestData,
                    referenceFile
                );

            setSuccessMessage(
                response.message ||
                "Asset Request created successfully."
            );

            onSuccess?.(response);

            /*
             * Clear parameter and file fields
             * after successful creation.
             *
             * Keep request type and process selected
             * so the user can create another request
             * using the same workflow configuration.
             */
            setParameters([]);
            setReferenceFile(null);

            const fileInput =
                document.getElementById(
                    "reference_file"
                ) as HTMLInputElement | null;

            if (fileInput) {
                fileInput.value = "";
            }
        } catch (err: unknown) {
            console.error(
                "Asset request error:",
                err
            );

            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(
                    "Failed to create asset request."
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    /*
     * ============================================================
     * RESET
     * ============================================================
     */
    const handleReset = () => {
        setParameters([]);
        setReferenceFile(null);
        setProcessId("");
        setError("");
        setSuccessMessage("");

        const fileInput =
            document.getElementById(
                "reference_file"
            ) as HTMLInputElement | null;

        if (fileInput) {
            fileInput.value = "";
        }
    };

    return (
        <div className="w-full">
            {/* =====================================================
                HEADER
            ====================================================== */}
            <div className="mb-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Package
                            size={20}
                            className="text-blue-600 dark:text-blue-400"
                        />
                    </div>

                    <div>
                        <h1 className="text-xl font-semibold text-s">
                            Asset Request
                        </h1>

                        <p className="text-sm text-t">
                            Select the request type and
                            workflow process, then add
                            your request parameters.
                        </p>
                    </div>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
                <div className="space-y-6 p-6">
                    {/* =================================================
                        REQUEST CONFIGURATION
                    ================================================== */}
                    <div>
                        <div className="mb-4">
                            <h2 className="text-sm font-semibold text-s">
                                Request Configuration
                            </h2>

                            <p className="mt-1 text-xs text-t">
                                Select the request type and
                                workflow process.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="process_id"
                                    className="mb-2 block text-sm font-medium text-s"
                                >
                                    Process
                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>
                                </label>

                                <select
                                    id="process_id"
                                    value={
                                        processId === ""
                                            ? ""
                                            : String(
                                                processId
                                            )
                                    }
                                    onChange={(e) => {
                                        const value =
                                            e.target.value;

                                        setProcessId(
                                            value === ""
                                                ? ""
                                                : Number(
                                                    value
                                                )
                                        );

                                        setError("");
                                        setSuccessMessage("");
                                    }}
                                    disabled={
                                        isSubmitting ||
                                        isLoadingProcesses
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-s outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-900"
                                >
                                    <option value="">
                                        {isLoadingProcesses
                                            ? "Loading processes..."
                                            : "Select process"}
                                    </option>

                                    {processes.map(
                                        (process) => (
                                            <option
                                                key={
                                                    process.Processid
                                                }
                                                value={
                                                    process.Processid
                                                }
                                            >
                                                {
                                                    process.ProcessName
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        DYNAMIC PARAMETERS
                    ================================================== */}
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-semibold text-s">
                                    Request Parameters
                                </h2>

                                <p className="mt-1 text-xs text-t">
                                    Add the information required
                                    for this purchase request.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={addParameter}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Plus size={16} />
                                Add Parameter
                            </button>
                        </div>

                        {parameters.length === 0 ? (
                            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center dark:border-gray-600 dark:bg-gray-900/50">
                                <Package
                                    size={30}
                                    className="mx-auto mb-3 text-gray-400"
                                />

                                <p className="text-sm font-medium text-s">
                                    No parameters added
                                </p>

                                <p className="mt-1 text-xs text-t">
                                    Click "Add Parameter" to
                                    define the information
                                    required for this request.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                                {/* Table Header */}
                                <div className="hidden grid-cols-[minmax(180px,1.5fr)_160px_minmax(180px,2fr)_100px_48px] gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3 md:grid dark:border-gray-700 dark:bg-gray-900/70">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-t">
                                        Parameter Name
                                    </div>

                                    <div className="text-xs font-semibold uppercase tracking-wide text-t">
                                        Type
                                    </div>

                                    <div className="text-xs font-semibold uppercase tracking-wide text-t">
                                        Value
                                    </div>

                                    <div className="text-center text-xs font-semibold uppercase tracking-wide text-t">
                                        Required
                                    </div>

                                    <div />
                                </div>

                                {/* Parameter Rows */}
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {parameters.map(
                                        (
                                            parameter,
                                            index
                                        ) => (
                                            <div
                                                key={
                                                    parameter.id
                                                }
                                                className="grid grid-cols-1 gap-4 bg-white p-4 md:grid-cols-[minmax(180px,1.5fr)_160px_minmax(180px,2fr)_100px_48px] md:items-center md:gap-3 md:px-4 md:py-3 dark:bg-gray-800"
                                            >
                                                {/* Parameter Name */}
                                                <div>
                                                    <label
                                                        htmlFor={`parameter-name-${parameter.id}`}
                                                        className="mb-1.5 block text-xs font-medium text-t md:hidden"
                                                    >
                                                        Parameter
                                                        Name
                                                    </label>

                                                    <input
                                                        id={`parameter-name-${parameter.id}`}
                                                        type="text"
                                                        value={
                                                            parameter.name
                                                        }
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            updateParameter(
                                                                parameter.id,
                                                                "name",
                                                                e.target
                                                                    .value
                                                            )
                                                        }
                                                        placeholder="e.g. Asset Name"
                                                        disabled={
                                                            isSubmitting
                                                        }
                                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-s outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-900"
                                                    />
                                                </div>

                                                {/* Type */}
                                                <div>
                                                    <label
                                                        htmlFor={`parameter-type-${parameter.id}`}
                                                        className="mb-1.5 block text-xs font-medium text-t md:hidden"
                                                    >
                                                        Type
                                                    </label>

                                                    <select
                                                        id={`parameter-type-${parameter.id}`}
                                                        value={
                                                            parameter.type
                                                        }
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            updateParameter(
                                                                parameter.id,
                                                                "type",
                                                                e.target
                                                                    .value as ParameterType
                                                            )
                                                        }
                                                        disabled={
                                                            isSubmitting
                                                        }
                                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-s outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-900"
                                                    >
                                                        <option value="text">
                                                            Text
                                                        </option>

                                                        <option value="textarea">
                                                            Long
                                                            Text
                                                        </option>

                                                        <option value="number">
                                                            Number
                                                        </option>

                                                        <option value="date">
                                                            Date
                                                        </option>
                                                    </select>
                                                </div>

                                                {/* Value */}
                                                <div>
                                                    <label
                                                        htmlFor={`parameter-value-${parameter.id}`}
                                                        className="mb-1.5 block text-xs font-medium text-t md:hidden"
                                                    >
                                                        Value

                                                        {parameter.required && (
                                                            <span className="ml-1 text-red-500">
                                                                *
                                                            </span>
                                                        )}
                                                    </label>

                                                    <div className="relative">
                                                        {parameter.type ===
                                                            "date" && (
                                                                <CalendarDays
                                                                    size={
                                                                        16
                                                                    }
                                                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                                                />
                                                            )}

                                                        {parameter.type ===
                                                            "textarea" ? (
                                                            <textarea
                                                                id={`parameter-value-${parameter.id}`}
                                                                rows={1}
                                                                value={
                                                                    parameter.value
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) =>
                                                                    updateParameter(
                                                                        parameter.id,
                                                                        "value",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="Enter value"
                                                                disabled={
                                                                    isSubmitting
                                                                }
                                                                className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-s outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-900"
                                                            />
                                                        ) : (
                                                            <input
                                                                id={`parameter-value-${parameter.id}`}
                                                                type={
                                                                    parameter.type
                                                                }
                                                                value={
                                                                    parameter.value
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) =>
                                                                    updateParameter(
                                                                        parameter.id,
                                                                        "value",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="Enter value"
                                                                disabled={
                                                                    isSubmitting
                                                                }
                                                                className={`w-full rounded-lg border border-gray-300 bg-white py-2 pr-3 text-sm text-s outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-900 ${parameter.type ===
                                                                        "date"
                                                                        ? "pl-9"
                                                                        : "pl-3"
                                                                    }`}
                                                            />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Required */}
                                                <div className="flex items-center md:justify-center">
                                                    <label
                                                        htmlFor={`parameter-required-${parameter.id}`}
                                                        className="flex cursor-pointer items-center gap-2"
                                                    >
                                                        <input
                                                            id={`parameter-required-${parameter.id}`}
                                                            type="checkbox"
                                                            checked={
                                                                parameter.required
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                updateParameter(
                                                                    parameter.id,
                                                                    "required",
                                                                    e.target
                                                                        .checked
                                                                )
                                                            }
                                                            disabled={
                                                                isSubmitting
                                                            }
                                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
                                                        />

                                                        <span className="text-sm text-t">
                                                            Required
                                                        </span>
                                                    </label>
                                                </div>

                                                {/* Delete */}
                                                <div className="flex justify-end md:justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeParameter(
                                                                parameter.id
                                                            )
                                                        }
                                                        disabled={
                                                            isSubmitting
                                                        }
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-900/20"
                                                        title={`Remove parameter ${index + 1}`}
                                                        aria-label={`Remove parameter ${index + 1}`}
                                                    >
                                                        <Trash2
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* =================================================
                        REFERENCE FILE
                    ================================================== */}
                    <div>
                        <label
                            htmlFor="reference_file"
                            className="mb-2 block text-sm font-medium text-s"
                        >
                            Reference File

                            <span className="ml-2 text-xs font-normal text-gray-400">
                                Optional
                            </span>
                        </label>

                        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 transition hover:border-blue-400 dark:border-gray-600 dark:bg-gray-900/50 dark:hover:border-blue-500">
                            {!referenceFile ? (
                                <label
                                    htmlFor="reference_file"
                                    className="flex cursor-pointer items-center justify-center gap-3 py-4"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                        <FileUp
                                            size={20}
                                            className="text-blue-600 dark:text-blue-400"
                                        />
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-s dark:text-white">
                                            Upload reference
                                            file
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            PDF, DOC, DOCX,
                                            XLS, XLSX, JPG,
                                            PNG or other
                                            supported files
                                        </p>
                                    </div>

                                    <input
                                        id="reference_file"
                                        type="file"
                                        className="hidden"
                                        onChange={
                                            handleFileChange
                                        }
                                    />
                                </label>
                            ) : (
                                <div className="flex items-center justify-between gap-4 rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                            <FileUp
                                                size={18}
                                                className="text-blue-600 dark:text-blue-400"
                                            />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-s dark:text-white">
                                                {
                                                    referenceFile.name
                                                }
                                            </p>

                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {(
                                                    referenceFile.size /
                                                    1024 /
                                                    1024
                                                ).toFixed(
                                                    2
                                                )}{" "}
                                                MB
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={
                                            removeFile
                                        }
                                        disabled={
                                            isSubmitting
                                        }
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-900/20"
                                        title="Remove file"
                                        aria-label="Remove file"
                                    >
                                        <X size={17} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* =================================================
                        ERROR
                    ================================================== */}
                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {/* =================================================
                        SUCCESS
                    ================================================== */}
                    {successMessage && (
                        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400">
                            {successMessage}
                        </div>
                    )}
                </div>

                {/* =====================================================
                    ACTIONS
                ====================================================== */}
                <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Reset
                    </button>

                    <button
                        type="submit"
                        disabled={
                            isSubmitting ||
                            isLoadingProcesses}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Send size={16} />

                        {isSubmitting
                            ? "Creating..."
                            : "Create Request"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AssetPurchaseRequestForm;