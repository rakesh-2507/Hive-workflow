import AssetPurchaseRequestForm from "../../components/asset-purchase/AssetPurchaseRequestForm";

function AssetPurchaseRequest() {
    return (
        <div className="min-h-full bg-gray-50 p-6 dark:bg-gray-900">
            <div className="mx-auto grid max-w-8xl">

                {/* Main Form */}
                <div className="min-w-0">

                    <AssetPurchaseRequestForm
                        onSuccess={(response) => {
                            console.log(
                                "Asset purchase request created:",
                                response
                            );
                        }}
                    />


                </div>

            </div>
        </div>
    );
}

/* =========================================================
 * Request Button
 * ========================================================= */

export default AssetPurchaseRequest;
