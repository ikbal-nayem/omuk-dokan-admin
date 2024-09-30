import WxHr from "@components/WxHr";
import WxInput from "@components/WxInput";
import { ReactComponent as TakaSign } from "assets/svg/taka.svg";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import "./ProductPricing.scss";

const ProductPricing = () => {
	const {
		register,
		formState: { errors },
		watch,
		setError,
		clearErrors,
	} = useFormContext();

	const [sPrice, rPrice] = watch(["sellingPrice", "regularPrice"]);

	useEffect(() => {
		if (+rPrice > 0 && Number(sPrice) >= Number(rPrice)) {
			setError("sellingPrice", {
				message: "'Selling Price' must be less than 'Compare at price'",
				type: "invalid",
			});
			setError("regularPrice", {
				message: "'Selling Price' must be less than 'Compare at price'",
				type: "invalid",
			});
			return;
		}
		clearErrors(["sellingPrice", "regularPrice"]);
	}, [sPrice, rPrice, errors]);

	return (
		<div className="wx__card product_pricing wx__p-3 wx__mt-4">
			<h6 className="wx__text_semibold wx__text_h6 wx__mb-0">Pricing</h6>
			<div className="wx__row">
				<div className="wx__col-md-6 wx__mt-3">
					<WxInput
						label="Selling price"
						endIcon={<TakaSign />}
						min={0}
						noMargin
						type="number"
						registerProperty={{
							...register("sellingPrice", {
								valueAsNumber: true,
							}),
						}}
						onFocus={(e) => e.target.select()}
						errorMessage={errors.sellingPrice?.message}
						color={errors.sellingPrice ? "danger" : "secondary"}
					/>
				</div>
				<div className="wx__col-md-6 wx__mt-3">
					<WxInput
						label="Cost per item"
						endIcon={<TakaSign />}
						min={0}
						noMargin
						type="number"
						registerProperty={{
							...register("costPrice", { valueAsNumber: true }),
						}}
						helpText="Customers won’t see this"
						onFocus={(e) => e.target.select()}
						errorMessage={errors.costPrice?.message}
						color={errors.costPrice ? "danger" : "secondary"}
					/>
				</div>
				<WxHr />
				<div className="col-md-6">
					<WxInput
						label="Compare at price"
						endIcon={<TakaSign />}
						noMargin
						min={0}
						type="number"
						registerProperty={{
							...register("regularPrice", {
								valueAsNumber: true,
							}),
						}}
						onFocus={(e) => e.target.select()}
						errorMessage={
							errors.regularPrice?.message || errors.comparePrices?.message
						}
						color={
							errors.regularPrice || errors.comparePrices
								? "danger"
								: "secondary"
						}
					/>
				</div>
			</div>
		</div>
	);
};

export default ProductPricing;
