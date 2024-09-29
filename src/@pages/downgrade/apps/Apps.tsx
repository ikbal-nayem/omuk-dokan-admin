import WxAlert from "@components/Alert/WxAlert";
import { ConfirmationModal } from "@components/ConfirmationModal/ConfirmationModal";
import WxMainXl from "@components/MainContentLayout/WxMainXl";
import WxNotFound from "@components/NotFound/WxNotFound";
import WxButton from "@components/WxButton";
import { WxFormHeader } from "@components/WxFormLayout";
import WxTag from "@components/WxTag";
import WxThumbnail from "@components/WxThumbnail/WxThumbnail";
import { IInstalledApp } from "@interfaces/app.interface";
import { downgrade$ } from "@rxjs/downgrade.rx";
import { IDowngradeStatus } from "@rxjs/interfaces.rx";
import { AppsService } from "services/api/Apps.service";
import { DowngradeService } from "services/api/settings/Downgrade.service";
import Preloader from "services/utils/preloader.service";
import { ToastService } from "services/utils/toastr.service";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchParamsToObject } from "utils/makeObject";
import { imageURLGenerate } from "utils/utils";
import "./Apps.scss";

const DowngradeApps = () => {
	const [downgradeStatus, setDowngradeStatus] = useState<IDowngradeStatus>(
		downgrade$.initState
	);
	const [isInstalledLoading, setInstalledLoading] = useState<boolean>(true);
	const [installedApp, setInstalledApp] = useState<IInstalledApp[]>();
	const [isDeleting, setIsDeleting] = useState<boolean>(false);
	const [confirmationModal, setConfirmationModal] = useState<boolean>(false);
	const deleteItem = useRef<IInstalledApp | null>(null);

	const [searchParams] = useSearchParams();
	const sParams: any = searchParamsToObject(searchParams);

	useEffect(() => {
		getInstalledApp();
		const subscription = downgrade$.subscribe(setDowngradeStatus);
		downgrade$.init();
		return () => subscription.unsubscribe();
	}, []);

	const getInstalledApp = () => {
		setInstalledLoading(true);
		DowngradeService.appGreaterThanLevel(sParams?.plan_id)
			.then((res) => setInstalledApp(res.body))
			.finally(() => setInstalledLoading(false));
	};

	const onClose = () => {
		setConfirmationModal(false);
		deleteItem.current = null;
	};

	const onDelete = (app: IInstalledApp) => {
		deleteItem.current = app;
		setConfirmationModal(true);
	};

	const onConfirmDelete = () => {
		setIsDeleting(true);
		AppsService.uninstall({ body: { appId: deleteItem.current?.appId } })
			.then((resp) => {
				ToastService.success(resp.message);
				onClose();
				downgrade$.setInfo(sParams?.plan_id);
				getInstalledApp();
			})
			.catch((err) => ToastService.error(err?.message))
			.finally(() => setIsDeleting(false));
	};

	return (
		<WxMainXl className="wx__apps-page">
			<WxFormHeader title="Installed apps" noBack />
			{!!installedApp?.length && (
				<WxAlert>You have to uninstall these installed apps.</WxAlert>
			)}
			<div className="wx__card wx__p-4 wx__mt-3 wx__install-app">
				{isInstalledLoading ? (
					<Preloader />
				) : installedApp?.length ? (
					<div className="install-app-conponent">
						{installedApp?.map((item, index) => (
							<div key={index} className="wx__single-app">
								<div className="wx__left wx__d-flex wx__align-items-center wx__gap-3">
									<WxThumbnail
										src={imageURLGenerate(item?.appRegisterDTO?.appIconPath)}
										noBorder
									/>
									<span className="wx__text_subtitle wx__text_semibold">
										{item?.appRegisterDTO?.appTitle} <br />
										<small className="wx__text-muted">
											{item?.appRegisterDTO?.shortDesc}
										</small>
									</span>
									{!item?.isActive ? (
										<WxTag label="Inactive" className="wx__ms-3" />
									) : null}
								</div>
								<div className="wx__ms-auto wx__me-2">
									<WxButton
										color="danger"
										variant="fill"
										onClick={() => onDelete(item)}
									>
										Uninstall
									</WxButton>
								</div>
							</div>
						))}
					</div>
				) : (
					<WxNotFound title="No installed app found" />
				)}
			</div>
			<ConfirmationModal
				onConfirm={onConfirmDelete}
				isOpen={confirmationModal}
				onClose={onClose}
				isSubmitting={isDeleting}
				title="Uninstall confirmation!"
				onConfirmLabel="Yes, uninstall"
				body={
					<span>
						Do you want to uninstall the app{" "}
						<b>{deleteItem.current?.appRegisterDTO?.appTitle}</b>?
					</span>
				}
			/>
		</WxMainXl>
	);
};

export default DowngradeApps;
