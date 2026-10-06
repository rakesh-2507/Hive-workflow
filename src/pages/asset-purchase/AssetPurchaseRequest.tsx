import { useState } from "react";

import {
    Wrench,
    ShoppingCart,
    Package,
    RefreshCcw,
} from "lucide-react";

import AssetPurchaseRequestForm from "../../components/asset-purchase/AssetPurchaseRequestForm";

type RequestType =
    | "asset-purchase"
    | "asset-repair"
    | "asset-return"
    | "asset-replacement";

function AssetPurchaseRequest() {
    const [selectedRequest, setSelectedRequest] =
        useState<RequestType>("asset-purchase");

    return (
        <div className="min-h-full bg-gray-50 p-6 dark:bg-gray-900">
            <div className="mx-auto grid max-w-8xl grid-cols-[minmax(0,1fr)_260px] gap-6">

                {/* Main Form */}
                <div className="min-w-0">
                    {selectedRequest === "asset-purchase" && (
                        <AssetPurchaseRequestForm
                            onSuccess={(response) => {
                                console.log(
                                    "Asset purchase request created:",
                                    response
                                );
                            }}
                        />
                    )}

                    {selectedRequest === "asset-repair" && (
                        <MockAssetRepairForm />
                    )}

                    {selectedRequest === "asset-return" && (
                        <MockComingSoonForm
                            title="Asset Return Request"
                            description="Asset return request form will be available here."
                        />
                    )}

                    {selectedRequest === "asset-replacement" && (
                        <MockComingSoonForm
                            title="Asset Replacement Request"
                            description="Asset replacement request form will be available here."
                        />
                    )}
                </div>

                {/* Right Side Request Buttons */}
                <div className="h-fit rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                        Asset Requests
                    </h2>

                    <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                        Select a request type
                    </p>

                    <div className="space-y-2">
                        <RequestButton
                            icon={<ShoppingCart size={18} />}
                            label="Asset Purchase Request"
                            active={selectedRequest === "asset-purchase"}
                            onClick={() =>
                                setSelectedRequest("asset-purchase")
                            }
                        />

                        <RequestButton
                            icon={<Wrench size={18} />}
                            label="Asset Repair Request"
                            active={selectedRequest === "asset-repair"}
                            onClick={() =>
                                setSelectedRequest("asset-repair")
                            }
                        />

                        <RequestButton
                            icon={<Package size={18} />}
                            label="Asset Return Request"
                            active={selectedRequest === "asset-return"}
                            onClick={() =>
                                setSelectedRequest("asset-return")
                            }
                        />

                        <RequestButton
                            icon={<RefreshCcw size={18} />}
                            label="Asset Replacement Request"
                            active={
                                selectedRequest === "asset-replacement"
                            }
                            onClick={() =>
                                setSelectedRequest("asset-replacement")
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

/* =========================================================
 * Request Button
 * ========================================================= */

type RequestButtonProps = {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
};

function RequestButton({
    icon,
    label,
    active,
    onClick,
}: RequestButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition ${
                active
                    ? "border-cyan-500 bg-cyan-50 text-cyan-700 dark:border-cyan-400 dark:bg-cyan-950/40 dark:text-cyan-300"
                    : "border-gray-200 bg-white text-gray-700 hover:border-cyan-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-cyan-600 dark:hover:bg-gray-750"
            }`}
        >
            <span className={active ? "text-cyan-600" : "text-gray-500"}>
                {icon}
            </span>

            <span>{label}</span>
        </button>
    );
}

/* =========================================================
 * MOCK ASSET REPAIR FORM
 * ========================================================= */

function MockAssetRepairForm() {
    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-700">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Asset Repair Request
                </h1>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Mock repair request form for testing the asset workflow.
                </p>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">

                {/* Asset */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Asset
                    </label>

                    <select
                        defaultValue=""
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="" disabled>
                            Select asset
                        </option>
                        <option value="AST-1001">
                            Laptop - AST-1001
                        </option>
                        <option value="AST-1002">
                            Monitor - AST-1002
                        </option>
                        <option value="AST-1003">
                            Desktop - AST-1003
                        </option>
                    </select>
                </div>

                {/* Asset Type */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Asset Type
                    </label>

                    <input
                        type="text"
                        defaultValue="IT Equipment"
                        readOnly
                        className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    />
                </div>

                {/* Issue */}
                <div className="md:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Issue / Problem
                    </label>

                    <input
                        type="text"
                        defaultValue="Laptop is not powering on"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* Priority */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Priority
                    </label>

                    <select
                        defaultValue="Medium"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Critical</option>
                    </select>
                </div>

                {/* Preferred Date */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Preferred Repair Date
                    </label>

                    <input
                        type="date"
                        defaultValue="2026-10-08"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description
                    </label>

                    <textarea
                        rows={5}
                        defaultValue="The assigned laptop suddenly stopped powering on. Charger has been tested with another device and appears to be working."
                        className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* Location */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Asset Location
                    </label>

                    <input
                        type="text"
                        defaultValue="Hyderabad Office - 2nd Floor"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* Contact */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Contact Person
                    </label>

                    <input
                        type="text"
                        defaultValue="Raj Kumar"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 border-t border-gray-200 pt-5 md:col-span-2 dark:border-gray-700">
                    <button
                        type="button"
                        className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            console.log("Mock repair request:", {
                                asset_id: "AST-1001",
                                asset_type: "IT Equipment",
                                issue: "Laptop is not powering on",
                                priority: "Medium",
                                preferred_date: "2026-10-08",
                                description:
                                    "The assigned laptop suddenly stopped powering on.",
                                location: "Hyderabad Office - 2nd Floor",
                                contact_person: "Raj Kumar",
                            });
                        }}
                        className="rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-cyan-700"
                    >
                        Submit Repair Request
                    </button>
                </div>
            </div>
        </div>
    );
}

/* =========================================================
 * MOCK OTHER REQUEST
 * ========================================================= */

type MockComingSoonFormProps = {
    title: string;
    description: string;
};

function MockComingSoonForm({
    title,
    description,
}: MockComingSoonFormProps) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {title}
            </h1>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {description}
            </p>

            <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-600">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Mock form will be added here.
                </p>
            </div>
        </div>
    );
}

export default AssetPurchaseRequest;
