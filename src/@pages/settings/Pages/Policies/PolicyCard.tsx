import WxButton from "@components/WxButton";
import WXEditor from "@components/WxEditor/WxEditor";
import { IPolicySettings } from "@interfaces/Settings.interface";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { AdminService } from "services/api/admin/Admin.service";
import { PolicySettingService } from "services/api/settings/Policy.service";
import { ToastService } from "services/utils/toastr.service";
import useDebounce from "utils/debouncer";
import makeSlug from "utils/make-slug";

const PolicyCard = ({ item, policies }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    reset,
    watch,
  } = useForm();


  const slug = makeSlug(useDebounce(watch("slug"), 300));

  useEffect(() => {
    const policy = policies?.find(
      (p: IPolicySettings) => p.metaKey === item?.metaKey
    );
    if (policy) {
      reset({ ...policy });
      return;
    }
    reset({ slug: makeSlug(item?.title) });
  }, [policies]);

  useEffect(() => {
    setValue("slug", slug);
    if (
      !slug ||
      slug ===
        policies?.find((p: IPolicySettings) => p.metaKey === item?.metaKey)
          ?.slug
    )
      return;
    PolicySettingService.isSlugAvailable(slug).then((res) =>
      !res.body
        ? setError("slug", { type: "isExist", message: "Already used." })
        : clearErrors("slug")
    );
  }, [slug]);

  const getTemplate = () => {
    setIsLoading(true);
    AdminService.getByMetaKey(item?.metaKey)
      .then((res) => {
        setValue("description", res.body?.description);
      })
      .finally(() => setIsLoading(false));
  };

  const onSubmit = (data: IPolicySettings) => {
    setIsLoading(true);
    data.metaKey = item?.metaKey;
    data.title = item?.title;
    PolicySettingService.save(data)
      .then((res) => ToastService.success("Policy saved successfully"))
      .catch((err) => ToastService.error(err.message))
      .finally(() => setIsLoading(false));
  };

  return (
		<div className="card wx__p-3 wx__mt-4 single_editor">
			<form onSubmit={handleSubmit(onSubmit)} noValidate>
				<div className="d-flex wx__justify-content-between wx__align-items-center wx__mb-3">
					<h6 className="wx__text_heading wx__text_semibold wx__mb-0">
						{item?.title}
					</h6>
					<WxButton
						variant="none"
						color="secondary"
						onClick={getTemplate}
						disabled={isLoading}
					>
						Create From Template
					</WxButton>
				</div>

				<Controller
					control={control}
					name="description"
					render={({ field: { onChange, value }, fieldState: { error } }) => (
						<WXEditor
							onEditorChange={onChange}
							label="Description"
							isRequired
							defaultValue={value}
							color={error ? "danger" : "secondary"}
							errorMessage={
								error && (error?.message || "Description is required")
							}
						/>
					)}
					rules={{ required: true }}
				/>

				{/* <div className="col-md-12 col-sm-12 wx__mt-3">
          <WxInput
            isRequired
            label="Slug"
            noMargin
            registerProperty={{ ...register("slug", { required: true }) }}
            color={errors?.slug ? "danger" : "secondary"}
            errorMessage={
              errors?.slug && (errors?.slug?.message || "Slug is required")
            }
          />
        </div>
        <div className="">
          <p className="wx__text_subtitle wx__text_regular">
            {store_domain}/<strong>{slug || "<slug will be here>"}</strong>
          </p>
        </div> */}
				<div className="d-flex wx__justify-content-end">
					<WxButton
						className="wx__me-3"
						variant="outline"
						color="secondary"
						disabled={isLoading}
						onClick={() => reset({ description: "", slug: "" })}
					>
						Reset
					</WxButton>
					<WxButton variant="fill" type="submit" disabled={isLoading}>
						Save
					</WxButton>
				</div>
			</form>
		</div>
	);
};

export default PolicyCard;
