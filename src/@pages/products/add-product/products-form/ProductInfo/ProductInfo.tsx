import WxEditor from "@components/WxEditor/WxEditor";
import WxInput from "@components/WxInput";
import WxSwitch from "@components/WxSwitch";
import { Controller, useFormContext } from "react-hook-form";
import "./ProductInfo.scss";

const ProductInfo = () => {
	const {
		register,
		control,
		watch,
		formState: { errors },
	} = useFormContext();

	const hasSummary = watch("hasSummary");

	return (
		<div className="wx__card wx__p-3 wx__mt-4">
			<WxInput
				label="Product Title"
				isRequired
				className=""
				registerProperty={{ ...register("title") }}
				errorMessage={errors.title?.message}
				color={errors.title ? "danger" : "secondary"}
			/>
			<div className="wx__form_group">
				<label>Product Description</label>
				<Controller
					control={control}
					name="description"
					render={({ field: { onChange, value } }) => (
						<WxEditor onEditorChange={onChange} defaultValue={value} />
					)}
				/>
			</div>

			<div className="wx__mt-3" style={{ maxWidth: "90%" }}>
				<WxSwitch
					label="Add Product Summary"
					checkedTitle="Yes"
					unCheckedTitle="No"
					registerProperty={{ ...register("hasSummary") }}
				/>
			</div>

			{hasSummary ? (
				<div className="wx__form_group wx__mt-4">
					<label>Product Summary</label>
					<Controller
						control={control}
						name="summary"
						render={({ field: { onChange, value } }) => (
							<WxEditor onEditorChange={onChange} defaultValue={value} />
						)}
					/>
				</div>
			) : null}
		</div>
	);
};

export default ProductInfo;
