export interface AssetPurchaseRequestData {
    [key: string]: unknown;
}

export interface CreateAssetPurchaseRequestResponse {
    success: boolean;
    code: string;
    message: string;
    data: {
        document_id: number;
        document_type: string;
        document_no: string;
        request_data: AssetPurchaseRequestData;
        task_id: number;
        wf_task_id: string;
        assigned_to: number;
    };
}