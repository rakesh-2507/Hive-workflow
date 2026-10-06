import { apiRequest } from "./client";

import type {
  AssetPurchaseRequestData,
  CreateAssetPurchaseRequestResponse,
} from "../types/assetPurchase";

import type { GetAssetPurchaseTaskResponse } from "../types/task";

/**
 * ============================================================
 * CREATE ASSET PURCHASE REQUEST
 * ============================================================
 *
 * POST /api/asset-purchase/requests
 *
 * Content-Type:
 * multipart/form-data
 *
 * Required fields:
 * - request_type: string
 * - process_id: integer
 * - request_data: JSON string
 *
 * Optional:
 * - reference_file: file
 */
export const createAssetPurchaseRequest = async (
  requestType: string,
  processId: number,
  requestData: AssetPurchaseRequestData,
  referenceFile?: File | null,
): Promise<CreateAssetPurchaseRequestResponse> => {
  const formData = new FormData();

  formData.append(
    "request_type",
    requestType,
  );

  formData.append(
    "process_id",
    String(processId),
  );

  formData.append(
    "request_data",
    JSON.stringify(requestData),
  );

  if (referenceFile) {
    formData.append(
      "reference_file",
      referenceFile,
    );
  }

  return apiRequest<CreateAssetPurchaseRequestResponse>(
    "/api/asset-purchase/requests",
    {
      method: "POST",
      body: formData,
    },
  );
};

/**
 * ============================================================
 * GET ASSET PURCHASE TASK DETAILS
 * ============================================================
 *
 * GET /api/asset-purchase/tasks/{task_id}
 */
export const getAssetPurchaseTask = async (
  taskId: number,
): Promise<GetAssetPurchaseTaskResponse> => {
  return apiRequest<GetAssetPurchaseTaskResponse>(
    `/api/asset-purchase/tasks/${taskId}`,
    {
      method: "GET",
    },
  );
};

/**
 * ============================================================
 * ASSET PURCHASE TRACKING
 * ============================================================
 */
export interface AssetPurchaseTracking {
  success: boolean;
  code: string;
  message: string;

  asset_id: string;
  task_id: number;

  document: {
    document_type: string;
    document_no: string;
  };

  status: number;
  status_label: string;
  overall_status: string;

  current_stage: string;
  current_stage_status: string;

  flow: {
    stage: string;
    status: string;
  }[];

  workflow: string;
  workflow_stage: string;
  wf_task_id: string;

  vijay_status?: string;

  assigned_to?: {
    uid: number;
    name: string;
    mtype: string;
  } | null;

  quotation_count: number;
  quotations_locked: boolean;

  selected_quote_id?: number | null;

  selected_quote?: {
    quote_id: number;
    vendor_name: string;
    quote_no: string;
    quoted_amount: number;
    currency?: string;
    quote_date: string;
    executive_rating: number;
  } | null;

  start_date: string;
  end_date?: string | null;
  created_date: string;
  updated_date: string;
}

/**
 * ============================================================
 * GET ASSET PURCHASE TRACKING
 * ============================================================
 *
 * GET /api/asset-purchase/{asset_id}/tracking
 *
 * asset_id is the Asset Purchase Request document number.
 */
export const getAssetPurchaseTracking = async (
  assetId: string,
): Promise<AssetPurchaseTracking> => {
  return apiRequest<AssetPurchaseTracking>(
    `/api/asset-purchase/${encodeURIComponent(assetId)}/tracking`,
    {
      method: "GET",
    },
  );
};

/**
 * ============================================================
 * ASSET PROCESS TYPE
 * ============================================================
 */
export interface AssetProcessType {
  id: string | number;
  name: string;
}

/**
 * ============================================================
 * ASSET PROCESS TYPES RESPONSE
 * ============================================================
 */
export interface AssetProcessTypesResponse {
  success: boolean;
  code: string;
  data: AssetProcessType[];
  total?: number;
}

/**
 * ============================================================
 * GET ASSET PROCESS TYPES
 * ============================================================
 *
 * GET /api/asset-process-types
 */
export const getAssetProcessTypes =
  async (): Promise<AssetProcessTypesResponse> => {
    return apiRequest<AssetProcessTypesResponse>(
      "/api/asset-process-types",
      {
        method: "GET",
      },
    );
  };